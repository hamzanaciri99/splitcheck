import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { COLORS } from '@/theme/theme';
import { useAuthStore } from '@/store/useAuthStore';

export default function SignupScreen() {
  const { signup } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signup(email.trim().toLowerCase(), password, displayName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          label="Name"
          mode="outlined"
          value={displayName}
          onChangeText={setDisplayName}
          style={styles.input}
        />
        <TextInput
          label="Email"
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput
          label="Password"
          mode="outlined"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Text style={styles.helper}>At least 8 characters.</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          mode="contained"
          loading={busy}
          disabled={busy || !email || !password || !displayName}
          onPress={onSubmit}
          style={styles.button}
        >
          Create Account
        </Button>

        <Button mode="text" onPress={() => router.push('/(auth)/login')}>
          Already have an account? Sign in
        </Button>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onBackground,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  helper: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: -8,
  },
  button: {
    borderRadius: 24,
    marginTop: 8,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
  },
});
