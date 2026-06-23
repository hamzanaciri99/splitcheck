import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getAvatarInitials } from '@/utils/avatar';

export type AvatarPerson = {
  name: string;
  avatarColor: string;
};

type Props = {
  participant: AvatarPerson;
  isSelected?: boolean;
  size?: number;
  onPress?: () => void;
};

export function ParticipantAvatarBubble({ participant, isSelected = false, size = 44, onPress }: Props) {
  const initials = getAvatarInitials(participant.name);
  const fontSize = size * 0.38;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityLabel={`${isSelected ? 'Unassign' : 'Assign'} ${participant.name}`}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: participant.avatarColor,
          borderWidth: isSelected ? 3 : 0,
          borderColor: isSelected ? '#FFFFFF' : 'transparent',
          opacity: isSelected ? 1 : 0.7,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
