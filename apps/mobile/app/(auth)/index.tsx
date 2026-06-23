import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from 'react-native-paper';
import { router } from 'expo-router';
import { COLORS } from '@splitcheck/ui';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>SplitCheck</Text>
          <Text style={styles.subtitle}>
            Track shared checks with friends. No payments here — just keeping it fair.
          </Text>
        </View>

        <View style={styles.actions}>
          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            mode="contained"
            icon="google"
            style={styles.button}
            loading={busy}
            disabled={!isConfigured || !request || busy}
            onPress={() => promptAsync()}
          >
            Continue with Google
          </Button>

          {!isConfigured && (
            <Text style={styles.hint}>Google sign-in needs EXPO_PUBLIC_GOOGLE_CLIENT_ID configured.</Text>
          )}

          <Button mode="outlined" style={styles.button} onPress={() => router.push('/(auth)/login')}>
            Sign in with email
          </Button>

          <Button mode="text" onPress={() => router.push('/(auth)/signup')}>
            Create an account
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.onBackground,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    lineHeight: 22,
  },
  actions: {
    gap: 8,
  },
  button: {
    borderRadius: 24,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 4,
    textAlign: 'center',
  },
  hint: {
    color: COLORS.onSurfaceVariant,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 4,
  },
});
