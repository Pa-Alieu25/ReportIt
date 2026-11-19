import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { fontFamily, type FontWeightName } from '@/theme';

// Only the four weights the type scale uses are bundled.
export const brandFonts = {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
};

// Set once by the root layout before any screen renders. If the fonts fail
// to load (e.g. a corrupted download), text falls back to the system font
// with an equivalent weight instead of an unknown family.
let brandFontAvailable = false;

export function setBrandFontAvailable(available: boolean) {
  brandFontAvailable = available;
}

const FALLBACK_WEIGHT: Record<FontWeightName, '400' | '500' | '600' | '700'> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export function fontStyle(weight: FontWeightName) {
  return brandFontAvailable
    ? { fontFamily: fontFamily[weight] }
    : { fontWeight: FALLBACK_WEIGHT[weight] };
}
