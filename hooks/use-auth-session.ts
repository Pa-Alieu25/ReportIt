import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect } from 'react';

import { ensureUserProfile, isSignUpInProgress } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { usersCollection } from '@/lib/firestore';
import { useAuthStore } from '@/store/useAuthStore';

// Keeps useAuthStore in sync with Firebase Auth and the user's profile doc.
//
// `loading` only waits for Firebase Auth (which works offline from the
// persisted session), never for the profile, so the app can't get stuck on
// the splash spinner when Firestore is unreachable. The profile arrives
// through a live listener, so it also fills in as soon as sign-up finishes
// writing it, and picks up role changes made in the console.
export function useAuthSession() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setProfile = useAuthStore((state) => state.setProfile);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) setProfile(null);
      setLoading(false);
    });
    return unsubscribe;
  }, [setUser, setProfile, setLoading]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      doc(usersCollection, user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data());
          return;
        }

        setProfile(null);

        // Confirmed missing on the server (not just absent from the local
        // cache) and not mid sign-up: rebuild it from the auth account.
        if (!snapshot.metadata.fromCache && !isSignUpInProgress()) {
          ensureUserProfile(user).catch((error) => {
            console.error('Failed to restore missing user profile:', error);
          });
        }
      },
      (error) => {
        console.error('Failed to load user profile:', error);
      }
    );

    return unsubscribe;
  }, [user, setProfile]);
}
