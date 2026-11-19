import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors, radius } from '@/theme';

type EmptyStateProps = {
  icon?: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** 'error' tints the icon red, for failed loads with a retry action. */
  tone?: 'neutral' | 'error';
};

export function EmptyState({
  icon = 'inbox',
  title,
  body,
  actionLabel,
  onAction,
  tone = 'neutral',
}: EmptyStateProps) {
  const iconColor = tone === 'error' ? colors.feedback.error.fg : colors.brand.teal600;
  const iconBg = tone === 'error' ? colors.feedback.error.bg : colors.brand.teal50;
  return (
    <View className="items-center px-6 py-10">
      <View
        className="items-center justify-center"
        style={{ width: 64, height: 64, borderRadius: radius.xl, backgroundColor: iconBg }}>
        <Icon name={icon} size={30} color={iconColor} />
      </View>
      <Text variant="h3" align="center" className="mt-4">
        {title}
      </Text>
      {body ? (
        <Text color="muted" align="center" className="mt-1">
          {body}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant="secondary"
          fullWidth={false}
          className="mt-5"
        />
      ) : null}
    </View>
  );
}
