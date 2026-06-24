import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { formatCurrencyCents } from '@splitcheck/core';
import { useSplitDraftStore } from '@/store/useSplitDraftStore';
import { useChatStore } from '@/store/useChatStore';
import {
  Button,
  IconButton,
  Icon,
  TextField,
  ProgressBar,
  ParticipantAvatarBubble,
  TopAppBar,
  HeadlineLg,
  BodyMd,
  BodyLg,
  LabelMd,
} from '@splitcheck/ui';

export default function NewSplitScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const {
    title,
    items,
    participants,
    selectedItemIndex,
    submitting,
    setTitle,
    addItem,
    removeItem,
    selectItem,
    toggleParticipantForSelectedItem,
    submit,
  } = useSplitDraftStore();

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const totalCents = items.reduce((sum, i) => sum + i.priceCents, 0);
  const assignedCount = items.filter((i) => i.assignedUserIds.length > 0).length;
  const progress = items.length === 0 ? 0 : assignedCount / items.length;

  const onAddItem = () => {
    const priceCents = Math.round(parseFloat(newItemPrice || '0') * 100);
    if (!newItemName.trim() || !priceCents) return;
    addItem(newItemName.trim(), priceCents);
    setNewItemName('');
    setNewItemPrice('');
  };

  const onSubmit = async () => {
    try {
      const message = await submit();
      useChatStore.getState().upsertMessage(message);
      router.replace(`/chat/${conversationId}`);
    } catch (err) {
      Alert.alert('Could not create split', err instanceof Error ? err.message : 'Please try again');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <TopAppBar leftIcon="close" onLeftPress={() => router.back()} onRightPress={() => {}} />

      <ScrollView className="flex-1" contentContainerClassName="px-gutter pt-24 pb-[280px]" showsVerticalScrollIndicator={false}>
        <View className="mb-stack-lg">
          <HeadlineLg className="text-on-surface mb-2">Select items</HeadlineLg>
          <BodyMd className="text-on-surface-variant">Tap items to assign them to your group members.</BodyMd>
        </View>

        <TextField placeholder="What's this for?" value={title} onChangeText={setTitle} className="mb-stack-md" />

        <View className="gap-3">
          {items.map((item, index) => {
            const isSelected = index === selectedItemIndex;
            const isAssigned = item.assignedUserIds.length > 0;
            return (
              <TouchableOpacity
                key={item.id}
                className={`w-full flex-row items-center justify-between p-4 rounded-xl ${
                  isSelected
                    ? 'bg-surface-container-high border-2 border-primary'
                    : 'bg-surface-container border border-outline-variant'
                }`}
                onPress={() => selectItem(index)}
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      isAssigned ? 'bg-primary' : 'border-2 border-outline-variant'
                    }`}
                  >
                    {isAssigned && <Icon name="check" size={14} color="#223336" />}
                  </View>
                  <BodyLg className="flex-1 text-on-surface" numberOfLines={1}>
                    {item.name}
                  </BodyLg>
                </View>
                <View className="flex-row items-center gap-2">
                  <BodyLg className={`font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                    {formatCurrencyCents(item.priceCents)}
                  </BodyLg>
                  <IconButton accessibilityLabel={`Remove ${item.name}`} size={28} onPress={() => removeItem(index)}>
                    <Icon name="close" size={14} color="#859585" />
                  </IconButton>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="flex-row items-end gap-2 mt-stack-md">
          <View className="flex-[2]">
            <TextField placeholder="Item name" value={newItemName} onChangeText={setNewItemName} />
          </View>
          <View className="flex-1">
            <TextField placeholder="0.00" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="decimal-pad" />
          </View>
          <IconButton accessibilityLabel="Add item" variant="circle" onPress={onAddItem}>
            <Icon name="plus" size={18} color="#d5e8ec" />
          </IconButton>
        </View>

        {items.length > 0 && (
          <View className="mt-stack-lg pt-6">
            <View className="flex-row justify-between items-center mb-3">
              <LabelMd className="text-on-surface-variant uppercase tracking-widest text-[10px]">
                Assignment Progress
              </LabelMd>
              <LabelMd className="font-bold text-primary">
                {assignedCount} / {items.length} Assigned
              </LabelMd>
            </View>
            <ProgressBar progress={progress} />
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 w-full z-40 bg-surface-container-lowest border-t border-white/5 rounded-t-[28px] pb-10 pt-8 px-gutter">
        <View className="flex-row items-center justify-between mb-6">
          <LabelMd className="text-on-surface-variant font-bold uppercase tracking-[0.15em]">Assign to</LabelMd>
          <Text className="font-jakarta-bold font-bold text-primary">{formatCurrencyCents(totalCents)}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 pb-4">
          {participants.map((p) => (
            <View key={p.id} className="items-center gap-2 min-w-[72px]">
              <ParticipantAvatarBubble
                participant={{ name: p.displayName, avatarColor: p.avatarColor }}
                isSelected={items[selectedItemIndex]?.assignedUserIds.includes(p.id) ?? false}
                size={64}
                onPress={() => toggleParticipantForSelectedItem(p.id)}
              />
              <LabelMd className="text-on-surface-variant" numberOfLines={1}>
                {p.displayName}
              </LabelMd>
            </View>
          ))}
        </ScrollView>

        <View className="mt-2">
          <Button
            variant="primary"
            fullWidth
            loading={submitting}
            disabled={submitting || items.length === 0}
            onPress={onSubmit}
            icon={<Icon name="chevron-right" size={18} color="#223336" />}
            iconPosition="trailing"
          >
            Send Split Request
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
