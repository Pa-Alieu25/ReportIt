import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { colors, radius, shadows, touchTarget } from '@/theme';

type IconButtonProps = {
  icon: IconName;
  /** Required: icon-only buttons must be named for screen readers. */
  accessibilityLabel: string;
  onPress: () => void;
  /** 'surface' floats over content (e.g. a map); 'plain' sits in a header. */
  tone?: 'surface' | 'plain' | 'onDark';
  color?: string;
};

export function IconButton({ icon, accessibilityLabel, onPress, tone = 'plain', color }: IconButtonProps) {
  const fg = color ?? (tone === 'onDark' ? colors.text.inverse : colors.brand.teal600);
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} hitSlop={4}>
      {({ pressed }) => (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: touchTarget,
            height: touchTarget,
            borderRadius: radius.md,
            backgroundColor:
              tone === 'surface'
                ? pressed
                  ? colors.surface.muted
                  : colors.surface.card
                : pressed
                  ? tone === 'onDark'
                    ? 'rgba(255,255,255,0.15)'
                    : colors.brand.teal50
                  : 'transparent',
            ...(tone === 'surface' ? shadows.card : null),
          }}>
          <Icon name={icon} size={22} color={fg} />
        </View>
      )}
    </Pressable>
  );
}
