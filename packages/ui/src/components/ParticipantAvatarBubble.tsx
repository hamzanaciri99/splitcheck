import { View, Text, TouchableOpacity } from 'react-native';
import { getAvatarInitials } from '@splitcheck/core';
import { Icon } from './Icon';

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
  const ringSize = size + 12;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityLabel={`${isSelected ? 'Unassign' : 'Assign'} ${participant.name}`}
      className={`items-center justify-center ${isSelected ? 'border-2 border-primary bg-surface-container-lowest' : ''}`}
      style={{ width: ringSize, height: ringSize, borderRadius: ringSize / 2 }}
    >
      <View
        className="items-center justify-center overflow-hidden"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: participant.avatarColor,
          opacity: isSelected ? 1 : 0.6,
        }}
      >
        <Text className="text-white font-inter-bold font-bold" style={{ fontSize }}>
          {initials}
        </Text>
      </View>
      {isSelected && (
        <View className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary items-center justify-center border-2 border-surface-container-lowest">
          <Icon name="check" size={12} color="#223336" />
        </View>
      )}
    </TouchableOpacity>
  );
}
