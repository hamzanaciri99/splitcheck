import { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import type { Message } from '@splitcheck/core';
import { useChatStore, conversationTitle } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSplitDraftStore } from '@/store/useSplitDraftStore';
import { API_URL, uploadFile } from '@/api/client';
import { MessageBubble, SplitRequestCard, IconButton, Icon, TextField } from '@splitcheck/ui';

export default function ChatThreadScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const user = useAuthStore((s) => s.user);
  const { conversations, messages, loadConversations, loadMessages, sendMessage, respondToCheck, connectSocket } =
    useChatStore();
  const initDraft = useSplitDraftStore((s) => s.initDraft);

  const [body, setBody] = useState('');
  const [uploading, setUploading] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const conversation = conversations.find((c) => c.id === conversationId);
  const threadMessages = messages[conversationId] ?? [];

  useEffect(() => {
    connectSocket();
    if (conversations.length === 0) loadConversations();
    loadMessages(conversationId);
  }, [conversationId]);

  if (!user) return null;

  const onSend = async () => {
    const text = body.trim();
    if (!text) return;
    setBody('');
    await sendMessage(conversationId, text);
  };

  const openSplitComposer = (attachmentId: string | null, prefillTitle: string, items: { name: string; priceCents: number }[]) => {
    if (!conversation) return;
    initDraft({
      conversationId,
      title: prefillTitle,
      participants: conversation.participants,
      items,
      attachmentId,
    });
    router.push(`/new-split/${conversationId}`);
  };

  const uploadAsset = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      const mimeType = asset.mimeType ?? 'image/jpeg';
      const result = await uploadFile<{
        message: Message;
        extracted: { merchant: string | null; items: { name: string; priceCents: number }[]; totalCents: number | null } | null;
      }>(`/api/conversations/${conversationId}/attachments`, asset.uri, mimeType);

      useChatStore.getState().upsertMessage(result.message);

      openSplitComposer(
        result.message.attachment?.id ?? null,
        result.extracted?.merchant ?? 'Split',
        result.extracted?.items ?? []
      );
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setUploading(false);
    }
  };

  const onAttachReceipt = () => {
    Alert.alert('Attach Receipt', undefined, [
      {
        text: 'Scan Receipt',
        onPress: () => router.push({ pathname: '/scan/[conversationId]', params: { conversationId } }),
      },
      {
        text: 'Choose from Library',
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) return;
          const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
          if (!result.canceled) await uploadAsset(result.assets[0]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top']}>
      <View className="flex-row items-center pr-2">
        <IconButton accessibilityLabel="Back" onPress={() => router.back()}>
          <Icon name="arrow-left" size={20} color="#F5F5F5" />
        </IconButton>
        <Text className="flex-1 text-text-primary text-[16px] font-bold" numberOfLines={1}>
          {conversation ? conversationTitle(conversation, user.id) : ''}
        </Text>
        <IconButton
          accessibilityLabel="New split"
          onPress={() => openSplitComposer(null, '', [])}
          disabled={!conversation}
        >
          <Icon name="receipt" size={20} color="#F5F5F5" />
        </IconButton>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={threadMessages}
          keyExtractor={(item) => item.id}
          contentContainerClassName="py-3"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            if (item.type === 'SPLIT_REQUEST' && item.check) {
              return (
                <View className="px-3 my-1 items-start">
                  <SplitRequestCard
                    check={item.check}
                    currentUserId={user.id}
                    onRespond={(status) => respondToCheck(item.check!.id, status)}
                    onPress={() => router.push({ pathname: '/check/[checkId]', params: { checkId: item.check!.id } })}
                  />
                </View>
              );
            }
            return <MessageBubble message={item} isMine={item.sender.id === user.id} baseUrl={API_URL} />;
          }}
        />

        <View className="flex-row items-center gap-2 px-2 pb-2">
          <IconButton accessibilityLabel="Attach receipt" onPress={onAttachReceipt} disabled={uploading}>
            <Icon name="paperclip" size={20} color={uploading ? '#6E6E73' : '#F5F5F5'} />
          </IconButton>
          <View className="flex-1">
            <TextField placeholder="Message" value={body} onChangeText={setBody} onSubmitEditing={onSend} />
          </View>
          <IconButton accessibilityLabel="Send" onPress={onSend} disabled={!body.trim()}>
            <Icon name="send" size={20} color={body.trim() ? '#A8E8D6' : '#6E6E73'} />
          </IconButton>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
