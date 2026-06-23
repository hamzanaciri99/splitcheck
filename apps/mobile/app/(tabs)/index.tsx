import { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSplitStore } from '@/store/useSplitStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BalanceBentoSection, ActivityItemRow, IconButton, Icon } from '@splitcheck/ui';

export default function ActivityScreen() {
  const { dashboard, refreshDashboard } = useSplitStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) refreshDashboard(user.id);
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="flex-row justify-between items-center px-5 py-3">
        <View className="flex-row items-center gap-3">
          <IconButton accessibilityLabel="Menu" onPress={() => {}}>
            <Icon name="menu" size={22} color="#F5F5F5" />
          </IconButton>
          <Text className="text-text-primary text-xl font-extrabold">SplitCheck</Text>
        </View>
        <IconButton accessibilityLabel="Notifications" onPress={() => {}}>
          <Icon name="bell" size={22} color="#F5F5F5" />
        </IconButton>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="pb-24" showsVerticalScrollIndicator={false}>
        <BalanceBentoSection
          totalBalance={dashboard.totalBalance}
          owedToYou={dashboard.owedToYou}
          youOwe={dashboard.youOwe}
          onSettleUp={() => router.push('/(tabs)/chat')}
        />

        <View className="flex-row justify-between items-center mx-5 mt-6 mb-2">
          <Text className="text-text-primary text-[17px] font-bold">Recent Activity</Text>
        </View>

        {dashboard.receipts.length === 0 ? (
          <View className="p-8 items-center">
            <Text className="text-text-secondary text-sm">No split checks yet.</Text>
          </View>
        ) : (
          <View className="bg-surface rounded-2xl mx-4 overflow-hidden">
            {dashboard.receipts.map((receipt) => (
              <ActivityItemRow key={receipt.id} receipt={receipt} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
