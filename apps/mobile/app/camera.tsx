import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import { ScanViewfinder } from '@/components/ScanViewfinder';
import { useSplitStore } from '@/store/useSplitStore';
import { COLORS } from '@/theme/theme';

const VIEWFINDER_HEIGHT = 320;

export default function CameraScreen() {
  const { width: screenWidth } = useWindowDimensions();
  const sideOverlayWidth = Math.max(0, (screenWidth - VIEWFINDER_WIDTH) / 2);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { isScanning, scanProgress, captureAndScan } = useSplitStore();
  const scanLineOffset = useSharedValue(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (isScanning) {
      scanLineOffset.value = withRepeat(
        withSequence(
          withTiming(VIEWFINDER_HEIGHT - 4, { duration: 1200 }),
          withTiming(0, { duration: 300 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(scanLineOffset);
      scanLineOffset.value = 0;
    }
  }, [isScanning]);

  const handleCapture = () => {
    if (isScanning) return;
    captureAndScan(() => {
      router.replace('/assign-items');
    });
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });
    if (!result.canceled) {
      captureAndScan(() => {
        router.replace('/assign-items');
      });
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialCommunityIcons name="camera-off" size={48} color="#FFFFFF" />
          <Text style={styles.permissionText}>Camera access is required to scan receipts</Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Grant Camera Access</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* Dark overlay top */}
      <View style={styles.overlayTop} />
      <View style={styles.overlayBottom} />
      <View style={[styles.overlaySideLeft, { width: sideOverlayWidth }]} />
      <View style={[styles.overlaySideRight, { width: sideOverlayWidth }]} />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.autofocusBadge}>
          <MaterialCommunityIcons name="focus-auto" size={14} color={COLORS.primary} />
          <Text style={styles.autofocusText}>Auto</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => {}}>
          <MaterialCommunityIcons name="tune" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Viewfinder */}
      <View style={[styles.viewfinder, { height: VIEWFINDER_HEIGHT }]}>
        <ScanViewfinder
          scanLineOffset={scanLineOffset}
          isScanning={isScanning}
          viewfinderHeight={VIEWFINDER_HEIGHT}
        />
      </View>

      {/* Scan progress */}
      {isScanning && (
        <View style={styles.scanningBadge}>
          <MaterialCommunityIcons name="line-scan" size={16} color={COLORS.primary} />
          <Text style={styles.scanningText}>
            Scanning… {Math.round(scanProgress * 100)}%
          </Text>
        </View>
      )}

      {/* Pro tip card */}
      <View style={styles.proTipCard}>
        <MaterialCommunityIcons name="lightbulb-outline" size={16} color="rgba(255,255,255,0.7)" />
        <Text style={styles.proTipText}>
          Place the receipt flat with good lighting for best results
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.sideBtn} onPress={handleGallery}>
          <MaterialCommunityIcons name="image-multiple-outline" size={26} color="#FFFFFF" />
          <Text style={styles.sideBtnText}>Gallery</Text>
        </TouchableOpacity>

        <Pressable
          onPress={handleCapture}
          disabled={isScanning}
          style={({ pressed }) => [styles.shutterOuter, pressed && { opacity: 0.85 }]}
        >
          <View style={styles.shutterInner} />
        </Pressable>

        <TouchableOpacity style={styles.sideBtn} onPress={() => {}}>
          <MaterialCommunityIcons name="help-circle-outline" size={26} color="#FFFFFF" />
          <Text style={styles.sideBtnText}>Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const OVERLAY_COLOR = 'rgba(0,0,0,0.55)';
const VIEWFINDER_WIDTH = 280;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '28%',
    backgroundColor: OVERLAY_COLOR,
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '28%',
    backgroundColor: OVERLAY_COLOR,
  },
  overlaySideLeft: {
    position: 'absolute',
    top: '28%',
    left: 0,
    bottom: '28%',
    backgroundColor: OVERLAY_COLOR,
  },
  overlaySideRight: {
    position: 'absolute',
    top: '28%',
    right: 0,
    bottom: '28%',
    backgroundColor: OVERLAY_COLOR,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  autofocusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  autofocusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  viewfinder: {
    width: VIEWFINDER_WIDTH,
    position: 'relative',
  },
  scanningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  proTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  proTipText: {
    flex: 1,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 17,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 48,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sideBtn: {
    alignItems: 'center',
    gap: 4,
  },
  sideBtnText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  permissionText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 15,
  },
  permissionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  permissionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
