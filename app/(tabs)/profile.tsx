import Constants from 'expo-constants';
import { useMemo, useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { InlineMessage } from '@/components/ui/InlineMessage';
import { Input } from '@/components/ui/Input';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { signOutUser, updateUserName } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import {
  requestNotificationPermissions,
  setNotificationsEnabled as persistNotificationsEnabled,
} from '@/lib/notifications';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyReportsStore } from '@/store/useMyReportsStore';
import { useNotificationPreferenceStore } from '@/store/useNotificationPreferenceStore';
import { colors, radius } from '@/theme';

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View className="flex-1 items-center py-1" accessible accessibilityLabel={`${label}: ${value}`}>
      <Text variant="h1" style={{ color }}>
        {value}
      </Text>
      <Text variant="caption" color="muted">
        {label}
      </Text>
    </View>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <View className="flex-row items-center py-3" style={{ minHeight: 56 }}>
      <View
        className="items-center justify-center"
        style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.brand.teal50 }}>
        <Icon name={icon} size={20} color={colors.brand.teal600} />
      </View>
      <View className="ml-3 flex-1">
        <Text weight="medium">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const reports = useMyReportsStore((state) => state.reports);
  const reportsStatus = useMyReportsStore((state) => state.status);
  const notificationsEnabled = useNotificationPreferenceStore((state) => state.enabled);
  const setNotificationsEnabledInStore = useNotificationPreferenceStore((state) => state.setEnabled);

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: reports.length,
      inProgress: reports.filter((r) => r.status === 'In Progress' || r.status === 'Under Review').length,
      resolved: reports.filter((r) => r.status === 'Resolved').length,
    }),
    [reports]
  );

  const isAdmin = profile?.role === 'admin';
  const name = profile?.name ?? user?.displayName ?? '';

  const startEditing = () => {
    setNameDraft(name);
    setNameError(null);
    setEditing(true);
  };

  const saveName = async () => {
    if (!user) return;
    if (!nameDraft.trim()) {
      setNameError('Enter your name.');
      return;
    }
    setSavingName(true);
    try {
      await updateUserName(user, nameDraft);
      setEditing(false);
      toast.show('Name updated.');
    } catch (error) {
      console.error('Failed to update name:', error);
      setNameError("Couldn't save your name. Check your connection and try again.");
    } finally {
      setSavingName(false);
    }
  };

  const toggleNotifications = (value: boolean) => {
    setNotificationsEnabledInStore(value);
    void persistNotificationsEnabled(value);
    // In case permission was never granted and the user is opting back in.
    if (value) void requestNotificationPermissions();
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'You can sign back in at any time.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          setSignOutError(null);
          setSigningOut(true);
          try {
            await signOutUser();
            // Root layout's auth listener + Stack.Protected guard handle navigation.
          } catch (error) {
            setSignOutError(error instanceof Error ? error.message : 'Could not sign out. Please try again.');
            setSigningOut(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScreenHeader title="Profile" />
      <OfflineBanner />
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2" keyboardShouldPersistTaps="handled">
        <Card className="items-center" padding={20}>
          <Avatar name={name} size={80} />
          {editing ? (
            <View className="mt-4 self-stretch">
              <Input
                label="Your name"
                value={nameDraft}
                onChangeText={setNameDraft}
                error={nameError}
                maxLength={100}
                autoCapitalize="words"
                autoComplete="name"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveName}
              />
              <View className="mt-3 flex-row gap-3">
                <View className="flex-1">
                  <Button label="Cancel" variant="secondary" onPress={() => setEditing(false)} />
                </View>
                <View className="flex-1">
                  <Button label="Save" loading={savingName} onPress={saveName} />
                </View>
              </View>
            </View>
          ) : (
            <>
              <Pressable
                onPress={startEditing}
                accessibilityRole="button"
                accessibilityLabel={`Name: ${name || 'not set'}. Edit name`}
                className="mt-3 flex-row items-center justify-center"
                style={{ minHeight: 44 }}>
                <Text variant="h2">{name || 'Add your name'}</Text>
                <View className="ml-2">
                  <Icon name="edit" size={18} color={colors.brand.teal600} />
                </View>
              </Pressable>
              <Text color="muted">{profile?.email ?? user?.email ?? ''}</Text>
              <View className="mt-2 flex-row items-center gap-2">
                {isAdmin ? (
                  <View className="px-3 py-1" style={{ backgroundColor: colors.brand.teal50, borderRadius: radius.full }}>
                    <Text variant="caption" weight="semibold" style={{ color: colors.brand.teal700 }}>
                      Administrator
                    </Text>
                  </View>
                ) : null}
                <Text variant="caption" color="muted">
                  Member since {formatDate(profile?.createdAt)}
                </Text>
              </View>
            </>
          )}
        </Card>

        <Text variant="overline" color="muted" className="mb-2 mt-7">
          Your impact
        </Text>
        <Card>
          {reportsStatus === 'loading' ? (
            <Skeleton height={56} />
          ) : reportsStatus === 'error' ? (
            <Text color="muted" align="center">
              Your report numbers will appear when you&apos;re back online.
            </Text>
          ) : (
            <View className="flex-row">
              <Stat label="Reported" value={stats.total} color={colors.text.primary} />
              <Stat label="Being worked on" value={stats.inProgress} color={colors.status['In Progress'].fg} />
              <Stat label="Fixed" value={stats.resolved} color={colors.status.Resolved.fg} />
            </View>
          )}
        </Card>

        <Text variant="overline" color="muted" className="mb-2 mt-7">
          Settings
        </Text>
        <Card padding={12}>
          <SettingRow
            icon="bell"
            title="Status notifications"
            subtitle="Tell me when one of my reports changes."
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                accessibilityLabel="Status notifications"
                trackColor={{ false: colors.border.strong, true: colors.brand.teal500 }}
                thumbColor={colors.surface.card}
                ios_backgroundColor={colors.border.strong}
              />
            }
          />
        </Card>

        <Text variant="overline" color="muted" className="mb-2 mt-7">
          About
        </Text>
        <Card padding={12}>
          <SettingRow
            icon="community"
            title="ReportIT"
            subtitle={`See it. Report it. Fix it. · Version ${Constants.expoConfig?.version ?? '1.0.0'}`}
          />
        </Card>

        {signOutError ? <InlineMessage tone="error" message={signOutError} className="mt-6" /> : null}
        <Button
          label="Sign out"
          icon="sign-out"
          variant="danger"
          className="mt-7"
          loading={signingOut}
          onPress={confirmSignOut}
        />
      </ScrollView>
    </Screen>
  );
}
