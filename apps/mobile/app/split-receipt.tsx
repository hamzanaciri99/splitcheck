import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatCurrencyCents, getAvatarInitials } from '@splitcheck/core';
import { Button, IconButton, Icon, TextField, ProgressBar, ParticipantAvatarBubble } from '@splitcheck/ui';
import { useReceiptSplitStore, type SplitMode } from '@/store/useReceiptSplitStore';
import { useAuthStore } from '@/store/useAuthStore';

const MODE_LABELS: Record<SplitMode, string> = {
  item: 'By Item',
  equal: 'Equally',
  percentage: 'Percentage',
};

export default function SplitReceiptScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    title,
    items,
    selectedItemIndex,
    splitMode,
    friends,
    selectedFriendIds,
    percentages,
    submitting,
    setTitle,
    addItem,
    removeItem,
    selectItem,
    toggleParticipantForSelectedItem,
    setSplitMode,
    toggleFriendSelected,
    setPercentage,
    submit,
    loadFriends,
    reset,
  } = useReceiptSplitStore();

  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  useEffect(() => {
    if (user) loadFriends(user.id);
  }, [user]);

  if (!user) return null;

  const totalCents = items.reduce((sum, i) => sum + i.priceCents, 0);
  const assignedCount = items.filter((i) => i.assignedUserIds.length > 0).length;
  const progress = items.length === 0 ? 0 : assignedCount / items.length;
  const myPctRemaining = 100 - selectedFriendIds.reduce((sum, id) => sum + (percentages[id] ?? 0), 0);

  const onAddItem = () => {
    const priceCents = Math.round(parseFloat(newItemPrice || '0') * 100);
    if (!newItemName.trim() || !priceCents) return;
    addItem(newItemName.trim(), priceCents);
    setNewItemName('');
    setNewItemPrice('');
  };

  const onSend = async () => {
    try {
      await submit(user.id);
      reset();
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Could not send split', err instanceof Error ? err.message : 'Please try again');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-row items-center px-2 py-2">
        <IconButton accessibilityLabel="Close" onPress={() => router.replace('/(tabs)')}>
          <Icon name="close" size={20} color="#F5F5F5" />
        </IconButton>
        <Text className="text-text-primary text-[17px] font-bold ml-1">Split Receipt</Text>
      </View>

      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 gap-2" showsVerticalScrollIndicator={false}>
        <TextField placeholder="What's this for?" value={title} onChangeText={setTitle} className="mb-2" />

        <View className="flex-row gap-2 mb-2">
          {(['item', 'equal', 'percentage'] as SplitMode[]).map((mode) => (
            <View key={mode} className="flex-1">
              <Button variant={splitMode === mode ? 'primary' : 'secondary'} onPress={() => setSplitMode(mode)}>
                {MODE_LABELS[mode]}
              </Button>
            </View>
          ))}
        </View>

        {items.map((item, index) => {
          const isSelected = index === selectedItemIndex;
          const isAssigned = item.assignedUserIds.length > 0;
          return (
            <TouchableOpacity
              key={item.id}
              className={`flex-row items-center bg-surface rounded-2xl px-4 py-3.5 border ${
                isSelected && splitMode === 'item' ? 'border-accent' : 'border-transparent'
              }`}
              onPress={() => splitMode === 'item' && selectItem(index)}
              disabled={splitMode !== 'item'}
            >
              {splitMode === 'item' && (
                <View
                  className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                    isAssigned ? 'bg-accent' : 'border border-border'
                  }`}
                >
                  {isAssigned && <Icon name="check" size={14} color="#0D0D0F" />}
                </View>
              )}
              <View className="flex-1">
                <Text className="text-text-primary text-[15px] font-semibold">{item.name}</Text>
                {splitMode === 'item' && !isAssigned && (
                  <Text className="text-text-secondary text-xs mt-0.5">Tap to assign · defaults to you</Text>
                )}
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

        {splitMode === 'item' && items.length > 0 && (
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

        {splitMode === 'item' && items.length > 0 && (
          <View className="mt-4 gap-3">
            <Text className="text-text-secondary text-xs font-semibold tracking-wide">
              {selectedItemIndex < items.length
                ? `WHO SHARES "${items[selectedItemIndex].name.toUpperCase()}"?`
                : 'SELECT AN ITEM'}
            </Text>
            {friends.length === 0 ? (
              <Text className="text-text-secondary text-sm">No friends yet — start a chat first.</Text>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {friends.map((f) => (
                  <ParticipantAvatarBubble
                    key={f.id}
                    participant={{ name: f.displayName, avatarColor: f.avatarColor }}
                    isSelected={items[selectedItemIndex]?.assignedUserIds.includes(f.id)}
                    onPress={() => toggleParticipantForSelectedItem(f.id)}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {splitMode !== 'item' && (
          <View className="mt-4 gap-2">
            <Text className="text-text-secondary text-xs font-semibold tracking-wide">SPLIT WITH</Text>
            {friends.length === 0 ? (
              <Text className="text-text-secondary text-sm">No friends yet — start a chat first.</Text>
            ) : (
              <View className="bg-surface rounded-2xl overflow-hidden">
                {friends.map((f, idx) => {
                  const isSelected = selectedFriendIds.includes(f.id);
                  const initials = getAvatarInitials(f.displayName);
                  return (
                    <View
                      key={f.id}
                      className={`flex-row items-center px-4 py-3 ${idx > 0 ? 'border-t border-border' : ''}`}
                    >
                      <TouchableOpacity
                        className="flex-1 flex-row items-center"
                        onPress={() => toggleFriendSelected(f.id)}
                      >
                        <View
                          className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                            isSelected ? 'bg-accent' : 'border border-border'
                          }`}
                        >
                          {isSelected && <Icon name="check" size={14} color="#0D0D0F" />}
                        </View>
                        <View
                          className="w-9 h-9 rounded-full items-center justify-center mr-2.5"
                          style={{ backgroundColor: f.avatarColor }}
                        >
                          <Text className="text-white text-xs font-bold">{initials}</Text>
                        </View>
                        <Text className="text-text-primary text-[15px] font-semibold">{f.displayName}</Text>
                      </TouchableOpacity>
                      {splitMode === 'percentage' && isSelected && (
                        <View className="w-16">
                          <TextField
                            placeholder="0"
                            keyboardType="number-pad"
                            value={percentages[f.id] != null ? String(percentages[f.id]) : ''}
                            onChangeText={(v) => setPercentage(f.id, Number(v.replace(/[^0-9]/g, '')) || 0)}
                          />
                        </View>
                      )}
                      {splitMode === 'equal' && isSelected && selectedFriendIds.length > 0 && (
                        <Text className="text-text-secondary text-xs">
                          {formatCurrencyCents(Math.round(totalCents / (selectedFriendIds.length + 1)))}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {splitMode === 'percentage' && selectedFriendIds.length > 0 && (
              <View className="flex-row justify-between px-1 mt-1">
                <Text className="text-text-secondary text-xs">You</Text>
                <Text className={`text-xs font-semibold ${myPctRemaining < 0 ? 'text-negative' : 'text-text-primary'}`}>
                  {myPctRemaining < 0 ? `Over by ${-myPctRemaining}%` : `Your share: ${myPctRemaining}%`}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View className="px-5 py-4 border-t border-border">
        <View className="flex-row justify-between mb-3">
          <Text className="text-text-secondary text-sm">Total</Text>
          <Text className="text-text-primary text-lg font-extrabold">{formatCurrencyCents(totalCents)}</Text>
        </View>
        <Button variant="primary" fullWidth loading={submitting} disabled={submitting || items.length === 0} onPress={onSend}>
          Send Requests
        </Button>
      </View>
    </SafeAreaView>
  );
}
