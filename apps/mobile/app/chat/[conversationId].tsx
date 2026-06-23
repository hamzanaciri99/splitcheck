import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import type { Message } from '@splitcheck/core';
import { useChatStore, conversationTitle } from '@/store/useChatStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useSplitDraftStore } from '@/store/useSplitDraftStore';
import { api, API_URL } from '@/api/client';
import { MessageBubble, SplitRequestCard, COLORS } from '@splitcheck/ui';

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
      const form = new FormData();
      form.append('file', {
        uri: asset.uri,
        name: asset.fileName ?? 'receipt.jpg',
        type: asset.mimeType ?? 'image/jpeg',
      } as unknown as Blob);

      const result = await api.requestForm<{
        message: Message;
        extracted: { merchant: string | null; items: { name: string; priceCents: number }[]; totalCents: number | null } | null;
      }>(`/api/conversations/${conversationId}/attachments`, form);

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
        text: 'Take Photo',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) return;
          const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
          if (!result.canceled) await uploadAsset(result.assets[0]);
        },
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" accessibilityLabel="Back" onPress={() => router.back()} />
        <Text style={styles.title} numberOfLines={1}>
          {conversation ? conversationTitle(conversation, user.id) : ''}
        </Text>
        <IconButton
          icon="receipt"
          accessibilityLabel="New split"
          onPress={() => openSplitComposer(null, '', [])}
          disabled={!conversation}
        />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={listRef}
          data={threadMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            if (item.type === 'SPLIT_REQUEST' && item.check) {
              return (
                <View style={styles.cardRow}>
                  <SplitRequestCard
                    check={item.check}
                    currentUserId={user.id}
                    onRespond={(status) => respondToCheck(item.check!.id, status)}
                  />
                </View>
              );
            }
            return <MessageBubble message={item} isMine={item.sender.id === user.id} baseUrl={API_URL} />;
          }}
        />

        <View style={styles.inputBar}>
          <IconButton
            icon="paperclip"
            accessibilityLabel="Attach receipt"
            onPress={onAttachReceipt}
            loading={uploading}
            disabled={uploading}
          />
          <TextInput
            mode="outlined"
            placeholder="Message"
            value={body}
            onChangeText={setBody}
            onSubmitEditing={onSend}
            style={styles.input}
            dense
          />
          <IconButton icon="send" accessibilityLabel="Send" onPress={onSend} disabled={!body.trim()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.onBackground,
  },
  listContent: {
    paddingVertical: 12,
  },
  cardRow: {
    paddingHorizontal: 12,
    marginVertical: 4,
    alignItems: 'flex-start',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
});
