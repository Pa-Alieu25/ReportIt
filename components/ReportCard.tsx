import { Image } from 'expo-image';
import { PixelRatio, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Text } from '@/components/ui/Text';
import { CATEGORY_META } from '@/constants/category';
import { formatDate } from '@/lib/format';
import { cloudinaryResized } from '@/lib/images';
import { colors, radius } from '@/theme';
import type { Report } from '@/types/models';

type ReportCardProps = {
  report: Report;
  onPress?: () => void;
};

const THUMB = 72;

export function ReportCard({ report, onPress }: ReportCardProps) {
  const meta = CATEGORY_META[report.category] ?? CATEGORY_META.Other;
  const thumbPx = Math.round(THUMB * PixelRatio.get());
  const place = report.area ?? report.address ?? 'No location';

  return (
    <Card
      onPress={onPress}
      padding={12}
      className="mb-3"
      accessibilityLabel={`${report.title}. ${report.category}, ${place}. Status ${report.status}. Reported ${formatDate(report.createdAt)}.`}>
      <View className="flex-row">
        {report.imageUrl ? (
          <Image
            source={{ uri: cloudinaryResized(report.imageUrl, thumbPx, thumbPx) }}
            style={{ width: THUMB, height: THUMB, borderRadius: radius.md }}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            accessible={false}
          />
        ) : (
          <View
            className="items-center justify-center"
            style={{ width: THUMB, height: THUMB, borderRadius: radius.md, backgroundColor: `${meta.tint}1F` }}>
            <Icon name={meta.icon} size={28} color={meta.tint} />
          </View>
        )}

        <View className="ml-3 flex-1">
          <Text variant="bodyStrong" weight="semibold" numberOfLines={2}>
            {report.title}
          </Text>
          <Text variant="caption" color="muted" numberOfLines={1} className="mt-0.5">
            {report.category}
          </Text>
          <View className="mt-1 flex-row items-center">
            <Icon name="pin" size={13} color={colors.text.muted} />
            <Text variant="caption" color="muted" numberOfLines={1} className="ml-1 flex-1">
              {place}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <StatusBadge status={report.status} />
            <Text variant="caption" color="muted">
              {formatDate(report.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
