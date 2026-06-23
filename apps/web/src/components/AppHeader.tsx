import { View, Text } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Button } from '@splitcheck/ui';
import { useAuthStore } from '../store/useAuthStore';

export function AppHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View className="flex-row items-center justify-between px-5 py-2.5 bg-surface border-b border-border">
      <View className="flex-row items-center gap-2">
        <Text className="text-text-primary text-[17px] font-extrabold mr-2">SplitCheck</Text>
        <Button variant="ghost" onPress={() => navigate('/')}>
          Chats
        </Button>
        <Button variant="ghost" onPress={() => navigate('/history')}>
          History
        </Button>
      </View>
      <View className="flex-row items-center gap-2">
        <Text className="text-text-secondary text-[13px]">{user?.displayName}</Text>
        <Button variant="destructive" onPress={() => logout()}>
          Sign Out
        </Button>
      </View>
    </View>
  );
}
