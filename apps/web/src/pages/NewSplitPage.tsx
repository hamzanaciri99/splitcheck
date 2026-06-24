import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrencyCents } from '@splitcheck/core';
import { ParticipantAvatarBubble, Button, TextField } from '@splitcheck/ui';
import { useSplitDraftStore } from '../store/useSplitDraftStore';
import { useChatStore } from '../store/useChatStore';
import { AppHeader } from '../components/AppHeader';

export default function NewSplitPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
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
  const [error, setError] = useState<string | null>(null);

  const totalCents = items.reduce((sum, i) => sum + i.priceCents, 0);

  const onAddItem = () => {
    const priceCents = Math.round(parseFloat(newItemPrice || '0') * 100);
    if (!newItemName.trim() || !priceCents) return;
    addItem(newItemName.trim(), priceCents);
    setNewItemName('');
    setNewItemPrice('');
  };

  const onSubmit = async () => {
    setError(null);
    try {
      const message = await submit();
      useChatStore.getState().upsertMessage(message);
      navigate(`/chat/${conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create split');
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ minHeight: '100vh' as unknown as number }}>
      <AppHeader />

      <View className="flex-row items-center max-w-[640px] w-full self-center">
        <Button variant="ghost" onPress={() => navigate(`/chat/${conversationId}`)}>
          Close
        </Button>
        <Text className="text-on-background text-[17px] font-bold">New Split</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="max-w-[640px] w-full self-center p-4 pb-8 gap-2">
        <TextField placeholder="What's this for?" value={title} onChangeText={setTitle} className="mb-2" />

        <Text className="text-on-surface-variant text-xs font-bold uppercase tracking-wide mt-3 mb-1">Items</Text>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            className={`flex-row items-center bg-surface-container rounded-xl px-3 py-2.5 mb-1.5 border ${
              index === selectedItemIndex ? 'border-primary' : 'border-transparent'
            }`}
            onPress={() => selectItem(index)}
          >
            <View className="flex-1">
              <Text className="text-on-background text-sm font-semibold">{item.name}</Text>
              <Text className="text-on-surface-variant text-[11px] mt-0.5">
                {item.assignedUserIds.length === 0
                  ? 'Tap avatars below to assign'
                  : `Split between ${item.assignedUserIds.length} ${item.assignedUserIds.length === 1 ? 'person' : 'people'}`}
              </Text>
            </View>
            <Text className="text-on-background text-sm font-bold mr-1">{formatCurrencyCents(item.priceCents)}</Text>
            <Button variant="ghost" accessibilityLabel={`Remove ${item.name}`} onPress={() => removeItem(index)}>
              Remove
            </Button>
          </TouchableOpacity>
        ))}

        <View className="flex-row items-end gap-2 mt-1">
          <View className="flex-[2]">
            <TextField placeholder="Item name" value={newItemName} onChangeText={setNewItemName} />
          </View>
          <View className="flex-1">
            <TextField placeholder="0.00" value={newItemPrice} onChangeText={setNewItemPrice} keyboardType="decimal-pad" />
          </View>
          <Button variant="secondary" accessibilityLabel="Add item" onPress={onAddItem}>
            Add
          </Button>
        </View>

        {items.length > 0 && (
          <>
            <Text className="text-on-surface-variant text-xs font-bold uppercase tracking-wide mt-3 mb-1">
              {selectedItemIndex < items.length ? `Who shares "${items[selectedItemIndex].name}"?` : 'Select an item'}
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
          </>
        )}

        {error && <Text className="text-error text-[13px] mt-2">{error}</Text>}
      </ScrollView>

      <View className="max-w-[640px] w-full self-center p-4 border-t border-outline-variant">
        <View className="flex-row justify-between mb-3">
          <Text className="text-on-surface-variant text-sm">Total</Text>
          <Text className="text-on-background text-lg font-extrabold">{formatCurrencyCents(totalCents)}</Text>
        </View>
        <Button variant="primary" fullWidth loading={submitting} disabled={submitting || items.length === 0} onPress={onSubmit}>
          Send Split Request
        </Button>
      </View>
    </View>
  );
}
