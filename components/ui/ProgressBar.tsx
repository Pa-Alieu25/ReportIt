import { View } from 'react-native';

import { colors, radius } from '@/theme';

type ProgressBarProps = {
  /** 0–1 */
  progress: number;
  accessibilityLabel?: string;
};

export function ProgressBar({ progress, accessibilityLabel = 'Progress' }: ProgressBarProps) {
  const percent = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={{ height: 6, borderRadius: radius.full, backgroundColor: colors.brand.teal100, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${percent}%`, backgroundColor: colors.brand.teal600 }} />
    </View>
  );
}
