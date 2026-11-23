import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors, radius, shadows } from '@/theme';

// Tight, slightly darker shadow: it lifts the chip off the map without being
// cut off by the horizontal ScrollView it sits in.
const FLOATING_SHADOW = {
  shadowColor: colors.brand.green950,
  shadowOpacity: 0.18,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
};

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** Small colour dot before the label, e.g. a status colour. */
  dot?: string;
  /** Stronger shadow so the chip stays readable over a map or photo. */
  floating?: boolean;
};

// The one filter/toggle chip used on every screen: a solid white pill with
// dark text by default, solid teal with white text when selected.
// Visually 36dp tall; hitSlop brings the touch target to 44dp.
//
// Styles live on an inner View, not on Pressable's style function:
// NativeWind can drop a Pressable style function on iOS, which left the
// selected chip white-on-white.
export function Chip({ label, selected = false, onPress, icon, dot, floating = false }: ChipProps) {
  const fg = selected ? colors.text.inverse : colors.text.primary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      hitSlop={4}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 36,
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: radius.full,
            borderWidth: 1,
            borderColor: selected ? colors.brand.teal600 : colors.border.default,
            backgroundColor: selected
              ? pressed
                ? colors.brand.teal700
                : colors.brand.teal600
              : pressed
                ? colors.surface.muted
                : colors.surface.card,
            ...(floating ? FLOATING_SHADOW : shadows.card),
          }}>
          {icon ? <Icon name={icon} size={16} color={selected ? fg : colors.brand.teal600} /> : null}
          {dot ? (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: dot,
                borderWidth: selected ? 1.5 : 0,
                borderColor: colors.surface.card,
              }}
            />
          ) : null}
          <Text
            variant="label"
            weight={selected ? 'semibold' : 'medium'}
            style={{ color: fg, marginLeft: icon || dot ? 6 : 0 }}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
