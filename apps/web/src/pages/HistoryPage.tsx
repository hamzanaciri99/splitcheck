import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ActivityItemRow, Button } from '@splitcheck/ui';
import { useAuthStore } from '../store/useAuthStore';
import { useSplitStore } from '../store/useSplitStore';
import { api, API_URL } from '../api/client';
import { AppHeader } from '../components/AppHeader';

export default function HistoryPage() {
  const user = useAuthStore((s) => s.user);
  const { dashboard, refreshDashboard } = useSplitStore();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user) refreshDashboard(user.id);
  }, [user]);

  if (!user) return null;

  const settledReceipts = dashboard.receipts.filter((r) => r.isSettled);

  const onExportCsv = async () => {
    setExporting(true);
    try {
      const tokens = await api.getTokens();
      const res = await fetch(`${API_URL}/api/checks/export.csv`, {
        headers: tokens ? { Authorization: `Bearer ${tokens.accessToken}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'splitcheck-history.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Export failed, please try again');
    } finally {
      setExporting(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas" style={{ minHeight: '100vh' as unknown as number }}>
      <AppHeader />

      <View className="flex-1 max-w-[640px] w-full self-center p-5">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-text-primary text-[22px] font-extrabold">History</Text>
            <Text className="text-text-secondary text-[13px] mt-0.5">Settled & completed splits</Text>
          </View>
          <Button variant="ghost" accessibilityLabel="Export CSV" loading={exporting} disabled={exporting} onPress={onExportCsv}>
            Export CSV
          </Button>
        </View>

        <ScrollView className="flex-1 bg-surface rounded-2xl">
          {settledReceipts.length === 0 ? (
            <Text className="p-6 text-center text-text-secondary">
              Settled splits will appear here once everyone pays up.
            </Text>
          ) : (
            settledReceipts.map((receipt) => <ActivityItemRow key={receipt.id} receipt={receipt} />)
          )}
        </ScrollView>
      </View>
    </View>
  );
}
