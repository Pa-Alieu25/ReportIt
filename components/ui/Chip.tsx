import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors, radius } from '@/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  /** Small colour dot before the label, e.g. a status colour. */
  dot?: string;
};

// Filter/toggle chip. Visually 36dp tall; hitSlop brings the touch target to 44dp.
export function Chip({ label, selected = false, onPress, icon, dot }: ChipProps) {
  const fg = selected ? colors.text.inverse : colors.text.secondary;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      hitSlop={4}
      className="flex-row items-center"
      style={({ pressed }) => ({
        minHeight: 36,
        paddingHorizontal: 14,
        borderRadius: radius.full,
        borderWidth: 1,
        borderColor: selected ? colors.brand.teal600 : colors.border.default,
        backgroundColor: selected
          ? colors.brand.teal600
          : pressed
            ? colors.surface.muted
            : colors.surface.card,
      })}>
      {icon ? <Icon name={icon} size={16} color={fg} /> : null}
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
      <Text variant="label" style={{ color: fg, marginLeft: icon || dot ? 6 : 0 }}>
        {label}
      </Text>
    </Pressable>
  );
}
