import { Tabs } from 'expo-router';
import { View, type ColorValue } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useAuthStore } from '@/store/useAuthStore';
import { colors, shadows } from '@/theme';
import { fontStyle } from '@/theme/fonts';

function tabIcon(name: IconName) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    // Tab tint colours are always hex strings from the theme.
    return <Icon name={name} size={24} color={color as string} strokeWidth={focused ? 2.4 : 2} />;
  }
  return TabIcon;
}

// The centre "Report" tab is the app's main action, so it gets a raised
// teal button, as on the poster.
function ReportTabIcon({ focused }: { focused: boolean }) {
  return (
    <View
      className="items-center justify-center rounded-full"
      style={{
        width: 48,
        height: 48,
        marginTop: -14,
        backgroundColor: focused ? colors.brand.teal700 : colors.brand.teal600,
        borderWidth: 4,
        borderColor: colors.surface.card,
        ...shadows.raised,
      }}>
      <Icon name="plus" size={26} color={colors.text.inverse} strokeWidth={2.6} />
    </View>
  );
}

export default function TabLayout() {
  const isAdmin = useAuthStore((state) => state.profile?.role === 'admin');

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: colors.brand.teal600,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.surface.card,
          borderTopColor: colors.border.default,
        },
        tabBarLabelStyle: { ...fontStyle('medium'), fontSize: 11 },
        sceneStyle: { backgroundColor: colors.surface.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: tabIcon('map') }} />
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarAccessibilityLabel: 'Report a problem',
          tabBarIcon: ReportTabIcon,
        }}
      />
      <Tabs.Screen
        name="my-reports"
        options={{ title: 'My reports', tabBarIcon: tabIcon('my-reports') }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: tabIcon('user') }} />
      <Tabs.Protected guard={isAdmin}>
        <Tabs.Screen name="admin" options={{ title: 'Admin', tabBarIcon: tabIcon('admin') }} />
      </Tabs.Protected>
    </Tabs>
  );
}
