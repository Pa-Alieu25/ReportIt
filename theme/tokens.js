/**
 * ReportIT design tokens: the single source of truth for colour, type,
 * spacing, radius and elevation. Plain CommonJS so both tailwind.config.js
 * (NativeWind classes) and TypeScript code (theme/index.ts) can use it.
 *
 * Colour roles follow the ReportIT poster: deep green is the brand surface,
 * teal is the action/accent colour, orange is reserved for the logo check
 * mark and rare key highlights. Every text/background pairing used in the
 * app meets WCAG AA (4.5:1).
 */

const brand = {
  green950: '#04211C',
  green900: '#062B25',
  green800: '#0B3D35', // hero cards, brand surfaces
  green700: '#0F4D43',
  teal700: '#0B5F53', // pressed state
  teal600: '#0F7A69', // primary actions, active tab, links
  teal500: '#14957F', // decorative accents only (not for text)
  teal300: '#7FE0C9', // accents on dark green
  teal100: '#CDEBE3',
  teal50: '#E6F4F0',
  orange500: '#F5A524', // logo check mark, key highlights only
  orange100: '#FDF0D5',
};

const colors = {
  brand,
  surface: {
    background: '#F5F7F4', // app background (warm off-white)
    card: '#FFFFFF',
    muted: '#EEF2EF',
    overlay: 'rgba(4, 33, 28, 0.45)',
  },
  text: {
    primary: '#0F1F1C',
    secondary: '#3D4D49',
    muted: '#5B6B67',
    placeholder: '#6B7975',
    inverse: '#FFFFFF',
    inverseMuted: '#C2D9D3',
    link: brand.teal600,
  },
  border: {
    default: '#DCE4E0',
    strong: '#B9C6C1',
    focus: brand.teal600,
  },
  feedback: {
    success: { fg: '#166534', bg: '#DCFCE7', border: '#86EFAC' },
    error: { fg: '#B42318', bg: '#FEE4E2', border: '#FDA29B' },
    warning: { fg: '#92400E', bg: '#FEF3C7', border: '#FCD34D' },
    info: { fg: '#1E40AF', bg: '#DBEAFE', border: '#93C5FD' },
  },
  // fg on bg passes AA; `solid` is for dots, pins and timeline markers.
  status: {
    Pending: { fg: '#92400E', bg: '#FEF3C7', solid: '#F59E0B' },
    'Under Review': { fg: '#1E40AF', bg: '#DBEAFE', solid: '#3B82F6' },
    'In Progress': { fg: '#3730A3', bg: '#E0E7FF', solid: '#6366F1' },
    Resolved: { fg: '#166534', bg: '#DCFCE7', solid: '#16A34A' },
    Rejected: { fg: '#991B1B', bg: '#FEE2E2', solid: '#DC2626' },
  },
};

// Poppins: a geometric sans close to the poster's lettering. On Android a
// custom font's weight is chosen by family name, not fontWeight, so each
// weight is its own family.
const fontFamily = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

// size / lineHeight in dp. Text scales with the phone's font size setting.
const typography = {
  display: { fontSize: 30, lineHeight: 38, weight: 'bold' },
  h1: { fontSize: 24, lineHeight: 32, weight: 'bold' },
  h2: { fontSize: 20, lineHeight: 28, weight: 'semibold' },
  h3: { fontSize: 17, lineHeight: 24, weight: 'semibold' },
  body: { fontSize: 15, lineHeight: 22, weight: 'regular' },
  bodyStrong: { fontSize: 15, lineHeight: 22, weight: 'medium' },
  label: { fontSize: 14, lineHeight: 20, weight: 'medium' },
  caption: { fontSize: 12, lineHeight: 16, weight: 'regular' },
  overline: { fontSize: 11, lineHeight: 16, weight: 'semibold', letterSpacing: 0.8 },
};

// 4-pt scale. Matches Tailwind's default spacing (p-1 = 4, p-4 = 16, ...).
const spacing = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, '4xl': 40 };

const radius = { sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, full: 9999 };

// Minimum touch target (WCAG 2.5.5 / platform guidelines).
const touchTarget = 44;

const shadows = {
  card: {
    shadowColor: '#04211C',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  raised: {
    shadowColor: '#04211C',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};

module.exports = { colors, fontFamily, typography, spacing, radius, touchTarget, shadows };
