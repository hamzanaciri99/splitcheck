import { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, TextField } from '@splitcheck/ui';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginScreen() {
  const { login } = useAuthStore();
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
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 justify-center px-6 gap-3">
        <Text className="text-text-primary text-2xl font-extrabold mb-3">Sign In</Text>

        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />

        {error && <Text className="text-negative text-[13px] text-center">{error}</Text>}

        <View className="mt-2">
          <Button variant="primary" fullWidth loading={busy} disabled={busy || !email || !password} onPress={onSubmit}>
            Sign In
          </Button>
        </View>

        <Button variant="ghost" onPress={() => router.push('/(auth)/signup')}>
          Don&apos;t have an account? Create one
        </Button>
      </View>
    </SafeAreaView>
  );
}
