import { router } from 'expo-router';
import { BottomNavBar, type NavKey } from '@splitcheck/ui';

const ROUTES: Record<NavKey, string> = {
  activity: '/(tabs)',
  chat: '/(tabs)/chat',
  groups: '/(tabs)/groups',
  history: '/(tabs)/history',
  profile: '/(tabs)/profile',
};

export function AppBottomNav({ active }: { active: NavKey }) {
  return (
    <BottomNavBar
      active={active}
      onPress={(key) => {
        if (key !== active) router.replace(ROUTES[key] as never);
      }}
    />
  );
}
