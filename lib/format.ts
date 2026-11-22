import type { Timestamp } from 'firebase/firestore';

// Pending writes can briefly hold a null serverTimestamp() sentinel in the
// local cache before the server confirms it, so these stay defensive even
// for fields typed as an always-present Timestamp.
function toDate(timestamp: Timestamp | Date | null | undefined): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate?.() ?? null;
}

export function formatDate(timestamp: Timestamp | Date | null | undefined): string {
  const date = toDate(timestamp);
  if (!date) return 'Just now';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(timestamp: Timestamp | Date | null | undefined): string {
  const date = toDate(timestamp);
  if (!date) return 'Just now';
  return `${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

/** "Just now", "5 min ago", "3 hours ago", "Yesterday", "4 days ago", then a date. */
export function formatRelative(timestamp: Timestamp | Date | null | undefined, now = new Date()): string {
  const date = toDate(timestamp);
  if (!date) return 'Just now';
  const minutes = Math.round((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDate(date);
}
