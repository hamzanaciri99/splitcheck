import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigate, useParams } from 'react-router-dom';
import type { Message } from '@splitcheck/core';
import { MessageBubble, SplitRequestCard, Button, TextField } from '@splitcheck/ui';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore, conversationTitle } from '../store/useChatStore';
import { useSplitDraftStore } from '../store/useSplitDraftStore';
import { api, API_URL } from '../api/client';
import { AppHeader } from '../components/AppHeader';

export default function ChatThreadPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { conversations, messages, loadConversations, loadMessages, sendMessage, respondToCheck, connectSocket } =
    useChatStore();
  const initDraft = useSplitDraftStore((s) => s.initDraft);

  const [body, setBody] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<ScrollView>(null);

  const conversation = conversations.find((c) => c.id === conversationId);
  const threadMessages = conversationId ? messages[conversationId] ?? [] : [];

  useEffect(() => {
    if (!conversationId) return;
    connectSocket();
    if (conversations.length === 0) loadConversations();
    loadMessages(conversationId);
  }, [conversationId]);

  if (!user || !conversationId) return null;

  const onSend = async () => {
    const text = body.trim();
    if (!text) return;
    setBody('');
    await sendMessage(conversationId, text);
  };

  const openSplitComposer = (
    attachmentId: string | null,
    prefillTitle: string,
    items: { name: string; priceCents: number }[]
  ) => {
    if (!conversation) return;
    initDraft({
      conversationId,
      title: prefillTitle,
      participants: conversation.participants,
      items,
      attachmentId,
    });
    navigate(`/new-split/${conversationId}`);
  };

  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);

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
      window.alert(err instanceof Error ? err.message : 'Upload failed, please try again');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-canvas" style={{ minHeight: '100vh' as unknown as number }}>
      <AppHeader />

      <View className="flex-row items-center max-w-[640px] w-full self-center px-3">
        <Button variant="ghost" onPress={() => navigate('/')}>
          ← Back
        </Button>
        <Text className="flex-1 text-text-primary font-bold text-[16px]">
          {conversation ? conversationTitle(conversation, user.id) : ''}
        </Text>
        <Button variant="ghost" onPress={() => openSplitComposer(null, '', [])} disabled={!conversation}>
          New Split
        </Button>
      </View>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="max-w-[640px] w-full self-center py-3"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {threadMessages.map((item) =>
          item.type === 'SPLIT_REQUEST' && item.check ? (
            <View key={item.id} className="px-3 my-1 items-start">
              <SplitRequestCard
                check={item.check}
                currentUserId={user.id}
                onRespond={(status) => respondToCheck(item.check!.id, status)}
              />
            </View>
          ) : (
            <MessageBubble key={item.id} message={item} isMine={item.sender.id === user.id} baseUrl={API_URL} />
          )
        )}
      </ScrollView>

      <View className="flex-row items-center gap-2 max-w-[640px] w-full self-center px-2 pb-3">
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFileChosen} />
        <Button variant="ghost" loading={uploading} disabled={uploading} onPress={() => fileInputRef.current?.click()}>
          Attach
        </Button>
        <View className="flex-1">
          <TextField placeholder="Message" value={body} onChangeText={setBody} onSubmitEditing={onSend} />
        </View>
        <Button variant="primary" onPress={onSend} disabled={!body.trim()}>
          Send
        </Button>
      </View>
    </View>
  );
}
