import { useEffect } from 'react';
import { View, type DimensionValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, radius as radii } from '@/theme';

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  className?: string;
};

// Placeholder block with a gentle pulse. Static when the user has asked the
// OS to reduce motion.
export function Skeleton({ width = '100%', height = 16, radius = radii.sm, className }: SkeletonProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withRepeat(withTiming(0.45, { duration: 800 }), -1, true);
  }, [opacity, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      className={className}
      accessible={false}
      style={[{ width, height, borderRadius: radius, backgroundColor: colors.surface.muted }, animatedStyle]}
    />
  );
}

// Skeleton shaped like a ReportCard, for list loading states.
export function ReportCardSkeleton() {
  return (
    <View
      className="mb-3 flex-row p-3"
      accessibilityLabel="Loading"
      style={{
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border.default,
        backgroundColor: colors.surface.card,
      }}>
      <Skeleton width={72} height={72} radius={radii.md} />
      <View className="ml-3 flex-1 justify-center">
        <Skeleton width="70%" height={16} />
        <Skeleton width="45%" height={12} className="mt-2" />
        <Skeleton width="30%" height={12} className="mt-2" />
      </View>
    </View>
  );
}
