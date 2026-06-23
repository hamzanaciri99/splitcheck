import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import type { Check, CheckParticipantStatus } from '@splitcheck/core';
import { formatCurrencyCents } from '@splitcheck/core';
import { COLORS } from '@/theme/theme';

type Props = {
  check: Check;
  currentUserId: string;
  onRespond: (status: 'PAID' | 'DECLINED') => Promise<void>;
};

function statusColor(status: CheckParticipantStatus): string {
  if (status === 'PAID') return COLORS.success;
  if (status === 'DECLINED') return COLORS.error;
  return COLORS.onSurfaceVariant;
}

export function SplitRequestCard({ check, currentUserId, onRespond }: Props) {
  const [busy, setBusy] = useState<'PAID' | 'DECLINED' | null>(null);
  const isCreator = check.createdBy.id === currentUserId;
  const myParticipant = check.participants.find((p) => p.user.id === currentUserId);
  const canRespond = !isCreator && myParticipant?.status === 'PENDING';

  const respond = async (status: 'PAID' | 'DECLINED') => {
    setBusy(status);
    try {
      await onRespond(status);
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{check.title}</Text>
      <Text style={styles.subtitle}>
        Requested by {isCreator ? 'you' : check.createdBy.displayName} &middot;{' '}
        {formatCurrencyCents(check.totalAmountCents, check.currency)}
      </Text>

      <View style={styles.participantList}>
        {check.participants.map((p) => (
          <View key={p.id} style={styles.participantRow}>
            <Text style={styles.participantName} numberOfLines={1}>
              {p.user.id === currentUserId ? 'You' : p.user.displayName}
            </Text>
            <Text style={styles.participantShare}>{formatCurrencyCents(p.shareCents, check.currency)}</Text>
            <Text style={[styles.statusBadge, { color: statusColor(p.status) }]}>{p.status}</Text>
          </View>
        ))}
      </View>

      {canRespond && (
        <View style={styles.actions}>
          <Button
            mode="outlined"
            textColor={COLORS.error}
            style={styles.actionButton}
            loading={busy === 'DECLINED'}
            disabled={busy !== null}
            onPress={() => respond('DECLINED')}
          >
            Decline
          </Button>
          <Button
            mode="contained"
            buttonColor={COLORS.success}
            style={styles.actionButton}
            loading={busy === 'PAID'}
            disabled={busy !== null}
            onPress={() => respond('PAID')}
          >
            Mark as Paid
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 14,
    width: 280,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
    marginBottom: 10,
  },
  participantList: {
    gap: 6,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.onSurface,
  },
  participantShare: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '700',
    minWidth: 64,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 20,
  },
});
