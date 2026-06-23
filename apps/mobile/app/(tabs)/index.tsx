import { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import { useSplitStore } from '@/store/useSplitStore';
import { BalanceBentoSection } from '@/components/BalanceBentoSection';
import { ActivityItemRow } from '@/components/ActivityItemRow';
import { COLORS } from '@/theme/theme';

export default function ActivityScreen() {
  const { dashboard, refreshDashboard } = useSplitStore();

  useEffect(() => {
    refreshDashboard();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>SplitCheck</Text>
          <Text style={styles.appSubtitle}>Your recent activity</Text>
        </View>
        <View style={styles.headerActions}>
          <IconButton icon="bell-outline" iconColor={COLORS.onSurface} size={22} onPress={() => {}} />
          <IconButton icon="menu" iconColor={COLORS.onSurface} size={22} onPress={() => {}} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance cards */}
        <BalanceBentoSection
          totalBalance={dashboard.totalBalance}
          owedToYou={dashboard.owedToYou}
          youOwe={dashboard.youOwe}
        />

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.seeAll}>See all</Text>
        </View>

        {dashboard.receipts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No activity yet. Scan your first receipt!</Text>
          </View>
        ) : (
          <View style={styles.activityList}>
            {dashboard.receipts.map((receipt) => (
              <ActivityItemRow
                key={receipt.id}
                receipt={receipt}
                onPress={() => router.push(`/split-summary/${receipt.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="camera"
        label="Scan Receipt"
        style={styles.fab}
        onPress={() => router.push('/camera')}
        color={COLORS.onPrimary}
        customSize={56}
      />
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
    paddingVertical: 12,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onBackground,
    letterSpacing: -0.3,
  },
  appSubtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onBackground,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 28,
  },
});
