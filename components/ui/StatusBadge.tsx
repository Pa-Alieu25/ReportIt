import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { radius, statusColors } from '@/theme';

type StatusBadgeProps = {
  status: string;
  size?: 'sm' | 'md';
};

// Colour is paired with a text label (never colour alone), and fg/bg pairs
// meet WCAG AA.
export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const c = statusColors(status);
  return (
    <View
      className="flex-row items-center self-start"
      accessibilityLabel={`Status: ${status}`}
      style={{
        backgroundColor: c.bg,
        borderRadius: radius.full,
        paddingHorizontal: size === 'md' ? 12 : 10,
        paddingVertical: size === 'md' ? 5 : 3,
      }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.solid, marginRight: 6 }} />
      <Text variant="caption" weight="semibold" style={{ color: c.fg }}>
        {status}
      </Text>
    </View>
  );
}
