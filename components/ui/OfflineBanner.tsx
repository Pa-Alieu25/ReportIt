import { useNetInfo } from '@react-native-community/netinfo';
import { View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

/** True only when the device is confirmed offline (not while unknown). */
export function useIsOffline(): boolean {
  const { isConnected, isInternetReachable } = useNetInfo();
  return isConnected === false || isInternetReachable === false;
}

// Thin banner shown at the top of a screen while the phone has no internet.
export function OfflineBanner() {
  const offline = useIsOffline();
  if (!offline) return null;

  return (
    <View
      className="flex-row items-center px-5 py-2"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={{ backgroundColor: colors.feedback.warning.bg }}>
      <Icon name="offline" size={16} color={colors.feedback.warning.fg} />
      <Text variant="caption" weight="medium" className="ml-2 flex-1" style={{ color: colors.feedback.warning.fg }}>
        You&apos;re offline. Some information may be out of date until you reconnect.
      </Text>
    </View>
  );
}
