import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigate } from 'react-router-dom';
import type { Conversation, Message, User } from '@splitcheck/core';
import { COLORS } from '@splitcheck/ui';
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
    <View style={styles.page}>
      <AppHeader />

      <View style={styles.content}>
        <View style={styles.newChatRow}>
          <TextInput
            mode="outlined"
            placeholder="Start a chat by email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            dense
          />
          <Button mode="contained" loading={busy} disabled={busy || !email} onPress={onStartChat}>
            Start
          </Button>
        </View>
        {error && <Text style={styles.error}>{error}</Text>}

        <ScrollView style={styles.list}>
          {conversations.length === 0 ? (
            <Text style={styles.empty}>No conversations yet. Start one above.</Text>
          ) : (
            conversations.map((conversation: Conversation) => {
              const others = otherParticipants(conversation, user.id);
              const avatarUser = others[0];
              return (
                <TouchableOpacity
                  key={conversation.id}
                  style={styles.row}
                  onPress={() => navigate(`/chat/${conversation.id}`)}
                >
                  <View style={[styles.avatar, { backgroundColor: avatarUser?.avatarColor ?? COLORS.primary }]}>
                    <Text style={styles.avatarText}>{(avatarUser?.displayName ?? '?').slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{conversationTitle(conversation, user.id)}</Text>
                    <Text style={styles.rowPreview}>{previewText(conversation.lastMessage)}</Text>
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

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    padding: 20,
  },
  newChatRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 8,
  },
  list: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
  },
  empty: {
    padding: 24,
    textAlign: 'center',
    color: COLORS.onSurfaceVariant,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  rowPreview: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
});
