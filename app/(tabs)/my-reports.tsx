import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReportCard } from '@/components/ReportCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Palette } from '@/constants/colors';
import { useMyReportsStore } from '@/store/useMyReportsStore';

export default function MyReportsScreen() {
  const router = useRouter();
  const reports = useMyReportsStore((state) => state.reports);
  const loading = useMyReportsStore((state) => state.status === 'loading');
  const error = useMyReportsStore((state) =>
    state.status === 'error' ? 'Could not load your reports. Please try again.' : null
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 pb-2 pt-4">
        <Text className="text-3xl font-bold text-gray-900">My Reports</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Palette.primary} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-error">{error}</Text>
        </View>
      ) : reports.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <IconSymbol name="tray.fill" size={40} color="#9CA3AF" />
          <Text className="mb-1 mt-3 text-center text-base font-semibold text-gray-900">
            You haven&apos;t reported any issues yet
          </Text>
          <Text className="text-center text-sm text-gray-500">
            Use the Report tab to submit your first report.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-6 pb-10"
          renderItem={({ item }) => (
            <ReportCard report={item} onPress={() => router.push(`/report/${item.id}`)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
