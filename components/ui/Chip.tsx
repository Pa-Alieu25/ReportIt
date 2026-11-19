import { Pressable } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors, radius } from '@/theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
};

// Filter/toggle chip. Visually 36dp tall; hitSlop brings the touch target to 44dp.
export function Chip({ label, selected = false, onPress, icon }: ChipProps) {
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
      <Text variant="label" style={{ color: fg, marginLeft: icon ? 6 : 0 }}>
        {label}
      </Text>
    </Pressable>
  );
}
