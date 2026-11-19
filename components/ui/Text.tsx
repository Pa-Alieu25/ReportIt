import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, typography, type FontWeightName, type TypographyVariant } from '@/theme';
import { fontStyle } from '@/theme/fonts';

type TextColor = keyof typeof colors.text;

export type TextProps = RNTextProps & {
  variant?: TypographyVariant;
  color?: TextColor;
  /** Override the variant's weight, e.g. a bold caption. */
  weight?: FontWeightName;
  align?: 'left' | 'center' | 'right';
  className?: string;
};

// Text grows with the phone's font size setting up to 200% (WCAG 1.4.4);
// layouts must allow wrapping rather than fixed heights.
const MAX_FONT_SCALE = 2;

export function Text({
  variant = 'body',
  color = 'primary',
  weight,
  align,
  style,
  ...rest
}: TextProps) {
  const t = typography[variant];
  return (
    <RNText
      maxFontSizeMultiplier={MAX_FONT_SCALE}
      style={[
        {
          fontSize: t.fontSize,
          lineHeight: t.lineHeight,
          color: colors.text[color],
          letterSpacing: 'letterSpacing' in t ? t.letterSpacing : undefined,
          textTransform: variant === 'overline' ? 'uppercase' : undefined,
          textAlign: align,
        },
        fontStyle(weight ?? (t.weight as FontWeightName)),
        style,
      ]}
      {...rest}
    />
  );
}
