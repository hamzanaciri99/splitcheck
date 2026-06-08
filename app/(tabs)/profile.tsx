import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Divider } from 'react-native-paper';
import { COLORS } from '@/theme/theme';
import { getAvatarColor, getAvatarInitials } from '@/constants/seedData';

const MY_NAME = 'Me';

type MenuItem = {
  icon: string;
  label: string;
  value?: string;
};

const MENU_SECTIONS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Account',
    items: [
      { icon: 'account-edit-outline', label: 'Edit Profile' },
      { icon: 'bell-outline', label: 'Notifications' },
      { icon: 'shield-lock-outline', label: 'Privacy & Security' },
    ],
  },
  {
    title: 'Payments',
    items: [
      { icon: 'credit-card-outline', label: 'Payment Methods' },
      { icon: 'bank-outline', label: 'Bank Accounts' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'currency-usd', label: 'Currency', value: 'USD' },
      { icon: 'translate', label: 'Language', value: 'English' },
      { icon: 'theme-light-dark', label: 'Appearance', value: 'Light' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline', label: 'Help & FAQ' },
      { icon: 'information-outline', label: 'About SplitCheck' },
    ],
  },
];

export default function ProfileScreen() {
  const avatarColor = getAvatarColor(MY_NAME);
  const initials = getAvatarInitials(MY_NAME);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Profile hero */}
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>My Profile</Text>
        <Text style={styles.email}>naciri.nhamza@gmail.com</Text>
      </View>

      <View style={styles.menuContainer}>
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, ii) => (
                <View key={ii}>
                  {ii > 0 && <Divider style={styles.divider} />}
                  <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={COLORS.primary} />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <View style={styles.menuRight}>
                      {item.value && <Text style={styles.menuValue}>{item.value}</Text>}
                      <MaterialCommunityIcons name="chevron-right" size={18} color={COLORS.outlineVariant} />
                    </View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.onBackground,
  },
  email: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 3,
  },
  menuContainer: {
    paddingHorizontal: 16,
    gap: 16,
    paddingBottom: 24,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  divider: {
    backgroundColor: COLORS.surfaceVariant,
    marginLeft: 52,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.onSurface,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menuValue: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
});
