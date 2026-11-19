import { View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors, radius } from '@/theme';

export type MessageTone = 'success' | 'error' | 'warning' | 'info';

const TONE_ICON: Record<MessageTone, IconName> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

type InlineMessageProps = {
  tone: MessageTone;
  message: string;
  title?: string;
  className?: string;
};

// Inline feedback inside a screen or form. Announced by screen readers.
export function InlineMessage({ tone, message, title, className }: InlineMessageProps) {
  const c = colors.feedback[tone];
  return (
    <View
      className={`flex-row items-start p-3 ${className ?? ''}`}
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={{ backgroundColor: c.bg, borderColor: c.border, borderWidth: 1, borderRadius: radius.md }}>
      <Icon name={TONE_ICON[tone]} size={20} color={c.fg} />
      <View className="ml-2 flex-1">
        {title ? (
          <Text variant="label" weight="semibold" style={{ color: c.fg }}>
            {title}
          </Text>
        ) : null}
        <Text variant="label" weight="regular" style={{ color: c.fg }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
