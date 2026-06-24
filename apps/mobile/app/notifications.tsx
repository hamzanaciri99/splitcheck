import { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { TopAppBar, Icon, HeadlineMd, BodyMd, LabelSm } from '@splitcheck/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const user = useAuthStore((s) => s.user);
  const { notifications, loading, refresh } = useNotificationsStore();

  useFocusEffect(
    useCallback(() => {
      if (user) refresh(user.id);
    }, [user])
  );

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TopAppBar title="Notifications" leftIcon="arrow-left" onLeftPress={() => router.back()} onRightPress={() => {}} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pt-24 px-gutter pb-12"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => refresh(user.id)} tintColor="#d5e8ec" />}
      >
        {notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center p-12 gap-3 mt-10">
            <Icon name="bell" size={64} color="#859585" />
            <HeadlineMd className="text-on-surface mt-2">No Notifications</HeadlineMd>
            <BodyMd className="text-on-surface-variant text-center">
              Updates on your split requests will show up here.
            </BodyMd>
          </View>
        ) : (
          <View className="gap-stack-md">
            {notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                className="flex-row items-center gap-stack-md bg-surface-container border border-outline-variant rounded-xl p-stack-md active:scale-[0.98]"
                onPress={() => router.push(`/chat/${n.conversationId}`)}
              >
                <View className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
                  <Icon name="payments" size={18} color="#d5e8ec" />
                </View>
                <View className="flex-1">
                  <Text className="font-sans text-on-surface text-[14px]">{n.text}</Text>
                  <LabelSm className="text-on-surface-variant mt-0.5">{timeAgo(n.timestamp)}</LabelSm>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
