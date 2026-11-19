import type { IconName } from '@/components/ui/Icon';
import type { Category } from '@/types/models';

// Single source of truth for the category list, shared by the report form
// and the admin dashboard's category filter.
export const CATEGORY_ORDER: Category[] = [
  'Potholes',
  'Water Leak',
  'Gutters',
  'Flooding',
  'Streetlights',
  'Power Outage',
  'Illegal Dumping',
  'Public Facility',
  'Other',
];

type CategoryMeta = {
  /** Short, everyday label for tiles and chips. */
  shortLabel: string;
  icon: IconName;
  /** Icon colour on a light tile; the tile background is a 12% tint of it. */
  tint: string;
};

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Potholes: { shortLabel: 'Roads', icon: 'road', tint: '#0B5F53' },
  'Water Leak': { shortLabel: 'Water', icon: 'water', tint: '#1D6FB8' },
  Gutters: { shortLabel: 'Gutters', icon: 'gutter', tint: '#3B6E8F' },
  Flooding: { shortLabel: 'Flooding', icon: 'flood', tint: '#1E5AA8' },
  Streetlights: { shortLabel: 'Lights', icon: 'light', tint: '#B45309' },
  'Power Outage': { shortLabel: 'Power', icon: 'power', tint: '#A16207' },
  'Illegal Dumping': { shortLabel: 'Waste', icon: 'waste', tint: '#0F7A69' },
  'Public Facility': { shortLabel: 'Facilities', icon: 'building', tint: '#5B4B8A' },
  Other: { shortLabel: 'Other', icon: 'other', tint: '#4B5563' },
};

// The six quick-pick tiles on Home, in poster order.
export const POPULAR_CATEGORIES: Category[] = [
  'Potholes',
  'Illegal Dumping',
  'Streetlights',
  'Water Leak',
  'Flooding',
  'Power Outage',
];

export function isCategory(value: unknown): value is Category {
  return typeof value === 'string' && (CATEGORY_ORDER as string[]).includes(value);
}
