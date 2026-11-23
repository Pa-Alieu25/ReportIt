// Geographic constants for The Gambia. Bounds are [[south, west], [north, east]]
// in Leaflet's [lat, lng] order.

type Bounds = [[number, number], [number, number]];

// The country's extent (about 13.06–13.83°N, 16.83–13.79°W).
export const GAMBIA_BOUNDS: Bounds = [
  [13.05, -16.85],
  [13.84, -13.78],
];

// How far the map may be panned: the country plus a small margin, so
// border towns aren't pinned against the screen edge.
export const GAMBIA_MAX_BOUNDS: Bounds = [
  [12.9, -17.1],
  [14.0, -13.6],
];

// Default view: centred on Serrekunda/Kanifing, with a box that keeps
// Banjul (13.45, -16.58) and Brikama (13.27, -16.65) comfortably in view.
// The box is symmetric around the centre so fitting it keeps that centre.
export const DEFAULT_MAP_CENTER: [number, number] = [13.4, -16.66];
export const DEFAULT_MAP_BOUNDS: Bounds = [
  [13.24, -16.75],
  [13.56, -16.57],
];

// True for points inside The Gambia's bounding box. This is a box, not the
// border line, so it also accepts parts of Senegal north and south of the
// river; good enough to drop test data from elsewhere (e.g. Ghana).
export function isInGambia(lat: number, lng: number): boolean {
  const [[south, west], [north, east]] = GAMBIA_BOUNDS;
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= south &&
    lat <= north &&
    lng >= west &&
    lng <= east
  );
}
