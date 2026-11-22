import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { PixelRatio, ScrollView, useWindowDimensions, View } from 'react-native';

import { AdminControls } from '@/components/report/AdminControls';
import { MiniMap } from '@/components/report/MiniMap';
import { StatusTimeline } from '@/components/report/StatusTimeline';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Text } from '@/components/ui/Text';
import { CATEGORY_META } from '@/constants/category';
import { reportsCollection } from '@/lib/firestore';
import { formatDate } from '@/lib/format';
import { cloudinaryResized } from '@/lib/images';
import { useAuthStore } from '@/store/useAuthStore';
import { colors, radius } from '@/theme';
import type { Report } from '@/types/models';

function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="overline" color="muted" className="mb-2" accessibilityRole="header">
      {children}
    </Text>
  );
}

function DetailSkeleton() {
  return (
    <View accessibilityLabel="Loading report">
      <Skeleton height={240} radius={0} />
      <View className="px-5 pt-5">
        <Skeleton width="75%" height={24} />
        <Skeleton width="40%" height={14} className="mt-3" />
        <Skeleton height={14} className="mt-6" />
        <Skeleton height={14} className="mt-2" />
        <Skeleton width="60%" height={14} className="mt-2" />
        <Skeleton height={160} radius={radius.lg} className="mt-6" />
      </View>
    </View>
  );
}

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isAdmin = useAuthStore((state) => state.profile?.role === 'admin');

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(
      doc(reportsCollection, id),
      (snapshot) => {
        setReport(snapshot.exists() ? snapshot.data() : null);
        setFailed(false);
        setLoading(false);
      },
      (err) => {
        console.error('Failed to load report:', err);
        setFailed(true);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [id]);

  if (loading) {
    return (
      <Screen edges={['bottom']}>
        <DetailSkeleton />
      </Screen>
    );
  }

  if (failed || !report) {
    return (
      <Screen edges={['bottom']}>
        <OfflineBanner />
        <View className="flex-1 justify-center">
          <EmptyState
            tone={failed ? 'error' : 'neutral'}
            icon={failed ? 'offline' : 'inbox'}
            title={failed ? "We couldn't load this report" : 'Report not found'}
            body={
              failed
                ? 'Check your internet connection and try again.'
                : 'It may have been removed by the person who reported it or by an administrator.'
            }
            actionLabel="Go back"
            onAction={() => router.back()}
          />
        </View>
      </Screen>
    );
  }

  const meta = CATEGORY_META[report.category] ?? CATEGORY_META.Other;
  const { lat, lng } = report.location ?? {};
  const hasLocation = typeof lat === 'number' && typeof lng === 'number' && Number.isFinite(lat) && Number.isFinite(lng);
  const hasNotes = !!report.adminNotes?.trim() && report.status !== 'Rejected';
  const photoWidth = Math.round(width * PixelRatio.get());

  return (
    <Screen edges={['bottom']}>
      <Stack.Screen options={{ title: meta.shortLabel }} />
      <OfflineBanner />
      <ScrollView contentContainerClassName="pb-12">
        {report.imageUrl ? (
          <Image
            source={{ uri: cloudinaryResized(report.imageUrl, photoWidth) }}
            style={{ width: '100%', aspectRatio: 4 / 3, backgroundColor: colors.surface.muted }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
            accessibilityLabel={`Photo of the problem: ${report.title}`}
          />
        ) : (
          <View
            className="items-center justify-center"
            style={{ width: '100%', height: 160, backgroundColor: `${meta.tint}1A` }}>
            <Icon name={meta.icon} size={48} color={meta.tint} />
            <Text variant="caption" color="muted" className="mt-2">
              No photo added
            </Text>
          </View>
        )}

        <View className="px-5 pt-5">
          <StatusBadge status={report.status} size="md" />
          <Text variant="h1" className="mt-3" accessibilityRole="header">
            {report.title}
          </Text>
          <Text variant="label" weight="regular" color="muted" className="mt-1">
            {report.category}
            {report.area ? ` · ${report.area}` : ''} · Reported {formatDate(report.createdAt)}
          </Text>
          <Text className="mt-4" color="secondary">
            {report.description}
          </Text>

          {hasNotes ? (
            <Card tone="tint" className="mt-6">
              <View className="mb-1 flex-row items-center">
                <Icon name="council" size={18} color={colors.brand.teal700} />
                <Text variant="label" weight="semibold" className="ml-2" style={{ color: colors.brand.teal700 }}>
                  Update from the council
                </Text>
              </View>
              <Text>{report.adminNotes}</Text>
            </Card>
          ) : null}

          <View className="mt-7">
            <SectionTitle>Progress</SectionTitle>
            <Card>
              <StatusTimeline
                status={report.status}
                createdAt={report.createdAt}
                updatedAt={report.updatedAt}
                rejectionReason={report.adminNotes}
              />
            </Card>
          </View>

          <View className="mt-7">
            <SectionTitle>Location</SectionTitle>
            <Card>
              <View className="mb-3 flex-row items-start">
                <Icon name="pin" size={20} color={colors.brand.teal600} />
                <View className="ml-2 flex-1">
                  <Text weight="medium">{report.address ?? report.area ?? 'No address given'}</Text>
                  {report.address && report.area ? (
                    <Text variant="caption" color="muted">
                      {report.area}
                    </Text>
                  ) : null}
                </View>
              </View>
              {hasLocation ? (
                <MiniMap lat={lat} lng={lng} />
              ) : (
                <Text variant="caption" color="muted">
                  The reporter didn&apos;t add an exact location.
                </Text>
              )}
            </Card>
          </View>

          {isAdmin ? (
            <View className="mt-7">
              <SectionTitle>Admin</SectionTitle>
              {/* key: reseed the draft if a different report loads into this screen */}
              <AdminControls key={report.id} report={report} />
            </View>
          ) : null}

          <Text variant="caption" color="muted" align="center" className="mt-8">
            Last updated {formatDate(report.updatedAt)}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
