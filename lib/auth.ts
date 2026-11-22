import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type AuthError,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { auth } from '@/lib/firebase';
import { usersCollection } from '@/lib/firestore';

function getFriendlyAuthErrorMessage(error: unknown): string {
  const code = (error as Partial<AuthError>)?.code;

  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email is already registered. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/missing-email':
      return 'Please enter your email address.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// True while signUp() is still writing the new user's profile, so the
// profile listener doesn't mistake the not-yet-written profile for a missing one.
let signUpInProgress = false;

export function isSignUpInProgress(): boolean {
  return signUpInProgress;
}

function fallbackName(user: FirebaseUser): string {
  const fromAuth = user.displayName?.trim();
  if (fromAuth) return fromAuth.slice(0, 100);
  const fromEmail = user.email?.split('@')[0]?.trim();
  return fromEmail ? fromEmail.slice(0, 100) : 'ReportIt user';
}

// Creates users/{uid} if it doesn't exist yet. Safe to call more than once:
// it never overwrites an existing profile (which may hold an admin role).
export async function ensureUserProfile(user: FirebaseUser, name?: string): Promise<void> {
  const ref = doc(usersCollection, user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  await setDoc(ref, {
    uid: user.uid,
    name: name?.trim() || fallbackName(user),
    email: user.email ?? '',
    role: 'citizen',
    createdAt: serverTimestamp(),
  });
}

export async function signUp(name: string, email: string, password: string) {
  signUpInProgress = true;
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Keep the name on the auth account too, so a profile can be rebuilt
    // from it if the Firestore write below fails.
    await updateProfile(credential.user, { displayName: name }).catch((error) => {
      console.error('Failed to set display name:', error);
    });

    try {
      await ensureUserProfile(credential.user, name);
    } catch (error) {
      // The account exists; the profile listener retries on next launch.
      console.error('Failed to create user profile:', error);
    }

    return credential.user;
  } catch (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  } finally {
    signUpInProgress = false;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
}

// Firebase sends the reset link itself. With email enumeration protection on,
// it succeeds even for unknown addresses, so the UI must not say whether an
// account exists.
export async function sendPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(getFriendlyAuthErrorMessage(error));
  }
}

// Rules allow a user to change only their own name.
export async function updateUserName(user: FirebaseUser, name: string) {
  const trimmed = name.trim().slice(0, 100);
  await updateDoc(doc(usersCollection, user.uid), { name: trimmed });
  // Keep the auth display name in step; not critical if it fails.
  await updateProfile(user, { displayName: trimmed }).catch(() => {});
}
