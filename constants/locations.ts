import { isInGambia } from '@/constants/geo';
import type { Area } from '@/types/models';

// Towns people recognise, with approximate centre coordinates and their
// local government area. Used to suggest the area (and a "near" town) from
// a GPS fix; the user can always change the suggestion.
export type Town = { name: string; area: Area; lat: number; lng: number };

export const TOWNS: Town[] = [
  // Banjul City
  { name: 'Banjul', area: 'Banjul City', lat: 13.4549, lng: -16.579 },
  // Kanifing Municipal
  { name: 'Serekunda', area: 'Kanifing Municipal', lat: 13.4382, lng: -16.6781 },
  { name: 'Bakau', area: 'Kanifing Municipal', lat: 13.4781, lng: -16.6819 },
  { name: 'Kanifing', area: 'Kanifing Municipal', lat: 13.4469, lng: -16.674 },
  { name: 'Fajara', area: 'Kanifing Municipal', lat: 13.468, lng: -16.698 },
  { name: 'Kololi', area: 'Kanifing Municipal', lat: 13.4497, lng: -16.7186 },
  { name: 'Kotu', area: 'Kanifing Municipal', lat: 13.4573, lng: -16.7065 },
  { name: 'Latrikunda', area: 'Kanifing Municipal', lat: 13.4285, lng: -16.6595 },
  { name: 'Dippa Kunda', area: 'Kanifing Municipal', lat: 13.4425, lng: -16.6585 },
  { name: 'Bundung', area: 'Kanifing Municipal', lat: 13.4185, lng: -16.682 },
  // West Coast (Brikama)
  { name: 'Brikama', area: 'West Coast (Brikama)', lat: 13.271, lng: -16.649 },
  { name: 'Sukuta', area: 'West Coast (Brikama)', lat: 13.4105, lng: -16.7085 },
  { name: 'Brufut', area: 'West Coast (Brikama)', lat: 13.381, lng: -16.75 },
  { name: 'Tanji', area: 'West Coast (Brikama)', lat: 13.353, lng: -16.794 },
  { name: 'Lamin', area: 'West Coast (Brikama)', lat: 13.3865, lng: -16.643 },
  { name: 'Yundum', area: 'West Coast (Brikama)', lat: 13.3405, lng: -16.689 },
  { name: 'Busumbala', area: 'West Coast (Brikama)', lat: 13.351, lng: -16.668 },
  { name: 'Sanyang', area: 'West Coast (Brikama)', lat: 13.271, lng: -16.776 },
  { name: 'Gunjur', area: 'West Coast (Brikama)', lat: 13.183, lng: -16.733 },
  { name: 'Kartong', area: 'West Coast (Brikama)', lat: 13.09, lng: -16.765 },
  { name: 'Sibanor', area: 'West Coast (Brikama)', lat: 13.218, lng: -16.205 },
  { name: 'Bwiam', area: 'West Coast (Brikama)', lat: 13.232, lng: -16.05 },
  // North Bank (Kerewan)
  { name: 'Barra', area: 'North Bank (Kerewan)', lat: 13.483, lng: -16.545 },
  { name: 'Essau', area: 'North Bank (Kerewan)', lat: 13.481, lng: -16.53 },
  { name: 'Albreda', area: 'North Bank (Kerewan)', lat: 13.334, lng: -16.385 },
  { name: 'Kerewan', area: 'North Bank (Kerewan)', lat: 13.489, lng: -16.091 },
  { name: 'Ngeyen Sanjal', area: 'North Bank (Kerewan)', lat: 13.55, lng: -15.72 },
  { name: 'Farafenni', area: 'North Bank (Kerewan)', lat: 13.567, lng: -15.6 },
  // Lower River (Mansakonko)
  { name: 'Soma', area: 'Lower River (Mansakonko)', lat: 13.433, lng: -15.533 },
  { name: 'Mansakonko', area: 'Lower River (Mansakonko)', lat: 13.443, lng: -15.535 },
  { name: 'Pakalinding', area: 'Lower River (Mansakonko)', lat: 13.455, lng: -15.548 },
  { name: 'Kwinella', area: 'Lower River (Mansakonko)', lat: 13.398, lng: -15.807 },
  // Central River North (Kuntaur)
  { name: 'Kaur', area: 'Central River North (Kuntaur)', lat: 13.7, lng: -15.33 },
  { name: 'Njau', area: 'Central River North (Kuntaur)', lat: 13.63, lng: -15.12 },
  { name: 'Kuntaur', area: 'Central River North (Kuntaur)', lat: 13.667, lng: -14.883 },
  { name: 'Wassu', area: 'Central River North (Kuntaur)', lat: 13.69, lng: -14.87 },
  // Central River South (Janjanbureh)
  { name: 'Janjanbureh', area: 'Central River South (Janjanbureh)', lat: 13.533, lng: -14.767 },
  { name: 'Brikama Ba', area: 'Central River South (Janjanbureh)', lat: 13.53, lng: -14.92 },
  { name: 'Bansang', area: 'Central River South (Janjanbureh)', lat: 13.433, lng: -14.65 },
  // Upper River (Basse)
  { name: 'Basse Santa Su', area: 'Upper River (Basse)', lat: 13.31, lng: -14.22 },
  { name: 'Gambissara', area: 'Upper River (Basse)', lat: 13.24, lng: -14.32 },
  { name: 'Diabugu', area: 'Upper River (Basse)', lat: 13.38, lng: -14.07 },
  { name: 'Fatoto', area: 'Upper River (Basse)', lat: 13.35, lng: -13.91 },
  { name: 'Koina', area: 'Upper River (Basse)', lat: 13.47, lng: -13.86 },
];

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  // Equirectangular approximation: accurate to well under 1% over these distances.
  const toRad = Math.PI / 180;
  const x = (bLng - aLng) * toRad * Math.cos(((aLat + bLat) / 2) * toRad);
  const y = (bLat - aLat) * toRad;
  return Math.sqrt(x * x + y * y) * 6371;
}

/**
 * Suggests the local government area (and nearest town) for a GPS point by
 * nearest known town. Returns null outside The Gambia. It's a suggestion:
 * near LGA borders it can be wrong, so the form keeps it editable.
 */
export function suggestLocation(lat: number, lng: number): { area: Area; town: string; km: number } | null {
  if (!isInGambia(lat, lng)) return null;
  let best: Town | null = null;
  let bestKm = Infinity;
  for (const town of TOWNS) {
    const km = distanceKm(lat, lng, town.lat, town.lng);
    if (km < bestKm) {
      best = town;
      bestKm = km;
    }
  }
  return best ? { area: best.area, town: best.name, km: bestKm } : null;
}
