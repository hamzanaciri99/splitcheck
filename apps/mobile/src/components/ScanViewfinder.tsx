import { useRef, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { IconButton, Icon, Button, TopAppBar, BodyMd, LabelMd } from '@splitcheck/ui';

type Props = {
  onClose: () => void;
  processing: boolean;
  onCapture: (uri: string, mimeType: string) => void | Promise<void>;
};

export function ScanViewfinder({ onClose, processing, onCapture }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const cameraRef = useRef<CameraView>(null);
  const { width: screenWidth } = useWindowDimensions();

  const frameWidth = Math.min(screenWidth - 32, 320);
  const frameHeight = (frameWidth * 16) / 9;

  const handleCapture = async () => {
    if (!cameraRef.current || processing) return;
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (photo) await onCapture(photo.uri, 'image/jpeg');
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!result.granted) return;
    const picked = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!picked.canceled) {
      const asset = picked.assets[0];
      await onCapture(asset.uri, asset.mimeType ?? 'image/jpeg');
    }
  };

  if (!permission) {
    return <View className="flex-1 bg-background" />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Icon name="camera" size={40} color="#bacbb9" />
        <Text className="font-sans text-on-surface text-[16px] font-semibold mt-4 mb-1 text-center">
          Camera access needed
        </Text>
        <BodyMd className="text-on-surface-variant text-center mb-6">
          SplitCheck needs camera access to scan receipts.
        </BodyMd>
        <Button variant="primary" onPress={requestPermission}>
          Grant Permission
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" flash={flash} />

      {/* Darkened surround around the framing guide */}
      <View className="absolute inset-0 z-10" pointerEvents="none">
        <View className="flex-1 bg-black/65" />
        <View style={{ height: frameHeight }} className="flex-row">
          <View className="flex-1 bg-black/65" />
          <View style={{ width: frameWidth, height: frameHeight }} className="relative">
            <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
            <View className="absolute top-1/2 left-0 w-full h-0.5 bg-primary/40" />
          </View>
          <View className="flex-1 bg-black/65" />
        </View>
        <View className="flex-1 bg-black/65" />
      </View>

      <View className="absolute inset-0 z-20">
        <TopAppBar leftIcon="close" onLeftPress={onClose} onRightPress={() => {}} />

        <SafeAreaView className="flex-1" edges={['top']}>
          <View className="mt-16 px-gutter flex-row justify-between items-center">
            <IconButton accessibilityLabel="Toggle flash" variant="circle" onPress={() => setFlash((f) => (f === 'off' ? 'on' : 'off'))}>
              <Icon name="flash" size={20} color={flash === 'on' ? '#d5e8ec' : '#ffffff'} />
            </IconButton>
            <View className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full flex-row items-center gap-2">
              <View className="w-2 h-2 rounded-full bg-primary-container" />
              <Text className="text-white font-sans text-[13px] font-semibold">Auto-Focus Active</Text>
            </View>
            <IconButton accessibilityLabel="Settings" variant="circle" onPress={() => {}}>
              <Icon name="settings" size={20} color="#ffffff" />
            </IconButton>
          </View>
        </SafeAreaView>
      </View>

      <View className="absolute bottom-[160px] left-gutter right-gutter z-30" pointerEvents="none">
        <View className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-stack-md flex-row items-center gap-stack-md">
          <View className="bg-primary/20 p-2 rounded-lg items-center justify-center">
            <Icon name="lightbulb" size={20} color="#d5e8ec" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-sans text-sm font-bold">Pro Tip</Text>
            <Text className="text-white/70 font-sans text-[12px] leading-tight">
              Ensure all edges of the receipt are visible for 100% accuracy.
            </Text>
          </View>
        </View>
      </View>

      <View className="absolute bottom-0 left-0 w-full z-20">
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.9)']} style={{ position: 'absolute', inset: 0 }} />
        <View className="pt-stack-lg pb-10 px-gutter">
          <View className="flex-row items-center justify-between gap-gutter">
            <View className="items-center gap-stack-sm">
              <Pressable
                onPress={handlePickFromGallery}
                disabled={processing}
                className="w-14 h-14 rounded-lg overflow-hidden border border-white/20 active:scale-90 bg-surface-bright items-center justify-center"
              >
                <Icon name="photo-library" size={20} color="#ffffff" />
              </Pressable>
              <LabelMd className="text-white/60 text-[10px] tracking-widest uppercase">Gallery</LabelMd>
            </View>

            <Pressable
              onPress={handleCapture}
              disabled={processing}
              className="w-20 h-20 rounded-full bg-white p-1.5 items-center justify-center active:scale-90"
              style={{ shadowColor: '#d5e8ec', shadowOpacity: 0.4, shadowRadius: 30, shadowOffset: { width: 0, height: 0 } }}
            >
              {processing ? (
                <ActivityIndicator color="#131313" />
              ) : (
                <View className="w-full h-full rounded-full border-[3px] border-surface-container-highest bg-white items-center justify-center">
                  <View className="w-4 h-4 rounded-full bg-primary/20" />
                </View>
              )}
            </Pressable>

            <View className="items-center gap-stack-sm">
              <Pressable className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 items-center justify-center active:scale-90">
                <Icon name="help-circle" size={20} color="#ffffff" />
              </Pressable>
              <LabelMd className="text-white/60 text-[10px] tracking-widest uppercase">Guide</LabelMd>
            </View>
          </View>

          <View className="mt-stack-lg items-center">
            <Text className="text-white font-sans text-sm opacity-80 px-8 text-center">
              Center the receipt in the frame to scan automatically
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
