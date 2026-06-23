import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, Icon } from '@splitcheck/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { useGoogleAuth } from '@/auth/useGoogleAuth';

export default function WelcomeScreen() {
  const { loginWithGoogle } = useAuthStore();
  const { request, response, promptAsync, isConfigured } = useGoogleAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (response?.type === 'success' && response.params.id_token) {
      setBusy(true);
      loginWithGoogle(response.params.id_token)
        .catch((e) => setError(e instanceof Error ? e.message : 'Google sign-in failed'))
        .finally(() => setBusy(false));
    } else if (response?.type === 'error') {
      setError('Google sign-in was cancelled or failed');
    }
  }, [response]);

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 justify-between px-6 pt-20 pb-8">
        <View>
          <Text className="text-text-primary text-[34px] font-extrabold mb-3">SplitCheck</Text>
          <Text className="text-text-secondary text-[15px] leading-[22px]">
            Track shared checks with friends. No payments here — just keeping it fair.
          </Text>
        </View>

        <View className="gap-2">
          {error && <Text className="text-negative text-[13px] mb-1 text-center">{error}</Text>}

          <Button
            variant="secondary"
            fullWidth
            icon={<Icon name="google" size={18} />}
            loading={busy}
            disabled={!isConfigured || !request || busy}
            onPress={() => promptAsync()}
          >
            Continue with Google
          </Button>

          {!isConfigured && (
            <Text className="text-text-secondary text-[11px] text-center mb-1">
              Google sign-in needs EXPO_PUBLIC_GOOGLE_CLIENT_ID configured.
            </Text>
          )}

          <Button variant="outline" fullWidth onPress={() => router.push('/(auth)/login')}>
            Sign in with email
          </Button>

          <Button variant="ghost" fullWidth onPress={() => router.push('/(auth)/signup')}>
            Create an account
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
