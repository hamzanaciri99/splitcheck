import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import type { User } from '@splitcheck/core';
import { api } from '@/api/client';
import { useChatStore } from '@/store/useChatStore';
import { COLORS } from '@splitcheck/ui';

export default function NewChatScreen() {
  const { startConversation } = useChatStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      const { user } = await api.get<{ user: User | null }>(
        `/api/users/search?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
      if (!user) {
        setError('No SplitCheck user found with that email');
        return;
      }
      const conversation = await startConversation(user.id);
      router.replace(`/chat/${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <IconButton icon="close" accessibilityLabel="Close" onPress={() => router.back()} />
        <Text style={styles.title}>New Chat</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Friend's email</Text>
        <TextInput
          mode="outlined"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button mode="contained" loading={busy} disabled={busy || !email} onPress={onSubmit} style={styles.button}>
          Start Chat
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onBackground,
  },
  content: {
    padding: 20,
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  button: {
    borderRadius: 24,
    marginTop: 12,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
  },
});
