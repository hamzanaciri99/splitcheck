import { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton } from 'react-native-paper';
import { router } from 'expo-router';
import type { Conversation, Message } from '@splitcheck/core';
import { useChatStore, conversationTitle, otherParticipants } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getAvatarInitials } from '@splitcheck/core';
import { COLORS } from '@splitcheck/ui';

function previewText(message: Message | null): string {
  if (!message) return 'Say hello';
  if (message.type === 'RECEIPT') return 'Sent a receipt';
  if (message.type === 'SPLIT_REQUEST') return `Split request: ${message.check?.title ?? ''}`;
  return message.body ?? '';
}

export default function ChatListScreen() {
  const user = useAuthStore((s) => s.user);
  const { conversations, loadConversations, connectSocket } = useChatStore();

  useEffect(() => {
    if (!user) return;
    connectSocket();
    loadConversations();
  }, [user]);

  if (!user) return null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <IconButton
          icon="plus"
          iconColor={COLORS.onSurface}
          size={22}
          accessibilityLabel="New chat"
          onPress={() => router.push('/new-chat')}
        />
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No conversations yet. Start one with the + button.</Text>
          </View>
        }
        renderItem={({ item }: { item: Conversation }) => {
          const others = otherParticipants(item, user.id);
          const avatarUser = others[0];
          return (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <View style={[styles.avatar, { backgroundColor: avatarUser?.avatarColor ?? COLORS.primary }]}>
                <Text style={styles.avatarText}>{getAvatarInitials(avatarUser?.displayName ?? '?')}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {conversationTitle(item, user.id)}
                </Text>
                <Text style={styles.preview} numberOfLines={1}>
                  {previewText(item.lastMessage)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.onBackground,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  preview: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    fontSize: 14,
  },
});
