import { getDocsFromServer, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect } from 'react';

import { reportsCollection } from '@/lib/firestore';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyReportsStore } from '@/store/useMyReportsStore';

function myReportsQuery(uid: string) {
  return query(reportsCollection, where('userId', '==', uid), orderBy('createdAt', 'desc'));
}

/**
 * Pull-to-refresh: forces a round trip to the server (the live listener
 * normally keeps things current, but this reassures users and recovers
 * quickly after a flaky connection). Throws on failure so the caller can say so.
 */
export async function refreshMyReports(uid: string): Promise<void> {
  const snapshot = await getDocsFromServer(myReportsQuery(uid));
  useMyReportsStore.getState().setReports(snapshot.docs.map((doc) => doc.data()));
}

// The one listener on the signed-in user's reports (userId + createdAt
// index, see firestore.indexes.json). Mounted once in the root layout.
export function useMyReportsSync() {
  const user = useAuthStore((state) => state.user);
  const setReports = useMyReportsStore((state) => state.setReports);
  const setError = useMyReportsStore((state) => state.setError);
  const reset = useMyReportsStore((state) => state.reset);

  useEffect(() => {
    // Clear on every user change so one user's reports never flash for another.
    reset();
    if (!user) return;

    const reportsQuery = myReportsQuery(user.uid);

    const unsubscribe = onSnapshot(
      reportsQuery,
      (snapshot) => setReports(snapshot.docs.map((doc) => doc.data())),
      (error) => {
        console.error('Failed to load your reports:', error);
        setError();
      }
    );

    return unsubscribe;
  }, [user, setReports, setError, reset]);
}
