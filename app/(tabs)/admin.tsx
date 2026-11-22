import { useRouter } from 'expo-router';
import { onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, ScrollView, View } from 'react-native';

import { ReportCard } from '@/components/ReportCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Select } from '@/components/ui/Select';
import { ReportCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { AREA_ORDER } from '@/constants/area';
import { CATEGORY_ORDER } from '@/constants/category';
import { ALL_STATUSES } from '@/constants/status';
import { reportsCollection } from '@/lib/firestore';
import { updateReportStatus } from '@/lib/reports';
import { useAuthStore } from '@/store/useAuthStore';
import { colors, radius, statusColors } from '@/theme';
import type { Area, Category, Report, Status } from '@/types/models';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card padding={12} className="flex-1" accessibilityLabel={`${label}: ${value}`}>
      <Text variant="h1" style={{ color }}>
        {value}
      </Text>
      <Text variant="caption" color="muted" numberOfLines={2}>
        {label}
      </Text>
    </Card>
  );
}

// A report card with a one-tap status change underneath. Closing a report
// (Rejected) needs a reason for the reporter, so that opens the full detail.
function AdminRow({ report, onOpen }: { report: Report; onOpen: () => void }) {
  const [saving, setSaving] = useState(false);

  const changeStatus = async (next: Status) => {
    if (next === report.status) return;
    if (next === 'Rejected') {
      onOpen();
      toast.show('Add a reason for the reporter, then save.', 'info');
      return;
    }
    setSaving(true);
    try {
      await updateReportStatus(report.id, next);
      toast.show(`Marked as ${next}.`);
    } catch (error) {
      console.error('Quick status update failed:', error);
      toast.show("Couldn't update the status. Check your connection.", 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="mb-4">
      <ReportCard report={report} onPress={onOpen} />
      <View style={{ marginTop: -6 }}>
        <Select
          sheetTitle={`Change status: ${report.title}`}
          options={ALL_STATUSES}
          value={report.status}
          onSelect={changeStatus}
          placeholder=""
          renderTrigger={(open) => (
            <Button
              label={`Change status · ${report.status}`}
              icon="refresh"
              variant="ghost"
              loading={saving}
              loadingLabel="Updating…"
              onPress={open}
            />
          )}
        />
      </View>
    </View>
  );
}

export default function AdminScreen() {
  const router = useRouter();
  const isAdmin = useAuthStore((state) => state.profile?.role === 'admin');

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  // When the latest snapshot arrived; "this week" is measured from here.
  const [loadedAt, setLoadedAt] = useState(0);

  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [areaFilter, setAreaFilter] = useState<Area | 'All'>('All');
  const [search, setSearch] = useState('');
  const [oldestFirst, setOldestFirst] = useState(false);

  useEffect(() => {
    // Non-admins get the access-denied view below, which ignores `loading`.
    if (!isAdmin) return;
    // Sort-only order needs no composite index; filtering is client-side.
    const unsubscribe = onSnapshot(
      query(reportsCollection, orderBy('createdAt', 'desc')),
      (snapshot) => {
        setReports(snapshot.docs.map((doc) => doc.data()));
        setLoadedAt(Date.now());
        setFailed(false);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load reports for admin dashboard:', err);
        setFailed(true);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [isAdmin]);

  const summary = useMemo(() => {
    const weekAgo = loadedAt - WEEK_MS;
    return {
      total: reports.length,
      waiting: reports.filter((r) => r.status === 'Pending' || r.status === 'Under Review').length,
      inProgress: reports.filter((r) => r.status === 'In Progress').length,
      resolvedThisWeek: reports.filter(
        (r) => r.status === 'Resolved' && (r.updatedAt?.toMillis?.() ?? 0) >= weekAgo
      ).length,
    };
  }, [reports, loadedAt]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const result = reports.filter(
      (r) =>
        (statusFilter === 'All' || r.status === statusFilter) &&
        (categoryFilter === 'All' || r.category === categoryFilter) &&
        (areaFilter === 'All' || r.area === areaFilter) &&
        (!term ||
          r.title.toLowerCase().includes(term) ||
          r.description.toLowerCase().includes(term) ||
          (r.address ?? '').toLowerCase().includes(term))
    );
    return oldestFirst ? [...result].reverse() : result;
  }, [reports, statusFilter, categoryFilter, areaFilter, search, oldestFirst]);

  const filtersActive =
    statusFilter !== 'All' || categoryFilter !== 'All' || areaFilter !== 'All' || !!search.trim();

  const clearFilters = () => {
    setStatusFilter('All');
    setCategoryFilter('All');
    setAreaFilter('All');
    setSearch('');
  };

  if (!isAdmin) {
    return (
      <Screen>
        <View className="flex-1 justify-center">
          <EmptyState
            icon="access-denied"
            title="Administrators only"
            body="This page is for council and authority staff."
          />
        </View>
      </Screen>
    );
  }

  const header = (
    <View>
      <View className="mb-5 flex-row gap-2">
        {loading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} height={72} radius={radius.lg} className="flex-1" />)
        ) : (
          <>
            <SummaryCard label="Total" value={summary.total} color={colors.text.primary} />
            <SummaryCard label="Waiting" value={summary.waiting} color={colors.status.Pending.fg} />
            <SummaryCard label="In progress" value={summary.inProgress} color={colors.status['In Progress'].fg} />
            <SummaryCard
              label="Fixed this week"
              value={summary.resolvedThisWeek}
              color={colors.status.Resolved.fg}
            />
          </>
        )}
      </View>

      <Input
        label="Search"
        icon="search"
        value={search}
        onChangeText={setSearch}
        placeholder="Title, description or address"
        returnKeyType="search"
        className="mb-3"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pb-3">
        <Chip label="All" selected={statusFilter === 'All'} onPress={() => setStatusFilter('All')} />
        {ALL_STATUSES.map((s) => (
          <Chip
            key={s}
            label={s}
            dot={statusColors(s).solid}
            selected={statusFilter === s}
            onPress={() => setStatusFilter(statusFilter === s ? 'All' : s)}
          />
        ))}
      </ScrollView>

      <View className="mb-3 flex-row gap-3">
        <Select
          className="flex-1"
          sheetTitle="Filter by problem"
          options={['All', ...CATEGORY_ORDER] as (Category | 'All')[]}
          value={categoryFilter}
          onSelect={setCategoryFilter}
          getLabel={(v) => (v === 'All' ? 'All problems' : v)}
          placeholder="All problems"
        />
        <Select
          className="flex-1"
          sheetTitle="Filter by area"
          options={['All', ...AREA_ORDER] as (Area | 'All')[]}
          value={areaFilter}
          onSelect={setAreaFilter}
          getLabel={(v) => (v === 'All' ? 'All areas' : v)}
          placeholder="All areas"
        />
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <Text variant="label" color="muted">
          {loading ? 'Loading…' : `${filtered.length} report${filtered.length === 1 ? '' : 's'}`}
        </Text>
        <View className="flex-row items-center">
          {filtersActive ? (
            <Button label="Clear filters" variant="ghost" fullWidth={false} onPress={clearFilters} />
          ) : null}
          <IconButton
            icon="sort"
            accessibilityLabel={
              oldestFirst ? 'Sorted oldest first. Show newest first' : 'Sorted newest first. Show oldest first'
            }
            onPress={() => setOldestFirst((v) => !v)}
          />
        </View>
      </View>
    </View>
  );

  return (
    <Screen>
      <ScreenHeader title="Admin" subtitle="Reports from across The Gambia" />
      <OfflineBanner />
      <FlatList
        data={loading ? [] : filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="flex-grow px-5 pb-12 pt-1"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={header}
        renderItem={({ item }) => <AdminRow report={item} onOpen={() => router.push(`/report/${item.id}`)} />}
        ListEmptyComponent={
          loading ? (
            <View>
              <ReportCardSkeleton />
              <ReportCardSkeleton />
              <ReportCardSkeleton />
            </View>
          ) : failed ? (
            <EmptyState
              tone="error"
              icon="offline"
              title="We couldn't load reports"
              body="Check your internet connection. The list will update by itself when you're back online."
            />
          ) : (
            <EmptyState
              icon="inbox"
              title={filtersActive ? 'No reports match these filters' : 'No reports yet'}
              body={
                filtersActive
                  ? 'Try a different status, problem, area or search.'
                  : 'New reports will appear here as soon as citizens send them.'
              }
              actionLabel={filtersActive ? 'Clear filters' : undefined}
              onAction={filtersActive ? clearFilters : undefined}
            />
          )
        }
      />
    </Screen>
  );
}
