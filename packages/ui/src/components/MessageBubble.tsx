import { View, Text, Image, StyleSheet } from 'react-native';
import type { Message } from '@splitcheck/core';
import { COLORS } from '../theme';

type Props = {
  message: Message;
  isMine: boolean;
  baseUrl: string;
};

export function MessageBubble({ message, isMine, baseUrl }: Props) {
  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {message.type === 'RECEIPT' && message.attachment ? (
          <Image source={{ uri: `${baseUrl}${message.attachment.url}` }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={[styles.text, isMine ? styles.textMine : styles.textTheirs]}>{message.body}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: COLORS.primary,
  },
  bubbleTheirs: {
    backgroundColor: COLORS.surface,
  },
  text: {
    fontSize: 15,
  },
  textMine: {
    color: COLORS.onPrimary,
  },
  textTheirs: {
    color: COLORS.onSurface,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
});
