import { useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSplitStore } from '@/store/useSplitStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BalanceBentoSection, ActivityItemRow, TopAppBar, Icon, HeadlineMd, LabelMd } from '@splitcheck/ui';
import { AppBottomNav } from '@/components/AppBottomNav';

export default function ActivityScreen() {
  const { dashboard, refreshDashboard } = useSplitStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) refreshDashboard(user.id);
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <TopAppBar onLeftPress={() => {}} onRightPress={() => {}} />

      <ScrollView className="flex-1" contentContainerClassName="pt-20 px-gutter pb-32" showsVerticalScrollIndicator={false}>
        <BalanceBentoSection
          totalBalance={dashboard.totalBalance}
          owedToYou={dashboard.owedToYou}
          youOwe={dashboard.youOwe}
          onSettleUp={() => router.push('/(tabs)/chat')}
        />

        <View className="flex-row justify-between items-center mb-stack-md">
          <HeadlineMd className="text-on-surface">Recent Activity</HeadlineMd>
          <LabelMd className="text-primary">View all</LabelMd>
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
