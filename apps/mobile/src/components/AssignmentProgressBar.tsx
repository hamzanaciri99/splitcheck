import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { COLORS } from '@/theme/theme';
import { TempItem } from '@/store/useSplitStore';

type Props = {
  items: TempItem[];
};

export function AssignmentProgressBar({ items }: Props) {
  const total = items.length;
  const assigned = items.filter((i) => i.assignedTo.length > 0).length;
  const progress = total > 0 ? assigned / total : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Items Assigned</Text>
        <Text style={styles.count}>
          {assigned}/{total}
        </Text>
      </View>
      <ProgressBar
        progress={progress}
        color={COLORS.primary}
        style={styles.bar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    fontWeight: '500',
  },
  count: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
  },
  bar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surfaceVariant,
  },
});
