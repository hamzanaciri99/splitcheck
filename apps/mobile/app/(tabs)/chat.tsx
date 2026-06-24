import { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import type { Conversation, Message } from '@splitcheck/core';
import { useChatStore, conversationTitle, otherParticipants } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getAvatarInitials } from '@splitcheck/core';
import { IconButton, Icon, SearchBar } from '@splitcheck/ui';
import { AppBottomNav } from '@/components/AppBottomNav';

function previewText(message: Message | null): string {
  if (!message) return 'Say hello';
  if (message.type === 'RECEIPT') return 'Sent a receipt';
  if (message.type === 'SPLIT_REQUEST') return `Split request: ${message.check?.title ?? ''}`;
  return message.body ?? '';
}

export default function ChatListScreen() {
  const user = useAuthStore((s) => s.user);
  const { conversations, loadConversations, connectSocket } = useChatStore();
  const { focusSearch } = useLocalSearchParams<{ focusSearch?: string }>();
  const [query, setQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!user) return;
    connectSocket();
    loadConversations();
  }, [user]);

  // Arriving here from the dashboard's search bar should feel like that
  // same tap landed on this bar: pop the keyboard immediately, not just
  // visually focus it.
  useEffect(() => {
    if (focusSearch === '1') {
      const timer = setTimeout(() => searchRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [focusSearch]);

  if (!user) return null;

  const filtered = query.trim()
    ? conversations.filter((c) => conversationTitle(c, user.id).toLowerCase().includes(query.trim().toLowerCase()))
    : conversations;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-2.5 px-gutter h-16 bg-surface/70 backdrop-blur-xl border-b border-white/10">
        <SearchBar
          ref={searchRef}
          editable
          value={query}
          onChangeText={setQuery}
          containerClassName="flex-1"
          placeholder="Search conversations"
        />
        <IconButton accessibilityLabel="New chat" size={36} onPress={() => router.push('/new-chat')}>
          <Icon name="plus" size={20} color="#d5e8ec" />
        </IconButton>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-24"
        ListEmptyComponent={
          <View className="p-10 items-center">
            <Text className="font-sans text-on-surface-variant text-sm text-center">
              {query.trim() ? 'No conversations match your search.' : 'No conversations yet. Start one with the + button.'}
            </Text>
          </View>
        }
        renderItem={({ item }: { item: Conversation }) => {
          const others = otherParticipants(item, user.id);
          const avatarUser = others[0];
          return (
            <TouchableOpacity
              className="flex-row items-center px-gutter py-3"
              activeOpacity={0.7}
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: avatarUser?.avatarColor ?? '#d5e8ec' }}
              >
                <Text className="text-white text-[15px] font-inter-bold font-bold">
                  {getAvatarInitials(avatarUser?.displayName ?? '?')}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-sans font-bold text-[15px] text-on-surface" numberOfLines={1}>
                  {conversationTitle(item, user.id)}
                </Text>
                <Text className="font-sans text-[13px] text-on-surface-variant mt-0.5" numberOfLines={1}>
                  {previewText(item.lastMessage)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <AppBottomNav active="chat" />
    </SafeAreaView>
  );
}
