import { View, Text, Image } from 'react-native';
import type { Message } from '@splitcheck/core';

type Props = {
  message: Message;
  isMine: boolean;
  baseUrl: string;
};

export function MessageBubble({ message, isMine, baseUrl }: Props) {
  return (
    <View className={`flex-row my-1 px-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
      <View
        className={`max-w-[78%] rounded-[18px] px-3.5 py-2.5 ${
          isMine ? 'bg-primary' : 'bg-surface-container border border-outline-variant'
        }`}
      >
        {message.type === 'RECEIPT' && message.attachment ? (
          <Image
            source={{ uri: `${baseUrl}${message.attachment.url}` }}
            className="w-[200px] h-[200px] rounded-xl"
            resizeMode="cover"
          />
        ) : (
          <Text className={`font-sans text-[15px] ${isMine ? 'text-on-primary' : 'text-on-surface'}`}>{message.body}</Text>
        )}
      </View>
    </View>
  );
}
