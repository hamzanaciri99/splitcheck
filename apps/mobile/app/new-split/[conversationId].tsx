import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { formatCurrencyCents } from '@splitcheck/core';
import { useSplitDraftStore } from '@/store/useSplitDraftStore';
import { useChatStore } from '@/store/useChatStore';
import { Button, IconButton, Icon, TextField, ProgressBar, ParticipantAvatarBubble } from '@splitcheck/ui';

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
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-row items-center px-2 py-2">
        <IconButton accessibilityLabel="Close" onPress={() => router.back()}>
          <Icon name="close" size={20} color="#F5F5F5" />
        </IconButton>
        <Text className="text-text-primary text-[17px] font-bold ml-1">Select Items</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 gap-2" showsVerticalScrollIndicator={false}>
        <Text className="text-text-secondary text-sm mb-1">Tap items to assign them, then choose who shares each one.</Text>

        <TextField placeholder="What's this for?" value={title} onChangeText={setTitle} className="mb-2" />

        {items.map((item, index) => {
          const isSelected = index === selectedItemIndex;
          const isAssigned = item.assignedUserIds.length > 0;
          return (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center bg-surface rounded-2xl px-4 py-3.5 border ${
                isSelected ? 'border-accent' : 'border-transparent'
              }`}
              onPress={() => selectItem(index)}
            >
              <View
                className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                  isAssigned ? 'bg-accent' : 'border border-border'
                }`}
              >
                {isAssigned && <Icon name="check" size={14} color="#0D0D0F" />}
              </View>
              <View className="flex-1">
                <Text className="text-text-primary text-[15px] font-semibold">{item.name}</Text>
                {!isAssigned && <Text className="text-text-secondary text-xs mt-0.5">Tap avatars below to assign</Text>}
              </View>
              <Text className="text-text-primary text-[15px] font-bold mr-1">{formatCurrencyCents(item.priceCents)}</Text>
              <IconButton accessibilityLabel={`Remove ${item.name}`} size={32} onPress={() => removeItem(index)}>
                <Icon name="close" size={14} color="#6E6E73" />
              </IconButton>
            </TouchableOpacity>
          );
        })}

        <View className="flex-row items-end gap-2 mt-1">
          <View className="flex-[2]">
            <TextField placeholder="Item name" value={newItemName} onChangeText={setNewItemName} />
          </View>
          <View className="flex-1">
            <TextField placeholder="0.00" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="decimal-pad" />
          </View>
          <IconButton accessibilityLabel="Add item" variant="circle" onPress={onAddItem}>
            <Icon name="plus" size={18} color="#A8E8D6" />
          </IconButton>
        </View>

        {items.length > 0 && (
          <View className="mt-4 gap-2">
            <View className="flex-row justify-between">
              <Text className="text-text-secondary text-xs font-semibold tracking-wide">ASSIGNMENT PROGRESS</Text>
              <Text className="text-text-primary text-xs font-semibold">
                {assignedCount}/{items.length} Assigned
              </Text>
            </View>
            <ProgressBar progress={progress} />
          </View>
        )}

        {items.length > 0 && (
          <View className="mt-4 gap-3">
            <Text className="text-text-secondary text-xs font-semibold tracking-wide">
              {selectedItemIndex < items.length ? `WHO SHARES "${items[selectedItemIndex].name.toUpperCase()}"?` : 'SELECT AN ITEM'}
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {participants.map((p) => (
                <ParticipantAvatarBubble
                  key={p.id}
                  participant={{ name: p.displayName, avatarColor: p.avatarColor }}
                  isSelected={items[selectedItemIndex]?.assignedUserIds.includes(p.id)}
                  onPress={() => toggleParticipantForSelectedItem(p.id)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View className="px-5 py-4 border-t border-border">
        <View className="flex-row justify-between mb-3">
          <Text className="text-text-secondary text-sm">Total</Text>
          <Text className="text-text-primary text-lg font-extrabold">{formatCurrencyCents(totalCents)}</Text>
        </View>
        <Button variant="primary" fullWidth loading={submitting} disabled={submitting || items.length === 0} onPress={onSubmit}>
          Send Split Request
        </Button>
      </View>
    </SafeAreaView>
  );
}
