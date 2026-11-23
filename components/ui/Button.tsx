import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, View, type PressableProps } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors, radius } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  loading?: boolean;
  /** Label shown next to the spinner while loading, e.g. "Submitting…". */
  loadingLabel?: string;
  fullWidth?: boolean;
  /** Light haptic tap; use for key actions only. */
  haptic?: boolean;
  className?: string;
};

const VARIANTS: Record<Variant, { bg: string; pressedBg: string; fg: string; border?: string }> = {
  primary: { bg: colors.brand.teal600, pressedBg: colors.brand.teal700, fg: colors.text.inverse },
  secondary: {
    bg: colors.surface.card,
    pressedBg: colors.brand.teal50,
    fg: colors.brand.teal600,
    border: colors.brand.teal600,
  },
  ghost: { bg: 'transparent', pressedBg: colors.brand.teal50, fg: colors.brand.teal600 },
  danger: {
    bg: colors.surface.card,
    pressedBg: colors.feedback.error.bg,
    fg: colors.feedback.error.fg,
    border: colors.feedback.error.border,
  },
};

const HEIGHT: Record<Size, number> = { md: 48, lg: 56 };

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  loadingLabel,
  fullWidth = true,
  haptic = false,
  disabled,
  onPress,
  className,
  ...rest
}: ButtonProps) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;

  // className goes on a wrapper, and the visual styles on an inner View:
  // NativeWind can drop a Pressable's style function on iOS, which hid the
  // background and left white text on a white screen.
  return (
    <View className={className} style={{ alignSelf: fullWidth ? 'stretch' : 'flex-start' }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: !!inactive, busy: loading }}
        disabled={inactive}
        onPress={(event) => {
          if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress?.(event);
        }}
        {...rest}>
        {({ pressed }) => (
          <View
            style={{
              minHeight: HEIGHT[size],
              borderRadius: radius.md,
              backgroundColor: pressed ? v.pressedBg : v.bg,
              borderWidth: v.border ? 1.5 : 0,
              borderColor: v.border,
              opacity: disabled && !loading ? 0.5 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
              paddingHorizontal: 20,
              paddingVertical: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {loading ? (
              <ActivityIndicator color={v.fg} />
            ) : icon ? (
              <Icon name={icon} size={size === 'lg' ? 22 : 20} color={v.fg} />
            ) : null}
            {loading && !loadingLabel ? null : (
              <Text
                variant={size === 'lg' ? 'h3' : 'bodyStrong'}
                weight="semibold"
                align="center"
                style={{ color: v.fg, marginLeft: loading || icon ? 8 : 0, flexShrink: 1 }}>
                {loading && loadingLabel ? loadingLabel : label}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    </View>
  );
}
