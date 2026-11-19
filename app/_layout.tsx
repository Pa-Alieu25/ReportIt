import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { DefaultTheme, ThemeProvider, type Theme } from 'expo-router/react-navigation';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { LogoMark } from '@/components/ui/Logo';
import { ToastHost } from '@/components/ui/Toast';
import { useAuthSession } from '@/hooks/use-auth-session';
import { useMyReportsSync } from '@/hooks/use-my-reports-sync';
import { useReportStatusNotifications } from '@/hooks/use-report-status-notifications';
import { getOnboardingComplete } from '@/lib/onboarding';
import { useAuthStore } from '@/store/useAuthStore';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { colors, fontFamily } from '@/theme';
import { brandFonts, setBrandFontAvailable } from '@/theme/fonts';

import '@/global.css';

// Keep the native splash up until fonts, auth and onboarding state are ready.
void SplashScreen.preventAutoHideAsync().catch(() => {});

// The app is light-only for now (app.json userInterfaceStyle: "light"); the
// navigation theme is fixed too, so headers and the tab bar never turn dark
// on a phone in dark mode.
function navigationTheme(useBrandFont: boolean): Theme {
  const font = (family: string, weight: '400' | '500' | '600' | '700') =>
    useBrandFont ? { fontFamily: family, fontWeight: 'normal' as const } : { fontFamily: 'System', fontWeight: weight };
  return {
    ...DefaultTheme,
    dark: false,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.brand.teal600,
      background: colors.surface.background,
      card: colors.surface.card,
      text: colors.text.primary,
      border: colors.border.default,
      notification: colors.brand.orange500,
    },
    fonts: {
      regular: font(fontFamily.regular, '400'),
      medium: font(fontFamily.medium, '500'),
      bold: font(fontFamily.semibold, '600'),
      heavy: font(fontFamily.bold, '700'),
    },
  };
}

// Shown only if the native splash has already gone (e.g. a slow cold start).
function LoadingScreen() {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.surface.background }}
      accessibilityLabel="Loading ReportIT">
      <LogoMark size={72} />
    </View>
  );
}

function RootNavigator() {
  const user = useAuthStore((state) => state.user);
  // Guaranteed true or false by the time this renders — RootLayout only
  // mounts it once both authLoading is false and onboardingComplete !== null.
  const onboardingComplete = useOnboardingStore((state) => state.completed);

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.brand.teal600,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.surface.background },
        headerTitleStyle: { color: colors.text.primary },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.surface.background },
      }}>
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
  const [fontsLoaded, fontError] = useFonts(brandFonts);
  const fontsSettled = fontsLoaded || !!fontError;
  // Set before any themed text renders (the navigator mounts only once
  // fonts have settled). On error, text falls back to the system font.
  setBrandFontAvailable(fontsLoaded);

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

  useEffect(() => {
    if (fontError) console.error('Failed to load brand fonts, using system font:', fontError);
  }, [fontError]);

  const appReady = fontsSettled && !authLoading && onboardingComplete !== null;

  useEffect(() => {
    if (appReady) void SplashScreen.hideAsync().catch(() => {});
  }, [appReady]);

  return (
    <ThemeProvider value={navigationTheme(fontsLoaded)}>
      {appReady ? <RootNavigator /> : <LoadingScreen />}
      <ToastHost />
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
