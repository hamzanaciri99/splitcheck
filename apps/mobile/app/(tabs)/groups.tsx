import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { COLORS } from '@splitcheck/ui';

export default function GroupsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Groups</Text>
        <Text style={styles.subtitle}>Manage your split groups</Text>
      </View>

      <View style={styles.emptyState}>
        <MaterialCommunityIcons name="account-group-outline" size={64} color={COLORS.outlineVariant} />
        <Text style={styles.emptyTitle}>No Groups Yet</Text>
        <Text style={styles.emptyBody}>
          Create a group with your friends to easily split recurring bills and expenses.
        </Text>
        <Button mode="contained" style={styles.createBtn} icon="plus">
          Create Group
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onBackground,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginTop: 8,
  },
  emptyBody: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  createBtn: {
    marginTop: 8,
    borderRadius: 24,
  },
});
