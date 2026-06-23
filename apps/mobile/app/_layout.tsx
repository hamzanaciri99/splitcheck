import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { theme } from '@/theme/theme';
import { useDatabase } from '@/hooks/useDatabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isReady } = useDatabase();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) return null;

  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="camera"
          options={{ headerShown: false, presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="assign-items" options={{ headerShown: false }} />
        <Stack.Screen name="split-summary/[receiptId]" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
