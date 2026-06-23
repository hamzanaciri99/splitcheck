import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { ActivityItemRow, COLORS } from '@splitcheck/ui';
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
    <View style={styles.page}>
      <AppHeader />

      <View style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>History</Text>
            <Text style={styles.subtitle}>Settled & completed splits</Text>
          </View>
          <Button
            mode="text"
            compact
            accessibilityLabel="Export CSV"
            loading={exporting}
            disabled={exporting}
            onPress={onExportCsv}
          >
            Export CSV
          </Button>
        </View>

        <ScrollView style={styles.list}>
          {settledReceipts.length === 0 ? (
            <Text style={styles.empty}>Settled splits will appear here once everyone pays up.</Text>
          ) : (
            settledReceipts.map((receipt) => <ActivityItemRow key={receipt.id} receipt={receipt} />)
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onBackground,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: COLORS.onSurfaceVariant,
  },
});
