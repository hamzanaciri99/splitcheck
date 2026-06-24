import { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import type { User } from '@splitcheck/core';
import { api } from '@/api/client';
import { useChatStore } from '@/store/useChatStore';
import { Button, IconButton, Icon, TextField } from '@splitcheck/ui';

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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row items-center px-1">
        <IconButton accessibilityLabel="Close" onPress={() => router.back()}>
          <Icon name="close" size={20} color="#d5e8ec" />
        </IconButton>
        <Text className="font-sans text-on-background text-[17px] font-bold ml-1">New Chat</Text>
      </View>

      <View className="p-gutter gap-2">
        <TextField
          label="Friend's email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {error && <Text className="font-sans text-error text-[13px]">{error}</Text>}

        <View className="mt-3">
          <Button variant="primary" fullWidth loading={busy} disabled={busy || !email} onPress={onSubmit}>
            Start Chat
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
