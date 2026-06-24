import { Pressable, Text } from 'react-native';
import { getAvatarInitials } from '@splitcheck/core';

type Props = {
  displayName: string;
  avatarColor: string;
  size?: number;
  onPress?: () => void;
};

export function UserAvatarButton({ displayName, avatarColor, size = 36, onPress }: Props) {
  const initials = getAvatarInitials(displayName);
  const fontSize = size * 0.4;

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Open profile"
      className="items-center justify-center active:scale-90"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: avatarColor }}
    >
      <Text className="text-white font-inter-bold font-bold" style={{ fontSize }}>
        {initials}
      </Text>
    </Pressable>
  );
}
