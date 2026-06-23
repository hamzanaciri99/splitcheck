import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';
import { COLORS } from '@/theme/theme';
import { getAvatarInitials, getAvatarColor } from '@/constants/seedData';

export type PersonSplit = {
  name: string;
  items: { name: string; price: number; sharePrice: number }[];
  total: number;
};

type Props = {
  person: PersonSplit;
  onRequest: () => void;
};

export function ParticipantSplitDetailCard({ person, onRequest }: Props) {
  const [expanded, setExpanded] = useState(false);
  const animHeight = useSharedValue(0);
  const initials = getAvatarInitials(person.name);
  const avatarColor = getAvatarColor(person.name);

  const toggleExpand = () => {
    const next = !expanded;
    setExpanded(next);
    animHeight.value = withTiming(next ? person.items.length * 40 + 8 : 0, { duration: 220 });
  };

  const animStyle = useAnimatedStyle(() => ({
    height: animHeight.value,
    overflow: 'hidden',
  }));

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleExpand} activeOpacity={0.8} style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.itemCount}>{person.items.length} item{person.items.length !== 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.right}>
          <Text style={styles.total}>${person.total.toFixed(2)}</Text>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.onSurfaceVariant}
          />
        </View>
      </TouchableOpacity>

      <Animated.View style={animStyle}>
        <View style={styles.itemList}>
          {person.items.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.sharePrice.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {person.name !== 'Me' && (
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={onRequest}
            style={styles.requestBtn}
            labelStyle={styles.requestLabel}
            compact
          >
            Request ${person.total.toFixed(2)}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  itemCount: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
  },
  total: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  itemList: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginRight: 8,
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.onSurface,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  requestBtn: {
    borderColor: COLORS.primary,
  },
  requestLabel: {
    color: COLORS.primary,
    fontSize: 13,
  },
});
