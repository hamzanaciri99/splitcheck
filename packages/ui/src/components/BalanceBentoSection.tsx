import { View, Text } from 'react-native';
import { Button } from './Button';

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
    <View className="mx-4 mt-2 gap-2.5">
      <View className="bg-card-purple rounded-2xl p-6 flex-row items-start justify-between">
        <View>
          <Text className="text-white/60 text-xs font-medium tracking-wide mb-1.5">TOTAL BALANCE</Text>
          <Text className={`text-4xl font-extrabold mb-1 ${isPositive ? 'text-positive' : 'text-negative'}`}>
            {isPositive ? '+' : '-'}
            {formatCurrency(totalBalance)}
          </Text>
          <Text className="text-white/55 text-xs">{isPositive ? 'You are owed overall' : 'You owe overall'}</Text>
        </View>
        {onSettleUp && (
          <Button variant="primary" onPress={onSettleUp}>
            Settle Up
          </Button>
        )}
      </View>

      <View className="flex-row gap-2.5">
        <View className="flex-1 bg-positive-bg rounded-xl p-4">
          <Text className="text-positive text-xs font-medium tracking-wide mb-1.5">OWED TO YOU</Text>
          <Text className="text-positive text-[22px] font-bold">{formatCurrency(owedToYou)}</Text>
        </View>

        <View className="flex-1 bg-negative-bg rounded-xl p-4">
          <Text className="text-negative text-xs font-medium tracking-wide mb-1.5">YOU OWE</Text>
          <Text className="text-negative text-[22px] font-bold">{formatCurrency(youOwe)}</Text>
        </View>
      </View>
    </View>
  );
}
