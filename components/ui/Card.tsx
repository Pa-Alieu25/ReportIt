import { Pressable, View, type ViewProps } from 'react-native';

import { colors, radius, shadows } from '@/theme';

type CardProps = ViewProps & {
  /** Makes the whole card tappable with press feedback. */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Inner padding in dp; defaults to 16. */
  padding?: number;
  tone?: 'default' | 'brand' | 'tint';
  className?: string;
};

const TONES = {
  default: { bg: colors.surface.card, border: colors.border.default },
  brand: { bg: colors.brand.green800, border: colors.brand.green800 },
  tint: { bg: colors.brand.teal50, border: colors.brand.teal100 },
};

export function Card({
  onPress,
  accessibilityLabel,
  padding = 16,
  tone = 'default',
  style,
  children,
  className,
  ...rest
}: CardProps) {
  const t = TONES[tone];
  const base = {
    backgroundColor: t.bg,
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding,
    ...(tone === 'default' ? shadows.card : null),
  };

  if (!onPress) {
    return (
      <View className={className} style={[base, style]} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={className}
      style={({ pressed }) => [base, { transform: [{ scale: pressed ? 0.98 : 1 }] }, style]}
      {...rest}>
      {children}
    </Pressable>
  );
}
