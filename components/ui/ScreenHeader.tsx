import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Logo } from '@/components/ui/Logo';
import { Text } from '@/components/ui/Text';

type ScreenHeaderProps = {
  /** Screen title. Omit to show the ReportIT logo instead. */
  title?: string;
  subtitle?: string;
  /** Optional action(s) on the right, e.g. an icon button. */
  right?: ReactNode;
};

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-5 pb-3 pt-2" style={{ minHeight: 56 }}>
      <View className="flex-1 pr-3">
        {title ? (
          <>
            <Text variant="h1" accessibilityRole="header">
              {title}
            </Text>
            {subtitle ? (
              <Text variant="body" color="muted">
                {subtitle}
              </Text>
            ) : null}
          </>
        ) : (
          <Logo />
        )}
      </View>
      {right}
    </View>
  );
}
