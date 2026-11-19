import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

import { Icon } from '@/components/ui/Icon';
import type { MessageTone } from '@/components/ui/InlineMessage';
import { Text } from '@/components/ui/Text';
import { colors, radius, shadows } from '@/theme';

type ToastState = {
  toast: { id: number; message: string; tone: MessageTone } | null;
  show: (message: string, tone?: MessageTone) => void;
  hide: () => void;
};

const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (message, tone = 'success') => set({ toast: { id: Date.now(), message, tone } }),
  hide: () => set({ toast: null }),
}));

/** Show a short confirmation, e.g. toast.show('Report submitted'). */
export const toast = {
  show: (message: string, tone?: MessageTone) => useToastStore.getState().show(message, tone),
};

const VISIBLE_MS = 3200;

// Mounted once in the root layout, above all screens.
export function ToastHost() {
  const current = useToastStore((state) => state.toast);
  const hide = useToastStore((state) => state.hide);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(hide, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [current, hide]);

  if (!current) return null;
  const c = colors.feedback[current.tone];

  return (
    <View pointerEvents="none" className="absolute inset-x-0 px-4" style={{ top: insets.top + 8 }}>
      <Animated.View
        key={current.id}
        entering={FadeInUp.duration(200)}
        exiting={FadeOutUp.duration(150)}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        className="flex-row items-center px-4 py-3"
        style={{
          backgroundColor: colors.brand.green900,
          borderRadius: radius.md,
          ...shadows.raised,
        }}>
        <Icon
          name={current.tone === 'error' ? 'error' : current.tone === 'success' ? 'success' : 'info'}
          size={20}
          color={current.tone === 'error' ? c.border : colors.brand.teal300}
        />
        <Text variant="label" color="inverse" className="ml-2 flex-1">
          {current.message}
        </Text>
      </Animated.View>
    </View>
  );
}
