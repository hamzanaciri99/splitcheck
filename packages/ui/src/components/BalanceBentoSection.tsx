import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

type Props = {
  totalBalance: number;
  owedToYou: number;
  youOwe: number;
};

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`;
}

export function BalanceBentoSection({ totalBalance, owedToYou, youOwe }: Props) {
  const isPositive = totalBalance >= 0;

  return (
    <View style={styles.container}>
      {/* Main balance card */}
      <View style={[styles.mainCard, { backgroundColor: COLORS.primary }]}>
        <Text style={styles.mainLabel}>Total Balance</Text>
        <Text style={[styles.mainAmount, { color: isPositive ? '#C7EDA8' : '#F9DEDC' }]}>
          {isPositive ? '+' : '-'}{formatCurrency(totalBalance)}
        </Text>
        <Text style={styles.mainSubtitle}>
          {isPositive ? 'You are owed overall' : 'You owe overall'}
        </Text>
      </View>

      {/* Sub cards row */}
      <View style={styles.subRow}>
        <View style={[styles.subCard, { backgroundColor: COLORS.successContainer }]}>
          <Text style={[styles.subLabel, { color: COLORS.success }]}>Owed to You</Text>
          <Text style={[styles.subAmount, { color: COLORS.success }]}>
            {formatCurrency(owedToYou)}
          </Text>
        </View>

        <View style={[styles.subCard, { backgroundColor: COLORS.errorContainer }]}>
          <Text style={[styles.subLabel, { color: COLORS.error }]}>You Owe</Text>
          <Text style={[styles.subAmount, { color: COLORS.error }]}>
            {formatCurrency(youOwe)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    gap: 10,
  },
  mainCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  mainLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  mainAmount: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  mainSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },
  subRow: {
    flexDirection: 'row',
    gap: 10,
  },
  subCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subAmount: {
    fontSize: 22,
    fontWeight: '700',
  },
});
