import { useEffect, useRef } from 'react';

import {
  getNotificationsEnabled,
  notifyStatusChange,
  requestNotificationPermissions,
} from '@/lib/notifications';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyReportsStore } from '@/store/useMyReportsStore';
import { useNotificationPreferenceStore } from '@/store/useNotificationPreferenceStore';
import type { Status } from '@/types/models';

// Fires a local notification whenever one of the signed-in user's reports
// actually CHANGES status. Reads the shared my-reports store rather than
// opening its own listener. The first ready snapshot (and the first one
// after notifications are switched back on) only sets a baseline, and a
// report new to the baseline never triggers a notification.
export function useReportStatusNotifications() {
  const user = useAuthStore((state) => state.user);
  const reports = useMyReportsStore((state) => state.reports);
  const reportsReady = useMyReportsStore((state) => state.status === 'ready');
  const notificationsEnabled = useNotificationPreferenceStore((state) => state.enabled);
  const setNotificationsEnabledInStore = useNotificationPreferenceStore(
    (state) => state.setEnabled
  );

  // null = no baseline yet.
  const lastKnownStatuses = useRef<Map<string, Status> | null>(null);

  useEffect(() => {
    getNotificationsEnabled().then(setNotificationsEnabledInStore);
  }, [setNotificationsEnabledInStore]);

  // Ask for permission once per signed-in user while notifications are on.
  // Non-blocking: permission only affects whether the OS shows them.
  useEffect(() => {
    if (user && notificationsEnabled) void requestNotificationPermissions();
  }, [user, notificationsEnabled]);

  // Drop the baseline on user change or when notifications are switched
  // off, so the next comparison never uses stale statuses.
  useEffect(() => {
    lastKnownStatuses.current = null;
  }, [user, notificationsEnabled]);

  useEffect(() => {
    if (!user || !notificationsEnabled || !reportsReady) {
      lastKnownStatuses.current = null;
      return;
    }

    const previous = lastKnownStatuses.current;
    const next = new Map<string, Status>();

    for (const report of reports) {
      next.set(report.id, report.status);
      const previousStatus = previous?.get(report.id);
      if (previousStatus && previousStatus !== report.status) {
        notifyStatusChange(report.title, report.status);
      }
    }

    lastKnownStatuses.current = next;
  }, [user, notificationsEnabled, reportsReady, reports]);
}
