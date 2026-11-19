import tokens from './tokens';

import type { Status } from '@/types/models';

export const { colors, fontFamily, typography, spacing, radius, touchTarget, shadows } = tokens;

export type TypographyVariant = keyof typeof typography;
export type FontWeightName = keyof typeof fontFamily;

const UNKNOWN_STATUS = { fg: colors.text.secondary, bg: colors.surface.muted, solid: '#6B7280' };

// Firestore has no schema enforcement, so look statuses up defensively.
export function statusColors(status: string): { fg: string; bg: string; solid: string } {
  return (colors.status as Record<string, typeof UNKNOWN_STATUS>)[status] ?? UNKNOWN_STATUS;
}

export function isKnownStatus(status: string): status is Status {
  return status in colors.status;
}
