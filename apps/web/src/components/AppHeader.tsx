import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '@splitcheck/ui';
import { useAuthStore } from '../store/useAuthStore';

export function AppHeader() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <View style={styles.bar}>
      <View style={styles.left}>
        <Text style={styles.brand}>SplitCheck</Text>
        <Button mode="text" compact onPress={() => navigate('/')}>
          Chats
        </Button>
        <Button mode="text" compact onPress={() => navigate('/history')}>
          History
        </Button>
      </View>
      <View style={styles.right}>
        <Text style={styles.userName}>{user?.displayName}</Text>
        <Button mode="text" compact textColor={COLORS.error} onPress={() => logout()}>
          Sign Out
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.onBackground,
    marginRight: 8,
  },
  userName: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
});
