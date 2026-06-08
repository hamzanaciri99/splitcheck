import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { COLORS } from '@/theme/theme';

type Props = {
  scanLineOffset: Animated.SharedValue<number>;
  isScanning: boolean;
  viewfinderHeight: number;
};

const CORNER_SIZE = 28;
const BORDER_WIDTH = 3;

export function ScanViewfinder({ scanLineOffset, isScanning, viewfinderHeight }: Props) {
  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineOffset.value }],
    opacity: isScanning ? 1 : 0,
  }));

  return (
    <View style={styles.container}>
      {/* Corner brackets */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />

      {/* Scanning line */}
      {isScanning && (
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderTopLeftRadius: 6,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderTopRightRadius: 6,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderBottomLeftRadius: 6,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderBottomRightRadius: 6,
  },
  scanLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: COLORS.primary,
    opacity: 0.9,
    borderRadius: 1,
  },
});
