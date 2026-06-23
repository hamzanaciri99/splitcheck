import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@splitcheck/ui';
import { getAvatarColor, getAvatarInitials } from '@splitcheck/core';
import { useAuthStore } from '@/store/useAuthStore';

type MenuItem = {
  icon: IconName;
  label: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
};

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const displayName = user?.displayName ?? '';
  const avatarColor = user?.avatarColor ?? getAvatarColor(displayName);
  const initials = getAvatarInitials(displayName);

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Account',
      items: [
        { icon: 'edit', label: 'Edit Profile' },
        { icon: 'bell', label: 'Notifications' },
        { icon: 'shield', label: 'Privacy & Security' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'dollar-sign', label: 'Currency', value: 'USD' },
        { icon: 'globe', label: 'Language', value: 'English' },
        { icon: 'moon', label: 'Appearance', value: 'Dark' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle', label: 'Help & FAQ' },
        { icon: 'info', label: 'About SplitCheck' },
      ],
    },
    {
      title: 'Session',
      items: [{ icon: 'logout', label: 'Sign Out', danger: true, onPress: () => logout() }],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="items-center pt-6 pb-5 px-5">
        <View
          className="w-[72px] h-[72px] rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: avatarColor }}
        >
          <Text className="text-white text-2xl font-extrabold">{initials}</Text>
        </View>
        <Text className="text-text-primary text-xl font-bold">{displayName}</Text>
        <Text className="text-text-secondary text-[13px] mt-1">{user?.email}</Text>
      </View>

      <View className="px-4 gap-4 pb-6">
        {menuSections.map((section, si) => (
          <View key={si} className="gap-1.5">
            <Text className="text-text-secondary text-[11px] font-semibold tracking-wide uppercase px-1">
              {section.title}
            </Text>
            <View className="bg-surface rounded-2xl overflow-hidden">
              {section.items.map((item, ii) => (
                <TouchableOpacity
                  key={ii}
                  className={`flex-row items-center px-4 py-3.5 gap-3.5 ${ii > 0 ? 'border-t border-border' : ''}`}
                  activeOpacity={0.7}
                  onPress={item.onPress}
                >
                  <Icon name={item.icon} size={20} color={item.danger ? '#F0A9A3' : '#A8E8D6'} />
                  <Text className={`flex-1 text-[15px] ${item.danger ? 'text-negative' : 'text-text-primary'}`}>
                    {item.label}
                  </Text>
                  <View className="flex-row items-center gap-1">
                    {item.value && <Text className="text-text-secondary text-[13px]">{item.value}</Text>}
                    {!item.danger && <Icon name="chevron-right" size={18} color="#6E6E73" />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
