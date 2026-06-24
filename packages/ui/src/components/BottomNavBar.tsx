import { View, Text, Pressable } from 'react-native';
import { Icon, type IconName } from './Icon';

export type NavKey = 'activity' | 'chat' | 'groups' | 'history' | 'profile';

type NavItem = { key: NavKey; label: string; icon: IconName };

const ITEMS: NavItem[] = [
  { key: 'activity', label: 'Activity', icon: 'analytics' },
  { key: 'chat', label: 'Chat', icon: 'chat' },
  { key: 'groups', label: 'Groups', icon: 'users' },
  { key: 'history', label: 'History', icon: 'clock' },
  { key: 'profile', label: 'Profile', icon: 'user' },
];

type Props = {
  active: NavKey;
  onPress: (key: NavKey) => void;
};

export function BottomNavBar({ active, onPress }: Props) {
  return (
    <View className="absolute bottom-0 left-0 w-full z-50 flex-row justify-around items-center h-20 px-2 pb-2 bg-surface/70 backdrop-blur-xl border-t border-white/10 rounded-t-xl">
      {ITEMS.map((item) => {
        const isActive = item.key === active;
        return (
          <Pressable
            key={item.key}
            onPress={() => onPress(item.key)}
            className={`flex-col items-center justify-center px-3.5 py-1 rounded-full active:scale-90 ${
              isActive ? 'bg-primary' : ''
            }`}
          >
            <Icon name={item.icon} size={22} color={isActive ? '#223336' : '#bacbb9'} />
            <Text
              className={`font-sans text-[12px] leading-[16px] mt-0.5 ${
                isActive ? 'text-on-primary' : 'text-on-surface-variant'
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
