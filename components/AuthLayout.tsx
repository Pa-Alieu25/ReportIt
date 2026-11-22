import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/IconButton';
import { Logo } from '@/components/ui/Logo';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Text } from '@/components/ui/Text';
import { colors, radius } from '@/theme';

type AuthLayoutProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** Show a back button (for screens pushed on top of sign-in). */
  showBack?: boolean;
};

// Shared frame for sign-in, sign-up and password reset: a dark green brand
// band with the logo and tagline, and the form on a light sheet below.
export function AuthLayout({ title, subtitle, children, showBack = false }: AuthLayoutProps) {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.brand.green900 }}>
      <StatusBar style="light" />
      <OfflineBanner />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-8 pt-2">
            <View className="flex-row items-center" style={{ minHeight: 44 }}>
              {showBack ? (
                <View style={{ marginLeft: -10 }}>
                  <IconButton
                    icon="back"
                    tone="onDark"
                    accessibilityLabel="Back"
                    onPress={() => router.back()}
                  />
                </View>
              ) : null}
            </View>
            <Logo tone="dark" size={40} />
            <Text variant="label" className="mt-3" style={{ color: colors.brand.teal300 }}>
              Your Community. Your Voice.
            </Text>
          </View>

          <View
            className="flex-1 px-6 pb-10 pt-8"
            style={{
              backgroundColor: colors.surface.background,
              borderTopLeftRadius: radius['2xl'],
              borderTopRightRadius: radius['2xl'],
            }}>
            <Text variant="h1" accessibilityRole="header">
              {title}
            </Text>
            <Text color="muted" className="mb-6 mt-1">
              {subtitle}
            </Text>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
