import type { Area } from '@/types/models';

// Single source of truth for the area list, shared by the report form and
// the admin dashboard's area filter. Ordered roughly west to east.
export const AREA_ORDER: Area[] = [
  'Banjul City',
  'Kanifing Municipal',
  'West Coast (Brikama)',
  'North Bank (Kerewan)',
  'Lower River (Mansakonko)',
  'Central River North (Kuntaur)',
  'Central River South (Janjanbureh)',
  'Upper River (Basse)',
];
