import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, IconButton, Snackbar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SplitRepository, Receipt, ReceiptItem } from '@/repositories/SplitRepository';
import { ParticipantSplitDetailCard, PersonSplit } from '@/components/ParticipantSplitDetailCard';
import { useSplitStore } from '@/store/useSplitStore';
import { COLORS } from '@/theme/theme';

export default function SplitSummaryScreen() {
  const { receiptId } = useLocalSearchParams<{ receiptId: string }>();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [personSplits, setPersonSplits] = useState<PersonSplit[]>([]);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const { settleReceipt, refreshDashboard } = useSplitStore();

  useEffect(() => {
    load();
  }, [receiptId]);

  async function load() {
    if (!receiptId) return;
    const id = parseInt(receiptId, 10);
    const [r, dbItems] = await Promise.all([
      SplitRepository.getReceiptById(id),
      SplitRepository.getItemsForReceipt(id),
    ]);
    setReceipt(r);
    setItems(dbItems);
    setPersonSplits(buildPersonSplits(dbItems));
  }

  function buildPersonSplits(dbItems: ReceiptItem[]): PersonSplit[] {
    const map = new Map<string, PersonSplit>();

    for (const item of dbItems) {
      if (!item.assignedTo) continue;
      const people = item.assignedTo.split(',').map((s) => s.trim()).filter(Boolean);
      if (people.length === 0) continue;
      const sharePrice = item.price / people.length;

      for (const name of people) {
        if (!map.has(name)) {
          map.set(name, { name, items: [], total: 0 });
        }
        const person = map.get(name)!;
        person.items.push({ name: item.name, price: item.price, sharePrice });
        person.total += sharePrice;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.name === 'Me') return -1;
      if (b.name === 'Me') return 1;
      return a.name.localeCompare(b.name);
    });
  }

  const unassignedItems = items.filter(
    (i) => !i.assignedTo || i.assignedTo.trim() === ''
  );

  const totalAssigned = personSplits.reduce((sum, p) => sum + p.total, 0);
  const unassignedTotal = unassignedItems.reduce((sum, i) => sum + i.price, 0);

  const handleSettle = async () => {
    if (!receiptId) return;
    await settleReceipt(parseInt(receiptId, 10));
    await refreshDashboard();
    router.replace('/(tabs)');
  };

  const handleRequest = (person: PersonSplit) => {
    setSnackbarMsg(`Payment request sent to ${person.name} for $${person.total.toFixed(2)}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={COLORS.onSurface}
          onPress={() => router.back()}
        />
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>{receipt?.title ?? 'Split Summary'}</Text>
          <Text style={styles.subtitle}>{receipt?.date ?? ''} · Paid by {receipt?.payer ?? '—'}</Text>
        </View>
        <IconButton
          icon="home-outline"
          iconColor={COLORS.onSurface}
          onPress={() => router.replace('/(tabs)')}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Assignment summary card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <MaterialCommunityIcons name="account-group" size={20} color={COLORS.primary} />
            <Text style={styles.summaryText}>
              {personSplits.length} {personSplits.length === 1 ? 'person' : 'people'} •{' '}
              {items.length - unassignedItems.length}/{items.length} items assigned
            </Text>
          </View>
          {receipt && (
            <View style={styles.summaryRow}>
              <MaterialCommunityIcons name="receipt" size={20} color={COLORS.primary} />
              <Text style={styles.summaryText}>
                Total: <Text style={styles.summaryBold}>${receipt.totalAmount.toFixed(2)}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Unassigned warning */}
        {unassignedItems.length > 0 && (
          <View style={styles.warningCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={18} color={COLORS.error} />
            <View style={styles.warningText}>
              <Text style={styles.warningTitle}>
                {unassignedItems.length} unassigned item{unassignedItems.length > 1 ? 's' : ''}
              </Text>
              <Text style={styles.warningSubtitle}>
                ${unassignedTotal.toFixed(2)} not allocated — {unassignedItems.map((i) => i.name).join(', ')}
              </Text>
            </View>
          </View>
        )}

        {/* Per-person cards */}
        <Text style={styles.sectionLabel}>BREAKDOWN BY PERSON</Text>

        {personSplits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No items have been assigned yet.</Text>
          </View>
        ) : (
          personSplits.map((person) => (
            <ParticipantSplitDetailCard
              key={person.name}
              person={person}
              onRequest={() => handleRequest(person)}
            />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating settle bar */}
      <View style={styles.settleBar}>
        <View style={styles.settleBarInfo}>
          <Text style={styles.settleBarLabel}>Total Assigned</Text>
          <Text style={styles.settleBarAmount}>${totalAssigned.toFixed(2)}</Text>
        </View>
        <Button
          mode="contained"
          onPress={handleSettle}
          style={styles.settleBtn}
          labelStyle={styles.settleBtnLabel}
          icon="check-all"
          disabled={receipt?.isSettled}
        >
          {receipt?.isSettled ? 'Settled' : 'Settle All'}
        </Button>
      </View>

      <Snackbar
        visible={!!snackbarMsg}
        onDismiss={() => setSnackbarMsg('')}
        duration={3000}
        action={{ label: 'OK', onPress: () => setSnackbarMsg('') }}
      >
        {snackbarMsg}
      </Snackbar>
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
    alignItems: 'center',
    paddingRight: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  summaryCard: {
    backgroundColor: COLORS.primaryContainer,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: COLORS.onPrimaryContainer,
  },
  summaryBold: {
    fontWeight: '700',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.errorContainer,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 14,
  },
  warningText: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.error,
  },
  warningSubtitle: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 2,
    opacity: 0.8,
  },
  sectionLabel: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
  },
  settleBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 12,
    paddingLeft: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  settleBarInfo: {
    flex: 1,
  },
  settleBarLabel: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
  settleBarAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.onSurface,
  },
  settleBtn: {
    borderRadius: 14,
  },
  settleBtnLabel: {
    fontWeight: '700',
    fontSize: 14,
  },
});
