import { View } from 'react-native';

type Props = {
  progress: number;
};

export function ProgressBar({ progress }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
      <View className="h-full bg-primary rounded-full" style={{ width: `${clamped * 100}%` }} />
    </View>
  );
}
