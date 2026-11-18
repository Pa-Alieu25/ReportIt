import { create } from 'zustand';

import type { Report } from '@/types/models';

// The signed-in user's own reports, newest first. Filled by a single
// Firestore listener (hooks/use-my-reports-sync.ts) and shared by Home,
// My Reports, Profile and the status-change notifications.
type MyReportsState = {
  reports: Report[];
  // 'loading' until the first snapshot for the current user arrives.
  status: 'loading' | 'ready' | 'error';
  setReports: (reports: Report[]) => void;
  setError: () => void;
  reset: () => void;
};

export const useMyReportsStore = create<MyReportsState>((set) => ({
  reports: [],
  status: 'loading',
  setReports: (reports) => set({ reports, status: 'ready' }),
  setError: () => set({ status: 'error' }),
  reset: () => set({ reports: [], status: 'loading' }),
}));
