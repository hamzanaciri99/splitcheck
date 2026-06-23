import { useState } from 'react';
import { View, Text } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@splitcheck/ui';
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
    <View className="flex-1 bg-canvas items-center justify-center p-6" style={{ minHeight: '100vh' as unknown as number }}>
      <View className="w-full max-w-[380px] gap-3">
        <Text className="text-text-primary text-2xl font-extrabold mb-2">Create Account</Text>

        <TextField label="Name" value={displayName} onChangeText={setDisplayName} />
        <TextField label="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Text className="text-text-secondary text-xs -mt-2">At least 8 characters.</Text>

        {error && <Text className="text-negative text-[13px]">{error}</Text>}

        <View className="mt-1">
          <Button
            variant="primary"
            fullWidth
            loading={busy}
            disabled={busy || !email || !password || !displayName}
            onPress={onSubmit}
          >
            Create Account
          </Button>
        </View>

        <Button variant="ghost" onPress={() => navigate('/login')}>
          Already have an account? Sign in
        </Button>
      </View>
    </View>
  );
}
