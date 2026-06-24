import { router } from 'expo-router';
import { BottomNavBar, type NavKey } from '@splitcheck/ui';

const ROUTES: Record<NavKey, string> = {
  activity: '/(tabs)',
  chat: '/(tabs)/chat',
  groups: '/(tabs)/groups',
  history: '/(tabs)/history',
};

export function AppBottomNav({ active }: { active?: NavKey | null }) {
  return (
    <BottomNavBar
      active={active}
      onPress={(key) => {
        if (key !== active) router.replace(ROUTES[key] as never);
      }}
    />
  );
}
