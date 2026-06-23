import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { theme } from '@splitcheck/ui';
import { useAuthStore } from '@/store/useAuthStore';

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: __DEV__ ? 1.0 : 0.2,
});

function RootLayout() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'loading') return null;

  const signedIn = status === 'signedIn';

  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="chat/[conversationId]" options={{ headerShown: false }} />
          <Stack.Screen name="new-chat" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="new-split/[conversationId]" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack.Protected>
        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </PaperProvider>
  );
}

export default Sentry.wrap(RootLayout);
