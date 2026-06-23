import { View, Text, TouchableOpacity } from 'react-native';
import type { ActivityReceipt } from '@splitcheck/core';
import { getAvatarInitials, getAvatarColor } from '@splitcheck/core';

type Props = {
  receipt: ActivityReceipt;
  onPress?: () => void;
};

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toFixed(2)}`;
}

export function ActivityItemRow({ receipt, onPress }: Props) {
  const initials = getAvatarInitials(receipt.title);
  const avatarColor = getAvatarColor(receipt.title);
  const isPayerMe = receipt.isMine;

  const subtitle = receipt.isSettled
    ? 'All settled'
    : isPayerMe
    ? `Paid by You • ${receipt.date}`
    : `Paid by ${receipt.payer} • ${receipt.date}`;

  const amountClass = receipt.isSettled ? 'text-text-secondary' : isPayerMe ? 'text-positive' : 'text-negative';
  const amountPrefix = receipt.isSettled ? '' : isPayerMe ? '+' : '-';

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3"
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View className="w-11 h-11 rounded-full items-center justify-center mr-3" style={{ backgroundColor: avatarColor }}>
        <Text className="text-white text-sm font-bold">{initials}</Text>
      </View>

      <View className="flex-1 mr-2">
        <Text className="text-text-primary text-[15px] font-semibold" numberOfLines={1}>
          {receipt.title}
        </Text>
        <Text className="text-text-secondary text-xs mt-0.5" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      <View className="items-end">
        <Text className={`text-[15px] font-bold ${amountClass}`}>
          {amountPrefix}
          {formatCurrency(receipt.totalAmount)}
        </Text>
        {receipt.isSettled && (
          <View className="mt-1 bg-surface-alt rounded-md px-1.5 py-0.5">
            <Text className="text-[10px] text-text-secondary font-semibold">Settled</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
