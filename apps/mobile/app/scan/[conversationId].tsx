import { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import type { Message } from '@splitcheck/core';
import { IconButton, Icon, Button } from '@splitcheck/ui';
import { api } from '@/api/client';
import { useChatStore } from '@/store/useChatStore';
import { useSplitDraftStore } from '@/store/useSplitDraftStore';

export default function ScanReceiptScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [processing, setProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const initDraft = useSplitDraftStore((s) => s.initDraft);

  const processAsset = async (uri: string, fileName: string, mimeType: string) => {
    setProcessing(true);
    try {
      const conversation = useChatStore.getState().conversations.find((c) => c.id === conversationId);
      if (!conversation) throw new Error('Conversation not found');

      const form = new FormData();
      form.append('file', { uri, name: fileName, type: mimeType } as unknown as Blob);

      const result = await api.requestForm<{
        message: Message;
        extracted: { merchant: string | null; items: { name: string; priceCents: number }[]; totalCents: number | null } | null;
      }>(`/api/conversations/${conversationId}/attachments`, form);

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

  const onCapture = async () => {
    if (!cameraRef.current || processing) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo) await processAsset(photo.uri, 'receipt.jpg', 'image/jpeg');
  };

  const onPickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled) {
      const asset = result.assets[0];
      await processAsset(asset.uri, asset.fileName ?? 'receipt.jpg', asset.mimeType ?? 'image/jpeg');
    }
  };

  if (!permission) {
    return <View className="flex-1 bg-canvas" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-canvas items-center justify-center px-8">
        <Icon name="camera" size={40} color="#9A9AA0" />
        <Text className="text-text-primary text-[16px] font-semibold mt-4 mb-1 text-center">Camera access needed</Text>
        <Text className="text-text-secondary text-sm text-center mb-6">
          SplitCheck needs camera access to scan receipts.
        </Text>
        <Button variant="primary" onPress={requestPermission}>
          Grant Permission
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-canvas">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" flash={flash} />
      <View className="absolute inset-0">
        <SafeAreaView className="flex-1 justify-between">
          <View className="flex-row justify-between items-center px-4 pt-2">
            <IconButton accessibilityLabel="Close" variant="circle" onPress={() => router.back()}>
              <Icon name="close" size={20} color="#F5F5F5" />
            </IconButton>
            <Text className="text-white text-[15px] font-semibold">Scan Receipt</Text>
            <IconButton
              accessibilityLabel="Toggle flash"
              variant="circle"
              onPress={() => setFlash((f) => (f === 'off' ? 'on' : 'off'))}
            >
              <Icon name="flash" size={20} color={flash === 'on' ? '#A8E8D6' : '#F5F5F5'} />
            </IconButton>
          </View>

          <View className="items-center justify-center flex-1">
            <View className="w-[85%] aspect-[3/4] relative">
              <View className="absolute top-0 left-0 w-9 h-9 border-t-[3px] border-l-[3px] border-accent rounded-tl-2xl" />
              <View className="absolute top-0 right-0 w-9 h-9 border-t-[3px] border-r-[3px] border-accent rounded-tr-2xl" />
              <View className="absolute bottom-0 left-0 w-9 h-9 border-b-[3px] border-l-[3px] border-accent rounded-bl-2xl" />
              <View className="absolute bottom-0 right-0 w-9 h-9 border-b-[3px] border-r-[3px] border-accent rounded-br-2xl" />
            </View>
          </View>

          <View className="items-center px-8 mb-4">
            <View className="bg-black/50 rounded-xl px-4 py-2.5">
              <Text className="text-white text-xs text-center">
                Pro Tip: Place the receipt on a flat, well-lit surface for best results.
              </Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between px-8 pb-6">
            <Pressable onPress={onPickFromGallery} disabled={processing} className="w-12 h-12 items-center justify-center">
              <Icon name="image" size={26} color="#F5F5F5" />
            </Pressable>

            <Pressable
              onPress={onCapture}
              disabled={processing}
              className="w-20 h-20 rounded-full bg-white items-center justify-center"
            >
              {processing ? (
                <ActivityIndicator color="#0D0D0F" />
              ) : (
                <View className="w-16 h-16 rounded-full border-[3px] border-canvas" />
              )}
            </Pressable>

            <View className="w-12 h-12" />
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}
