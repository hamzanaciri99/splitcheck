import { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import type { Check, CheckParticipantStatus } from '@splitcheck/core';
import { formatCurrencyCents, getAvatarInitials, getAvatarColor } from '@splitcheck/core';
import { Button, IconButton, Icon } from '@splitcheck/ui';
import { api } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';

function statusBadgeClass(status: CheckParticipantStatus): string {
  if (status === 'PAID') return 'bg-positive-bg text-positive';
  if (status === 'DECLINED') return 'bg-negative-bg text-negative';
  return 'bg-surface-alt text-text-secondary';
}

export default function CheckDetailScreen() {
  const { checkId } = useLocalSearchParams<{ checkId: string }>();
  const user = useAuthStore((s) => s.user);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const [check, setCheck] = useState<Check | null>(null);
  const [loading, setLoading] = useState(true);
  const [reminding, setReminding] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Check>(`/api/checks/${checkId}`);
      setCheck(data);
    } finally {
      setLoading(false);
    }
  }, [checkId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading || !check || !user) {
    return (
      <SafeAreaView className="flex-1 bg-base items-center justify-center">
        <ActivityIndicator color="#A8E8D6" />
      </SafeAreaView>
    );
  }

  const isCreator = check.createdBy.id === user.id;
  const settledCount = check.participants.filter((p) => p.status === 'PAID').length;

  const remind = async (participantName: string) => {
    setReminding(participantName);
    try {
      await sendMessage(check.conversationId, `Reminder: please settle up for "${check.title}" (${formatCurrencyCents(check.totalAmountCents, check.currency)})`);
    } finally {
      setReminding(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-base">
      <View className="flex-row items-center px-2 py-2">
        <IconButton accessibilityLabel="Back" onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#F5F5F5" />
        </IconButton>
        <Text className="text-text-primary text-[17px] font-bold ml-1">Split Summary</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-4 mb-6">
          <Text className="text-text-secondary text-xs font-medium tracking-wide mb-2">TOTAL AMOUNT</Text>
          <Text className="text-text-primary text-4xl font-extrabold mb-2">
            {formatCurrencyCents(check.totalAmountCents, check.currency)}
          </Text>
          <Text className="text-text-primary text-[16px] font-semibold">{check.title}</Text>
          <Text className="text-text-secondary text-xs mt-1">
            Requested by {isCreator ? 'you' : check.createdBy.displayName} &middot; {settledCount}/
            {check.participants.length} settled
          </Text>
        </View>

        <Text className="text-text-secondary text-xs font-semibold tracking-wide mb-2">PARTICIPANTS</Text>
        <View className="bg-surface rounded-2xl overflow-hidden">
          {check.participants.map((p, idx) => {
            const isMe = p.user.id === user.id;
            const name = isMe ? 'You' : p.user.displayName;
            const initials = getAvatarInitials(p.user.displayName);
            const avatarColor = getAvatarColor(p.user.displayName);
            const showRemind = isCreator && !isMe && p.status === 'PENDING';

            return (
              <View
                key={p.id}
                className={`flex-row items-center px-4 py-3 ${idx > 0 ? 'border-t border-border' : ''}`}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: avatarColor }}
                >
                  <Text className="text-white text-xs font-bold">{initials}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary text-[14px] font-semibold">{name}</Text>
                  <Text className="text-text-secondary text-xs mt-0.5">
                    {formatCurrencyCents(p.shareCents, check.currency)}
                  </Text>
                </View>
                {showRemind ? (
                  <Button variant="outline" loading={reminding === name} disabled={reminding !== null} onPress={() => remind(name)}>
                    Remind
                  </Button>
                ) : (
                  <View className={`rounded-full px-3 py-1 ${statusBadgeClass(p.status)}`}>
                    <Text className={`text-[11px] font-bold ${statusBadgeClass(p.status).split(' ')[1]}`}>{p.status}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
