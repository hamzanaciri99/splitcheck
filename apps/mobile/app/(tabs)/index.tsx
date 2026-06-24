import { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSplitStore } from '@/store/useSplitStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  BalanceBentoSection,
  ActivityItemRow,
  Icon,
  IconButton,
  SearchBar,
  UserAvatarButton,
  HeadlineMd,
  LabelMd,
} from '@splitcheck/ui';
import { AppBottomNav } from '@/components/AppBottomNav';

export default function ActivityScreen() {
  const { dashboard, refreshDashboard } = useSplitStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) refreshDashboard(user.id);
  }, [user]);

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center justify-between px-gutter h-16 bg-surface/70 backdrop-blur-xl border-b border-white/10">
        <Text className="font-jakarta-bold font-bold text-[17px] text-primary shrink" numberOfLines={1}>
          SplitCheck
        </Text>
        <View className="flex-row items-center gap-2">
          <IconButton accessibilityLabel="Notifications" size={36} onPress={() => router.push('/notifications')}>
            <Icon name="bell" size={20} color="#d5e8ec" />
          </IconButton>
          <SearchBar
            editable={false}
            containerClassName="w-[88px]"
            onPress={() => router.push('/(tabs)/chat?focusSearch=1')}
          />
          <UserAvatarButton
            displayName={user.displayName}
            avatarColor={user.avatarColor}
            size={32}
            onPress={() => router.push('/(tabs)/profile')}
          />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pt-6 px-gutter pb-32" showsVerticalScrollIndicator={false}>
        <BalanceBentoSection
          totalBalance={dashboard.totalBalance}
          owedToYou={dashboard.owedToYou}
          youOwe={dashboard.youOwe}
          onSettleUp={() => router.push('/(tabs)/chat')}
        />

        <View className="flex-row justify-between items-center mb-stack-md">
          <HeadlineMd className="text-on-surface">Recent Activity</HeadlineMd>
          <Pressable onPress={() => router.push('/(tabs)/history')}>
            <LabelMd className="text-primary">View all</LabelMd>
          </Pressable>
        </View>

        {dashboard.receipts.length === 0 ? (
          <View className="p-8 items-center">
            <Text className="font-sans text-on-surface-variant text-sm">No split checks yet.</Text>
          </View>
        ) : (
          <View className="gap-base">
            {dashboard.receipts.map((receipt) => (
              <ActivityItemRow key={receipt.id} receipt={receipt} />
            ))}
          </View>
        )}
      </ScrollView>

      <Pressable
        accessibilityLabel="Scan Receipt"
        onPress={() => router.push('/scan')}
        className="absolute bottom-28 right-6 z-40 bg-primary flex-row items-center gap-3 px-6 py-4 rounded-full active:scale-90"
        style={{ shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } }}
      >
        <Icon name="receipt" size={22} color="#223336" />
        <LabelMd className="text-on-primary font-bold">Scan Receipt</LabelMd>
      </Pressable>

      <AppBottomNav active="activity" />
    </SafeAreaView>
  );
}
