import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Check, CheckParticipantStatus } from '@splitcheck/core';
import { formatCurrencyCents } from '@splitcheck/core';
import { Button } from './Button';

type Props = {
  check: Check;
  currentUserId: string;
  onRespond: (status: 'PAID' | 'DECLINED') => Promise<void>;
  onPress?: () => void;
};

function statusClass(status: CheckParticipantStatus): string {
  if (status === 'PAID') return 'text-primary';
  if (status === 'DECLINED') return 'text-error';
  return 'text-on-surface-variant';
}

export function SplitRequestCard({ check, currentUserId, onRespond, onPress }: Props) {
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
    <TouchableOpacity
      className="bg-surface-container border border-outline-variant rounded-xl p-stack-md w-72"
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <Text className="font-sans font-bold text-[15px] text-on-surface">{check.title}</Text>
      <Text className="font-sans text-[12px] text-on-surface-variant mt-0.5 mb-2.5">
        Requested by {isCreator ? 'you' : check.createdBy.displayName} &middot;{' '}
        {formatCurrencyCents(check.totalAmountCents, check.currency)}
      </Text>

      <View className="gap-1.5">
        {check.participants.map((p) => (
          <View key={p.id} className="flex-row items-center gap-2">
            <Text className="flex-1 font-sans text-[13px] text-on-surface" numberOfLines={1}>
              {p.user.id === currentUserId ? 'You' : p.user.displayName}
            </Text>
            <Text className="font-sans text-[13px] font-semibold text-on-surface">
              {formatCurrencyCents(p.shareCents, check.currency)}
            </Text>
            <Text className={`text-[11px] font-bold min-w-16 text-right ${statusClass(p.status)}`}>{p.status}</Text>
          </View>
        ))}
      </View>

      {canRespond && (
        <View className="flex-row gap-2 mt-3">
          <View className="flex-1">
            <Button
              size="sm"
              variant="destructive"
              loading={busy === 'DECLINED'}
              disabled={busy !== null}
              onPress={() => respond('DECLINED')}
            >
              Decline
            </Button>
          </View>
          <View className="flex-1">
            <Button size="sm" variant="primary" loading={busy === 'PAID'} disabled={busy !== null} onPress={() => respond('PAID')}>
              Mark as Paid
            </Button>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}
