import { useCallback, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import type { Check, CheckParticipantStatus } from '@splitcheck/core';
import { formatCurrencyCents, getAvatarInitials, getAvatarColor } from '@splitcheck/core';
import {
  Button,
  Icon,
  ProgressBar,
  TopAppBar,
  HeadlineLg,
  HeadlineMd,
  BodyMd,
  LabelMd,
  LabelSm,
} from '@splitcheck/ui';
import { api } from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useChatStore } from '@/store/useChatStore';

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
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#d5e8ec" />
      </SafeAreaView>
    );
  }

  const isCreator = check.createdBy.id === user.id;
  const settledCount = check.participants.filter((p) => p.status === 'PAID').length;
  const percentComplete = Math.round((settledCount / check.participants.length) * 100);
  const dateLabel = new Date(check.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const remind = async (participantName: string) => {
    setReminding(participantName);
    try {
      await sendMessage(
        check.conversationId,
        `Reminder: please settle up for "${check.title}" (${formatCurrencyCents(check.totalAmountCents, check.currency)})`
      );
    } finally {
      setReminding(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TopAppBar leftIcon="arrow-left" onLeftPress={() => router.back()} onRightPress={() => {}} />

      <ScrollView className="flex-1" contentContainerClassName="pt-24 pb-12 px-gutter" showsVerticalScrollIndicator={false}>
        <View className="mb-stack-lg">
          <HeadlineLg className="text-on-surface mb-stack-sm">Split Summary</HeadlineLg>
          <BodyMd className="text-on-surface-variant">
            {check.title} &middot; {dateLabel}
          </BodyMd>
        </View>

        <View className="bg-surface-container-low rounded-lg p-container-padding border border-outline-variant mb-stack-lg">
          <View className="flex-row justify-between items-center mb-stack-md">
            <LabelMd className="text-on-surface-variant">Settled</LabelMd>
            <LabelMd className="text-primary">{percentComplete}% Complete</LabelMd>
          </View>
          <ProgressBar progress={percentComplete / 100} />
        </View>

        <View className="gap-stack-lg">
          {check.participants.map((p) => {
            const isMe = p.user.id === user.id;
            const name = isMe ? 'You' : p.user.displayName;
            const initials = getAvatarInitials(p.user.displayName);
            const avatarColor = getAvatarColor(p.user.displayName);
            const showRemind = isCreator && !isMe && p.status === 'PENDING';
            const isDeclined = p.status === 'DECLINED';

            return (
              <View
                key={p.id}
                className={`rounded-lg p-container-padding border ${
                  isDeclined ? 'bg-surface-container-low border-error/30' : 'bg-surface-container border-outline-variant'
                }`}
              >
                <View className="flex-row justify-between items-start">
                  <View className="flex-row items-center gap-stack-md flex-1">
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center border-2 border-outline-variant"
                      style={{ backgroundColor: avatarColor }}
                    >
                      <Text className="text-white text-sm font-inter-bold font-bold">{initials}</Text>
                    </View>
                    <View className="flex-1">
                      <HeadlineMd className="text-on-surface">{name}</HeadlineMd>
                      {isDeclined ? (
                        <LabelSm className="text-error font-bold uppercase tracking-wider">Declined</LabelSm>
                      ) : (
                        <LabelSm className="text-on-surface-variant">{p.status === 'PAID' ? 'Settled' : 'Pending'}</LabelSm>
                      )}
                    </View>
                  </View>
                  <View className="items-end">
                    <HeadlineMd className={isDeclined ? 'text-error' : 'text-on-surface'}>
                      {formatCurrencyCents(p.shareCents, check.currency)}
                    </HeadlineMd>
                    {showRemind && (
                      <View className="mt-stack-sm">
                        <Button
                          size="sm"
                          variant="primary"
                          loading={reminding === name}
                          disabled={reminding !== null}
                          onPress={() => remind(name)}
                          icon={<Icon name="payments" size={16} color="#223336" />}
                        >
                          Request
                        </Button>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      <View className="absolute bottom-6 left-gutter right-gutter z-40">
        <View className="bg-surface-container-highest/90 backdrop-blur-xl border border-white/10 p-stack-lg rounded-xl flex-row justify-between items-center">
          <View>
            <LabelSm className="text-on-surface-variant uppercase tracking-widest mb-1">Total Receipt Sum</LabelSm>
            <Text className="font-jakarta-bold font-bold text-[28px] text-white">
              {formatCurrencyCents(check.totalAmountCents, check.currency)}
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
