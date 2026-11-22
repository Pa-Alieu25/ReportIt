import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 72 }: { name: string | null | undefined; size?: number }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      accessible={false}
      style={{ width: size, height: size, backgroundColor: colors.brand.green800 }}>
      <Text
        weight="semibold"
        style={{ color: colors.brand.teal300, fontSize: size * 0.36, lineHeight: size * 0.48 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
