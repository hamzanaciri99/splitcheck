import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useSplitStore } from '@/store/useSplitStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ActivityItemRow, IconButton, Icon, HeadlineMd, BodyMd } from '@splitcheck/ui';
import { api, API_URL } from '@/api/client';
import { AppBottomNav } from '@/components/AppBottomNav';

export default function HistoryScreen() {
  const { dashboard, refreshDashboard } = useSplitStore();
  const user = useAuthStore((s) => s.user);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) refreshDashboard(user.id);
  }, [user]);

  const settledReceipts = dashboard.receipts.filter((r) => r.isSettled);

  const onExportCsv = async () => {
    setExporting(true);
    try {
      const tokens = await api.getTokens();
      const res = await fetch(`${API_URL}/api/checks/export.csv`, {
        headers: tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const csv = await res.text();

      const file = new File(Paths.cache, 'splitcheck-history.csv');
      file.create({ overwrite: true });
      file.write(csv);
      await Sharing.shareAsync(file.uri);
    } catch (err) {
      Alert.alert('Export failed', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row justify-between items-center px-gutter py-4">
        <View>
          <Text className="font-jakarta-bold font-bold text-[22px] text-on-background">History</Text>
          <Text className="font-sans text-on-surface-variant text-[13px] mt-0.5">Settled & completed splits</Text>
        </View>
        <IconButton accessibilityLabel="Export CSV" disabled={exporting} onPress={onExportCsv}>
          {exporting ? <ActivityIndicator size="small" color="#e5e2e1" /> : <Icon name="download" size={20} color="#e5e2e1" />}
        </IconButton>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-gutter pb-24" showsVerticalScrollIndicator={false}>
        {settledReceipts.length === 0 ? (
          <View className="flex-1 justify-center items-center p-12 gap-3 mt-10">
            <Icon name="clock" size={64} color="#859585" />
            <HeadlineMd className="text-on-surface mt-2">No History Yet</HeadlineMd>
            <BodyMd className="text-on-surface-variant text-center">
              Settled receipts will appear here once you mark them as complete.
            </BodyMd>
          </View>
        ) : (
          <View className="gap-base">
            {settledReceipts.map((receipt) => (
              <ActivityItemRow key={receipt.id} receipt={receipt} />
            ))}
          </View>
        )}
      </ScrollView>

      <AppBottomNav active="history" />
    </SafeAreaView>
  );
}
