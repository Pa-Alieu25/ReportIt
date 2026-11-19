import { useState } from 'react';
import { Pressable, TextInput, View, type TextInputProps } from 'react-native';

import { Icon, type IconName } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors, radius, touchTarget, typography } from '@/theme';
import { fontStyle } from '@/theme/fonts';

type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string | null;
  hint?: string;
  icon?: IconName;
  /** Adds a show/hide toggle for passwords. */
  revealable?: boolean;
  className?: string;
};

export function Input({
  label,
  error,
  hint,
  icon,
  revealable = false,
  multiline,
  secureTextEntry,
  onFocus,
  onBlur,
  className,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const borderColor = error
    ? colors.feedback.error.fg
    : focused
      ? colors.border.focus
      : colors.border.default;

  return (
    <View className={className}>
      <Text variant="label" color="secondary" className="mb-1.5">
        {label}
      </Text>
      <View
        className="flex-row"
        style={{
          alignItems: multiline ? 'flex-start' : 'center',
          minHeight: multiline ? 120 : 52,
          borderRadius: radius.md,
          borderWidth: focused || error ? 1.5 : 1,
          borderColor,
          backgroundColor: colors.surface.card,
          paddingHorizontal: 14,
        }}>
        {icon ? (
          <View style={{ paddingTop: multiline ? 14 : 0, marginRight: 10 }}>
            <Icon name={icon} size={20} color={colors.text.muted} />
          </View>
        ) : null}
        <TextInput
          accessibilityLabel={label}
          accessibilityHint={hint}
          placeholderTextColor={colors.text.placeholder}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          secureTextEntry={secureTextEntry && !revealed}
          maxFontSizeMultiplier={2}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              color: colors.text.primary,
              fontSize: typography.body.fontSize,
              paddingVertical: multiline ? 14 : 12,
              minHeight: multiline ? 120 : undefined,
            },
            fontStyle('regular'),
          ]}
          {...rest}
        />
        {revealable && secureTextEntry ? (
          <Pressable
            onPress={() => setRevealed((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
            hitSlop={8}
            style={{ minWidth: touchTarget, minHeight: touchTarget, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={revealed ? 'eye-off' : 'eye'} size={20} color={colors.text.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <View className="mt-1.5 flex-row items-center" accessibilityLiveRegion="polite">
          <Icon name="error" size={14} color={colors.feedback.error.fg} />
          <Text variant="caption" style={{ color: colors.feedback.error.fg, marginLeft: 4 }}>
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text variant="caption" color="muted" className="mt-1.5">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

export function TextArea(props: Omit<InputProps, 'multiline' | 'revealable'>) {
  return <Input {...props} multiline />;
}
