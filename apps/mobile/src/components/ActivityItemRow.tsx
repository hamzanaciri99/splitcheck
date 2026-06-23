import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Receipt } from '@/repositories/SplitRepository';
import { COLORS } from '@/theme/theme';
import { getAvatarInitials, getAvatarColor } from '@/constants/seedData';

type Props = {
  receipt: Receipt;
  onPress: () => void;
};

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`;
}

export function ActivityItemRow({ receipt, onPress }: Props) {
  const initials = getAvatarInitials(receipt.title);
  const avatarColor = getAvatarColor(receipt.title);
  const isPayerMe = receipt.payer === 'You';

  const subtitle = receipt.isSettled
    ? 'All settled'
    : isPayerMe
    ? `Paid by You • ${receipt.date}`
    : `Paid by ${receipt.payer} • ${receipt.date}`;

  const amountColor = receipt.isSettled
    ? COLORS.onSurfaceVariant
    : isPayerMe
    ? COLORS.success
    : COLORS.error;

  const amountPrefix = receipt.isSettled ? '' : isPayerMe ? '+' : '-';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{receipt.title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>

      <View style={styles.amountSection}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountPrefix}{formatCurrency(receipt.totalAmount)}
        </Text>
        {receipt.isSettled && (
          <View style={styles.settledBadge}>
            <Text style={styles.settledText}>Settled</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  settledBadge: {
    marginTop: 4,
    backgroundColor: COLORS.successContainer,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  settledText: {
    fontSize: 10,
    color: COLORS.success,
    fontWeight: '600',
  },
});
