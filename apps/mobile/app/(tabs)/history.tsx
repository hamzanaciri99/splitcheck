import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { IconButton } from 'react-native-paper';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useSplitStore } from '@/store/useSplitStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ActivityItemRow } from '@/components/ActivityItemRow';
import { api, API_URL } from '@/api/client';
import { COLORS } from '@/theme/theme';

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Settled & completed splits</Text>
        </View>
        <IconButton
          icon="download"
          accessibilityLabel="Export CSV"
          loading={exporting}
          disabled={exporting}
          onPress={onExportCsv}
        />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {settledReceipts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={64} color={COLORS.outlineVariant} />
            <Text style={styles.emptyTitle}>No History Yet</Text>
            <Text style={styles.emptyBody}>
              Settled receipts will appear here once you mark them as complete.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {settledReceipts.map((receipt) => (
              <ActivityItemRow key={receipt.id} receipt={receipt} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  scroll: {
    flex: 1,
  },
  list: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
    gap: 12,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
});
