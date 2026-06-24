import { View, Text, TouchableOpacity } from 'react-native';
import type { ActivityReceipt } from '@splitcheck/core';
import { getAvatarInitials, getAvatarColor } from '@splitcheck/core';
import { LabelSm } from './Typography';

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

  const subtitle = isPayerMe ? `Paid by You • ${receipt.date}` : `Paid by ${receipt.payer} • ${receipt.date}`;
  const caption = receipt.isSettled ? 'All settled' : isPayerMe ? "You're owed back" : `${receipt.payer} is owed`;

  const amountClass = receipt.isSettled ? 'text-on-surface-variant' : isPayerMe ? 'text-primary' : 'text-error';
  const amountPrefix = receipt.isSettled ? '' : isPayerMe ? '+' : '-';

  return (
    <TouchableOpacity
      className="flex-row items-center p-stack-md bg-surface-container border border-white/5 rounded-xl active:scale-[0.98]"
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-stack-md border border-white/10"
        style={{ backgroundColor: avatarColor }}
      >
        <Text className="text-white text-sm font-inter-bold font-bold">{initials}</Text>
      </View>

      <View className="flex-1 mr-2">
        <Text className="font-sans font-bold text-[16px] text-on-surface" numberOfLines={1}>
          {receipt.title}
        </Text>
        <LabelSm className="text-on-surface-variant" numberOfLines={1}>
          {subtitle}
        </LabelSm>
      </View>

      <View className="items-end">
        <Text className={`font-jakarta-bold font-bold ${amountClass}`}>
          {amountPrefix}
          {formatCurrency(receipt.totalAmount)}
        </Text>
        <LabelSm className="text-on-surface-variant mt-0.5">{caption}</LabelSm>
      </View>
    </TouchableOpacity>
  );
}
