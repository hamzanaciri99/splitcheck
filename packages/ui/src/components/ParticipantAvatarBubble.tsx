import { View, Text, TouchableOpacity } from 'react-native';
import { getAvatarInitials } from '@splitcheck/core';

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
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: participant.avatarColor,
        opacity: isSelected ? 1 : 0.55,
      }}
    >
      <Text className="text-white font-bold" style={{ fontSize }}>
        {initials}
      </Text>
      {isSelected && (
        <View className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent items-center justify-center">
          <Text className="text-accent-foreground text-[10px] font-bold">✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
