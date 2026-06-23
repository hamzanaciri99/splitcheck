import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '@splitcheck/ui';
import { useAuthStore } from '../store/useAuthStore';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>SplitCheck</Text>
        <Text style={styles.subtitle}>Track shared checks with friends. No payments here.</Text>

        {GOOGLE_CLIENT_ID ? (
          <View style={styles.googleButton}>
            <GoogleLogin
              onSuccess={(resp) => {
                if (resp.credential) {
                  loginWithGoogle(resp.credential).catch((e) =>
                    setError(e instanceof Error ? e.message : 'Google sign-in failed')
                  );
                }
              }}
              onError={() => setError('Google sign-in was cancelled or failed')}
            />
          </View>
        ) : (
          <Text style={styles.hint}>Google sign-in needs VITE_GOOGLE_CLIENT_ID configured.</Text>
        )}

        <TextInput
          mode="outlined"
          label="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput mode="outlined" label="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button mode="contained" loading={busy} disabled={busy || !email || !password} onPress={onSubmit} style={styles.button}>
          Sign In
        </Button>

        <Button mode="text" onPress={() => navigate('/signup')}>
          Don&apos;t have an account? Create one
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.onBackground,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    marginBottom: 8,
  },
  googleButton: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  button: {
    borderRadius: 24,
    marginTop: 4,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
  },
  hint: {
    color: COLORS.onSurfaceVariant,
    fontSize: 12,
  },
});
