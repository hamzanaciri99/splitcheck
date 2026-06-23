import { View } from 'react-native';

type Props = {
  progress: number;
};

export function ProgressBar({ progress }: Props) {
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View className="h-1.5 bg-surface-alt rounded-full overflow-hidden">
      <View className="h-full bg-accent rounded-full" style={{ width: `${clamped * 100}%` }} />
    </View>
  );
}
