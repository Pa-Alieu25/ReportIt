import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { Palette } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useMyReportsSync } from '@/hooks/use-my-reports-sync';
import { useReportStatusNotifications } from '@/hooks/use-report-status-notifications';
import { getOnboardingComplete } from '@/lib/onboarding';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';

import '@/global.css';

function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color={Palette.primary} />
    </View>
  );
}

function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  // Guaranteed true or false by the time this renders — RootLayout only
  // mounts it once both authLoading is false and onboardingComplete !== null.
  const onboardingComplete = useOnboardingStore((state) => state.completed);

  return (
    <Stack>
      <Stack.Protected guard={onboardingComplete === false}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={onboardingComplete === true && !!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="report/[id]" options={{ title: 'Report' }} />
      </Stack.Protected>
      <Stack.Protected guard={onboardingComplete === true && !user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const authLoading = useAuthStore((state) => state.loading);

  const onboardingComplete = useOnboardingStore((state) => state.completed);
  const setOnboardingCompleted = useOnboardingStore((state) => state.setCompleted);

  useAuthSession();
  // The next two only do anything once a user is signed in (they read the
  // user from useAuthStore), so they're safe to mount unconditionally here.
  useMyReportsSync();
  useReportStatusNotifications();

  useEffect(() => {
    getOnboardingComplete().then(setOnboardingCompleted);
  }, [setOnboardingCompleted]);

  const appReady = !authLoading && onboardingComplete !== null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {appReady ? <RootNavigator /> : <LoadingScreen />}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
