import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReportCard } from '@/components/ReportCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CategoryTile } from '@/components/ui/CategoryTile';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { InlineMessage } from '@/components/ui/InlineMessage';
import { LogoMark } from '@/components/ui/Logo';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ReportCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { POPULAR_CATEGORIES } from '@/constants/category';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyReportsStore } from '@/store/useMyReportsStore';
import { colors, radius } from '@/theme';
import type { Category } from '@/types/models';

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text variant="h3" accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="link"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          className="flex-row items-center justify-center"
          style={{ minHeight: 44, paddingLeft: 12 }}>
          <Text variant="label" weight="semibold" color="link">
            {actionLabel}
          </Text>
          <Icon name="chevron-right" size={16} color={colors.text.link} />
        </Pressable>
      ) : null}
    </View>
  );
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card padding={12} className="flex-1 items-center" accessibilityLabel={`${label}: ${value}`}>
      <Text variant="h1" style={{ color }}>
        {value}
      </Text>
      <Text variant="caption" color="muted" align="center" numberOfLines={1}>
        {label}
      </Text>
    </Card>
  );
}

function HeroCard({ firstName, onReport }: { firstName?: string; onReport: () => void }) {
  return (
    <Card tone="brand" padding={20} className="mb-6 overflow-hidden">
      {/* Soft teal glow, echoing the poster's background. */}
      <View
        pointerEvents="none"
        className="absolute rounded-full"
        style={{
          width: 220,
          height: 220,
          right: -70,
          top: -80,
          backgroundColor: colors.brand.teal600,
          opacity: 0.35,
        }}
      />
      <View className="mb-4 flex-row items-center">
        <LogoMark size={44} />
        <View className="ml-3 flex-1">
          <Text variant="label" color="inverseMuted" numberOfLines={1}>
            {firstName ? `Hi, ${firstName}` : 'Hi there'}
          </Text>
          <Text variant="caption" weight="semibold" style={{ color: colors.brand.teal300 }}>
            Your Community. Your Voice.
          </Text>
        </View>
      </View>

      <Text variant="display" color="inverse" accessibilityRole="header">
        See it. <Text variant="display" style={{ color: colors.brand.teal300 }}>Report it.</Text> Fix it.
      </Text>
      <Text color="inverseMuted" className="mb-5 mt-2">
        Spotted a pothole, a broken light or rubbish that hasn&apos;t been collected? Tell us in under a
        minute.
      </Text>

      <Button label="Report a problem" icon="camera" size="lg" haptic onPress={onReport} />
    </Card>
  );
}

function TogetherCard() {
  return (
    <Card tone="tint" className="mt-2 flex-row items-center" padding={16}>
      <View
        className="items-center justify-center"
        style={{ width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.surface.card }}>
        <Icon name="users" size={26} color={colors.brand.teal600} />
      </View>
      <View className="ml-4 flex-1">
        <Text variant="bodyStrong">
          Together, let&apos;s build{' '}
          <Text variant="bodyStrong" weight="bold" style={{ color: colors.brand.teal700 }}>
            a better Gambia.
          </Text>
        </Text>
        <Text variant="caption" color="secondary" className="mt-0.5">
          Every report shows your council what needs fixing.
        </Text>
      </View>
    </Card>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const reports = useMyReportsStore((state) => state.reports);
  const status = useMyReportsStore((state) => state.status);

  const stats = useMemo(() => {
    const count = (s: string) => reports.filter((report) => report.status === s).length;
    return {
      total: reports.length,
      pending: count('Pending') + count('Under Review'),
      inProgress: count('In Progress'),
      resolved: count('Resolved'),
    };
  }, [reports]);

  const firstName = profile?.name?.trim().split(/\s+/)[0];
  const recentReports = reports.slice(0, 3);

  const openReportForm = (category?: Category) =>
    router.push(
      category ? { pathname: '/report', params: { category, nonce: String(Date.now()) } } : '/report'
    );

  return (
    <SafeAreaView edges={['top']} className="flex-1" style={{ backgroundColor: colors.surface.background }}>
      <ScreenHeader />
      <OfflineBanner />
      <ScrollView contentContainerClassName="px-5 pb-10 pt-2" showsVerticalScrollIndicator={false}>
        <HeroCard firstName={firstName} onReport={() => openReportForm()} />

        <SectionHeader title="Popular issues" />
        <View className="mb-6 gap-3">
          {[POPULAR_CATEGORIES.slice(0, 3), POPULAR_CATEGORIES.slice(3, 6)].map((row) => (
            <View key={row.join()} className="flex-row gap-3">
              {row.map((category) => (
                <CategoryTile key={category} category={category} onPress={() => openReportForm(category)} />
              ))}
            </View>
          ))}
        </View>

        <SectionHeader title="Your reports" />
        {status === 'error' ? (
          <InlineMessage
            tone="error"
            message="We couldn't load your reports. Check your connection and they'll appear automatically."
            className="mb-6"
          />
        ) : (
          <View className="mb-6 flex-row gap-2">
            {status === 'loading' ? (
              [0, 1, 2, 3].map((i) => <Skeleton key={i} height={68} radius={radius.lg} className="flex-1" />)
            ) : (
              <>
                <StatTile label="Total" value={stats.total} color={colors.text.primary} />
                <StatTile label="Waiting" value={stats.pending} color={colors.status.Pending.fg} />
                <StatTile label="In progress" value={stats.inProgress} color={colors.status['In Progress'].fg} />
                <StatTile label="Fixed" value={stats.resolved} color={colors.status.Resolved.fg} />
              </>
            )}
          </View>
        )}

        <SectionHeader
          title="Recent reports"
          actionLabel={reports.length > 0 ? 'See all' : undefined}
          onAction={() => router.push('/my-reports')}
        />
        {status === 'loading' ? (
          <>
            <ReportCardSkeleton />
            <ReportCardSkeleton />
          </>
        ) : status === 'ready' && recentReports.length === 0 ? (
          <Card className="mb-3" padding={0}>
            <EmptyState
              icon="inbox"
              title="No reports yet"
              body="When you report a problem, you can follow its progress here."
            />
          </Card>
        ) : (
          recentReports.map((report) => (
            <ReportCard key={report.id} report={report} onPress={() => router.push(`/report/${report.id}`)} />
          ))
        )}

        <TogetherCard />
      </ScrollView>
    </SafeAreaView>
  );
}
