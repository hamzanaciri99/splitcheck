import { useState } from 'react';
import { View, Text } from 'react-native';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Button, TextField } from '@splitcheck/ui';
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
    <View className="flex-1 bg-background items-center justify-center p-6" style={{ minHeight: '100vh' as unknown as number }}>
      <View className="w-full max-w-[380px] gap-3">
        <Text className="text-on-background text-[30px] font-extrabold">SplitCheck</Text>
        <Text className="text-on-surface-variant text-sm mb-2">Track shared checks with friends. No payments here.</Text>

        {GOOGLE_CLIENT_ID ? (
          <View className="mb-1">
            <GoogleLogin
              theme="filled_black"
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
          <Text className="text-on-surface-variant text-xs">Google sign-in needs VITE_GOOGLE_CLIENT_ID configured.</Text>
        )}

        <TextField label="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />

        {error && <Text className="text-error text-[13px]">{error}</Text>}

        <View className="mt-1">
          <Button variant="primary" fullWidth loading={busy} disabled={busy || !email || !password} onPress={onSubmit}>
            Sign In
          </Button>
        </View>

        <Button variant="ghost" onPress={() => navigate('/signup')}>
          Don&apos;t have an account? Create one
        </Button>
      </View>
    </View>
  );
}
