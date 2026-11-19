import { Pressable, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { CATEGORY_META } from '@/constants/category';
import { colors, radius, shadows } from '@/theme';
import type { Category } from '@/types/models';

type CategoryTileProps = {
  category: Category;
  onPress: () => void;
  selected?: boolean;
};

export function CategoryTile({ category, onPress, selected = false }: CategoryTileProps) {
  const meta = CATEGORY_META[category];
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Report a ${meta.shortLabel.toLowerCase()} problem`}
      accessibilityState={{ selected }}
      className="flex-1 items-center justify-center"
      style={({ pressed }) => ({
        minHeight: 96,
        paddingVertical: 14,
        paddingHorizontal: 6,
        borderRadius: radius.lg,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.brand.teal600 : colors.border.default,
        backgroundColor: pressed ? colors.surface.muted : colors.surface.card,
        transform: [{ scale: pressed ? 0.97 : 1 }],
        ...shadows.card,
      })}>
      <View
        className="items-center justify-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: radius.md,
          backgroundColor: `${meta.tint}1F`,
        }}>
        <Icon name={meta.icon} size={24} color={meta.tint} />
      </View>
      <Text variant="caption" weight="medium" color="primary" align="center" className="mt-2" numberOfLines={1}>
        {meta.shortLabel}
      </Text>
    </Pressable>
  );
}
