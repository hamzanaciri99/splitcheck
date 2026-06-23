import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigate } from 'react-router-dom';
import type { Conversation, Message, User } from '@splitcheck/core';
import { Button, TextField } from '@splitcheck/ui';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore, conversationTitle, otherParticipants } from '../store/useChatStore';
import { api } from '../api/client';
import { AppHeader } from '../components/AppHeader';

function previewText(message: Message | null): string {
  if (!message) return 'Say hello';
  if (message.type === 'RECEIPT') return 'Sent a receipt';
  if (message.type === 'SPLIT_REQUEST') return `Split request: ${message.check?.title ?? ''}`;
  return message.body ?? '';
}

export default function ChatListPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { conversations, loadConversations, connectSocket, startConversation } = useChatStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    connectSocket();
    loadConversations();
  }, [user]);

  if (!user) return null;

  const onStartChat = async () => {
    setError(null);
    setBusy(true);
    try {
      const { user: found } = await api.get<{ user: User | null }>(
        `/api/users/search?email=${encodeURIComponent(email.trim().toLowerCase())}`
      );
      if (!found) {
        setError('No SplitCheck user found with that email');
        return;
      }
      const conversation = await startConversation(found.id);
      setEmail('');
      navigate(`/chat/${conversation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas" style={{ minHeight: '100vh' as unknown as number }}>
      <AppHeader />

      <View className="flex-1 w-full max-w-[640px] self-center p-5">
        <View className="flex-row gap-2 items-end mb-2">
          <View className="flex-1">
            <TextField placeholder="Start a chat by email" value={email} onChangeText={setEmail} />
          </View>
          <Button variant="primary" loading={busy} disabled={busy || !email} onPress={onStartChat}>
            Start
          </Button>
        </View>
        {error && <Text className="text-negative text-[13px] mb-2">{error}</Text>}

        <ScrollView className="flex-1 bg-surface rounded-2xl">
          {conversations.length === 0 ? (
            <Text className="p-6 text-center text-text-secondary">No conversations yet. Start one above.</Text>
          ) : (
            conversations.map((conversation: Conversation) => {
              const others = otherParticipants(conversation, user.id);
              const avatarUser = others[0];
              return (
                <TouchableOpacity
                  key={conversation.id}
                  className="flex-row items-center px-4 py-3"
                  onPress={() => navigate(`/chat/${conversation.id}`)}
                >
                  <View
                    className="w-11 h-11 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: avatarUser?.avatarColor ?? '#A8E8D6' }}
                  >
                    <Text className="text-white font-bold">
                      {(avatarUser?.displayName ?? '?').slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary text-[15px] font-semibold">
                      {conversationTitle(conversation, user.id)}
                    </Text>
                    <Text className="text-text-secondary text-[13px] mt-0.5">
                      {previewText(conversation.lastMessage)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}
