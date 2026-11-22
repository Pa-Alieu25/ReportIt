import type { Status } from '@/types/models';

// Status colours live in the design tokens (theme/tokens.js, statusColors()).

// The linear progression shown by the report timeline. 'Rejected' is a
// terminal state, not a step in this progression, and is rendered as a
// distinct end state. Use ALL_STATUSES for pickers/filters that need every
// known status, including 'Rejected'.
export const STATUS_ORDER: Status[] = ['Pending', 'Under Review', 'In Progress', 'Resolved'];

export const ALL_STATUSES: Status[] = [...STATUS_ORDER, 'Rejected'];
