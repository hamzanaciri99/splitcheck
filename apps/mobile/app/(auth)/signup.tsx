import { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button, TextField } from '@splitcheck/ui';
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 justify-center px-gutter gap-3">
        <Text className="font-jakarta-bold font-bold text-[24px] text-on-background mb-3">Create Account</Text>

        <TextField label="Name" value={displayName} onChangeText={setDisplayName} />
        <TextField
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Text className="font-sans text-on-surface-variant text-xs -mt-2">At least 8 characters.</Text>

        {error && <Text className="font-sans text-error text-[13px] text-center">{error}</Text>}

        <View className="mt-2">
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

        <Button variant="ghost" onPress={() => router.push('/(auth)/login')}>
          Already have an account? Sign in
        </Button>
      </View>
    </SafeAreaView>
  );
}
