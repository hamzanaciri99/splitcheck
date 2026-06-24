import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from './Icon';
import { Button } from './Button';
import { LabelMd, LabelSm, DisplayCurrency, HeadlineMd } from './Typography';

type Props = {
  totalBalance: number;
  owedToYou: number;
  youOwe: number;
  onSettleUp?: () => void;
};

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`;
}

export function BalanceBentoSection({ totalBalance, owedToYou, youOwe, onSettleUp }: Props) {
  const isPositive = totalBalance >= 0;

  return (
    <View className="flex-row flex-wrap gap-stack-md mb-stack-lg">
      <View className="w-full rounded-xl overflow-hidden relative min-h-[160px]">
        <LinearGradient
          colors={['rgba(213,232,236,0.2)', '#2a2a2a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', inset: 0 }}
        />
        <View className="absolute -right-8 -top-8 w-40 h-40 bg-primary/20 rounded-full" />
        <View className="absolute -left-12 -bottom-12 w-32 h-32 bg-primary/10 rounded-full" />
        <View className="p-stack-lg border border-white/10 rounded-xl flex-1 justify-between min-h-[160px]">
          <View>
            <LabelMd className="text-on-surface-variant uppercase tracking-wider">TOTAL BALANCE</LabelMd>
            <DisplayCurrency className="text-on-surface mt-2">
              {isPositive ? '+' : '-'}
              {formatCurrency(totalBalance)}
            </DisplayCurrency>
          </View>
          <View className="flex-row justify-between items-end">
            <View className="flex-row items-center gap-1">
              <Icon name="trending-up" size={18} color="#d5e8ec" />
              <LabelMd className="text-primary">{isPositive ? 'You are owed' : 'You owe'}</LabelMd>
            </View>
            {onSettleUp && (
              <Button variant="primary" onPress={onSettleUp}>
                Settle Up
              </Button>
            )}
          </View>
        </View>
      </View>

      <View className="flex-1 p-stack-md bg-surface-container-lowest border border-white/5 rounded-xl">
        <View className="flex-row items-center gap-2 mb-2 opacity-80">
          <Icon name="wallet" size={20} color="#d5e8ec" />
          <LabelSm className="text-primary uppercase tracking-wide">Owed to you</LabelSm>
        </View>
        <HeadlineMd className="text-primary font-bold">{formatCurrency(owedToYou)}</HeadlineMd>
      </View>

      <View className="flex-1 p-stack-md bg-surface-container-lowest border border-white/5 rounded-xl">
        <View className="flex-row items-center gap-2 mb-2 opacity-80">
          <Icon name="payments" size={20} color="#ffb4ab" />
          <LabelSm className="text-error uppercase tracking-wide">You owe</LabelSm>
        </View>
        <HeadlineMd className="text-error font-bold">{formatCurrency(youOwe)}</HeadlineMd>
      </View>
    </View>
  );
}
