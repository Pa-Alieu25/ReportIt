import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/Icon';
import { Text } from '@/components/ui/Text';
import { colors, radius, touchTarget } from '@/theme';

type SelectProps<T extends string> = {
  /** Field label; omit for compact filters that have their own label. */
  label?: string;
  sheetTitle: string;
  options: readonly T[];
  value: T | null;
  onSelect: (value: T) => void;
  placeholder: string;
  getLabel?: (value: T) => string;
  error?: string | null;
  className?: string;
};

// Cross-platform dropdown: a field that opens a bottom sheet of options.
export function Select<T extends string>({
  label,
  sheetTitle,
  options,
  value,
  onSelect,
  placeholder,
  getLabel = (option) => option,
  error,
  className,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View className={className}>
      {label ? (
        <Text variant="label" color="secondary" className="mb-1.5">
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? sheetTitle}: ${value ? getLabel(value) : placeholder}`}
        accessibilityHint="Opens a list of options"
        className="flex-row items-center justify-between"
        style={({ pressed }) => ({
          minHeight: 52,
          paddingHorizontal: 14,
          borderRadius: radius.md,
          borderWidth: error ? 1.5 : 1,
          borderColor: error ? colors.feedback.error.fg : colors.border.default,
          backgroundColor: pressed ? colors.surface.muted : colors.surface.card,
        })}>
        <Text color={value ? 'primary' : 'placeholder'} numberOfLines={1} style={{ flex: 1 }}>
          {value ? getLabel(value) : placeholder}
        </Text>
        <View style={{ transform: [{ rotate: '90deg' }] }}>
          <Icon name="chevron-right" size={18} color={colors.text.muted} />
        </View>
      </Pressable>
      {error ? (
        <Text variant="caption" style={{ color: colors.feedback.error.fg }} className="mt-1.5">
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 justify-end"
          style={{ backgroundColor: colors.surface.overlay }}
          onPress={() => setOpen(false)}
          accessibilityLabel="Close"
          accessibilityRole="button">
          <Pressable
            onPress={() => {}}
            style={{
              backgroundColor: colors.surface.card,
              borderTopLeftRadius: radius['2xl'],
              borderTopRightRadius: radius['2xl'],
              paddingBottom: Math.max(insets.bottom, 16),
              maxHeight: '80%',
            }}>
            <View className="items-center pt-3">
              <View className="h-1 w-10 rounded-full" style={{ backgroundColor: colors.border.strong }} />
            </View>
            <Text variant="h3" align="center" className="px-6 pb-2 pt-3" accessibilityRole="header">
              {sheetTitle}
            </Text>
            <ScrollView className="px-4">
              {options.map((option) => {
                const selected = option === value;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onSelect(option);
                      setOpen(false);
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    className="flex-row items-center justify-between px-3"
                    style={({ pressed }) => ({
                      minHeight: touchTarget + 8,
                      borderRadius: radius.md,
                      backgroundColor: selected
                        ? colors.brand.teal50
                        : pressed
                          ? colors.surface.muted
                          : 'transparent',
                    })}>
                    <Text weight={selected ? 'semibold' : 'regular'} style={{ flex: 1 }}>
                      {getLabel(option)}
                    </Text>
                    {selected ? <Icon name="success" size={20} color={colors.brand.teal600} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
