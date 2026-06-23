import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '@splitcheck/ui';
import { useAuthStore } from '../store/useAuthStore';

export default function SignupPage() {
  const navigate = useNavigate();
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
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput mode="outlined" label="Name" value={displayName} onChangeText={setDisplayName} style={styles.input} />
        <TextInput
          mode="outlined"
          label="Email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <TextInput mode="outlined" label="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
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

        <Button mode="text" onPress={() => navigate('/login')}>
          Already have an account? Sign in
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
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.onBackground,
    marginBottom: 8,
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
    marginTop: 4,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
  },
});
