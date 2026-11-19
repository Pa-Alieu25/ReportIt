const { colors, fontFamily, radius } = require('./theme/tokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './constants/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './store/**/*.{js,jsx,ts,tsx}',
    './theme/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        surface: colors.surface,
        ink: colors.text,
        line: colors.border,

        // Legacy names still used by screens not yet redesigned (Stage 2),
        // pointed at the brand tokens so they already match.
        primary: {
          DEFAULT: colors.brand.teal600,
          dark: colors.brand.teal700,
          light: colors.brand.teal500,
        },
        accent: {
          DEFAULT: colors.brand.orange500,
          dark: colors.feedback.warning.fg,
        },
        error: colors.feedback.error.fg,
        status: {
          pending: colors.status.Pending.solid,
          underReview: colors.status['Under Review'].solid,
          inProgress: colors.status['In Progress'].solid,
          resolved: colors.status.Resolved.solid,
          rejected: colors.status.Rejected.solid,
        },
      },
      fontFamily: {
        regular: [fontFamily.regular],
        medium: [fontFamily.medium],
        semibold: [fontFamily.semibold],
        bold: [fontFamily.bold],
      },
      borderRadius: {
        sm: `${radius.sm}px`,
        md: `${radius.md}px`,
        lg: `${radius.lg}px`,
        xl: `${radius.xl}px`,
        '2xl': `${radius['2xl']}px`,
      },
    },
  },
  plugins: [],
};
