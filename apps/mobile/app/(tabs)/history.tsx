import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useSplitStore } from '@/store/useSplitStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ActivityItemRow, IconButton, Icon } from '@splitcheck/ui';
import { api, API_URL } from '@/api/client';

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
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="flex-row justify-between items-center px-5 py-4">
        <View>
          <Text className="text-text-primary text-[22px] font-extrabold">History</Text>
          <Text className="text-text-secondary text-[13px] mt-0.5">Settled & completed splits</Text>
        </View>
        <IconButton accessibilityLabel="Export CSV" disabled={exporting} onPress={onExportCsv}>
          {exporting ? <ActivityIndicator size="small" color="#F5F5F5" /> : <Icon name="download" size={20} color="#F5F5F5" />}
        </IconButton>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {settledReceipts.length === 0 ? (
          <View className="flex-1 justify-center items-center p-12 gap-3 mt-10">
            <Icon name="clock" size={64} color="#6E6E73" />
            <Text className="text-text-primary text-lg font-bold mt-2">No History Yet</Text>
            <Text className="text-text-secondary text-sm text-center leading-5">
              Settled receipts will appear here once you mark them as complete.
            </Text>
          </View>
        ) : (
          <View className="bg-surface rounded-2xl mx-4 overflow-hidden mb-4">
            {settledReceipts.map((receipt) => (
              <ActivityItemRow key={receipt.id} receipt={receipt} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
