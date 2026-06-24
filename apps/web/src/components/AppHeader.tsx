import { View, Text } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Button } from '@splitcheck/ui';
import { useAuthStore } from '../store/useAuthStore';

export function AppHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View className="flex-row items-center justify-between px-gutter py-2.5 bg-surface/70 backdrop-blur-xl border-b border-white/10">
      <View className="flex-row items-center gap-2">
        <Text className="font-jakarta-bold font-bold text-[17px] text-primary mr-2">SplitCheck</Text>
        <Button variant="ghost" onPress={() => navigate('/')}>
          Chats
        </Button>
        <Button variant="ghost" onPress={() => navigate('/history')}>
          History
        </Button>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className="font-sans text-on-surface-variant text-[13px]">{user?.displayName}</Text>
        <Button variant="destructive" onPress={() => logout()}>
          Sign Out
        </Button>
      </View>
    </View>
  );
}
