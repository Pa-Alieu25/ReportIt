import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';

import { ReportCard } from '@/components/ReportCard';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ReportCardSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/Toast';
import { ALL_STATUSES } from '@/constants/status';
import { refreshMyReports } from '@/hooks/use-my-reports-sync';
import { useAuthStore } from '@/store/useAuthStore';
import { useMyReportsStore } from '@/store/useMyReportsStore';
import { colors } from '@/theme';
import type { Status } from '@/types/models';

type Filter = Status | 'All';

export default function MyReportsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const reports = useMyReportsStore((state) => state.reports);
  const status = useMyReportsStore((state) => state.status);
  const [filter, setFilter] = useState<Filter>('All');
  const [refreshing, setRefreshing] = useState(false);

  const counts = useMemo(() => {
    const result: Record<string, number> = { All: reports.length };
    for (const report of reports) result[report.status] = (result[report.status] ?? 0) + 1;
    return result;
  }, [reports]);

  const visible = filter === 'All' ? reports : reports.filter((report) => report.status === filter);

  const onRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      await refreshMyReports(user.uid);
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.show("Couldn't refresh. Check your connection.", 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const filters: Filter[] = ['All', ...ALL_STATUSES];

  return (
    <Screen>
      <ScreenHeader title="My reports" subtitle="Follow everything you've reported." />
      <OfflineBanner />

      {status !== 'loading' && reports.length > 0 ? (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 px-5 pb-3 pt-1">
            {filters.map((option) => (
              <Chip
                key={option}
                label={`${option} (${counts[option] ?? 0})`}
                selected={filter === option}
                onPress={() => setFilter(option)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {status === 'loading' ? (
        <View className="px-5 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerClassName="flex-grow px-5 pb-10 pt-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand.teal600}
              colors={[colors.brand.teal600]}
            />
          }
          renderItem={({ item }) => (
            <ReportCard report={item} onPress={() => router.push(`/report/${item.id}`)} />
          )}
          ListEmptyComponent={
            status === 'error' ? (
              <EmptyState
                tone="error"
                icon="offline"
                title="We couldn't load your reports"
                body="Check your internet connection, then pull down to try again."
              />
            ) : reports.length === 0 ? (
              <View>
                <EmptyState
                  icon="megaphone"
                  title="You haven't reported anything yet"
                  body="Seen a pothole, a broken streetlight or rubbish that needs collecting? Report it and follow its progress here."
                />
                <Button label="Report a problem" icon="camera" onPress={() => router.push('/report')} />
              </View>
            ) : (
              <EmptyState
                icon="inbox"
                title={`No ${filter.toLowerCase()} reports`}
                body="Try a different filter."
                actionLabel="Show all"
                onAction={() => setFilter('All')}
              />
            )
          }
        />
      )}
    </Screen>
  );
}
