import { useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import type { Message } from '@splitcheck/core';
import { uploadFile } from '@/api/client';
import { useChatStore } from '@/store/useChatStore';
import { useSplitDraftStore } from '@/store/useSplitDraftStore';
import { ScanViewfinder } from '@/components/ScanViewfinder';

export default function ScanReceiptScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [processing, setProcessing] = useState(false);
  const initDraft = useSplitDraftStore((s) => s.initDraft);

  const onCapture = async (uri: string, mimeType: string) => {
    setProcessing(true);
    try {
      const conversation = useChatStore.getState().conversations.find((c) => c.id === conversationId);
      if (!conversation) throw new Error('Conversation not found');

      const result = await uploadFile<{
        message: Message;
        extracted: { merchant: string | null; items: { name: string; priceCents: number }[]; totalCents: number | null } | null;
      }>(`/api/conversations/${conversationId}/attachments`, uri, mimeType);

      useChatStore.getState().upsertMessage(result.message);

      initDraft({
        conversationId,
        title: result.extracted?.merchant ?? 'Split',
        participants: conversation.participants,
        items: result.extracted?.items ?? [],
        attachmentId: result.message.attachment?.id ?? null,
      });
      router.replace(`/new-split/${conversationId}`);
    } catch (err) {
      Alert.alert('Could not process receipt', err instanceof Error ? err.message : 'Please try again');
    } finally {
      setProcessing(false);
    }
  };

  return <ScanViewfinder onClose={() => router.back()} processing={processing} onCapture={onCapture} />;
}
