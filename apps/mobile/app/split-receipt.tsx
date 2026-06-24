import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { formatCurrencyCents, getAvatarInitials } from '@splitcheck/core';
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
    <SafeAreaView className="flex-1 bg-background">
      <TopAppBar leftIcon="close" onLeftPress={() => router.replace('/(tabs)')} onRightPress={() => {}} />

      <ScrollView className="flex-1" contentContainerClassName="px-gutter pt-24 pb-[340px]" showsVerticalScrollIndicator={false}>
        <View className="mb-stack-lg">
          <HeadlineLg className="text-on-surface mb-2">Select items</HeadlineLg>
          <BodyMd className="text-on-surface-variant">Tap items to assign them to your group members.</BodyMd>
        </View>

        <TextField placeholder="What's this for?" value={title} onChangeText={setTitle} className="mb-stack-md" />

        <View className="flex-row gap-2 mb-stack-lg">
          {(['item', 'equal', 'percentage'] as SplitMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setSplitMode(mode)}
              className={`flex-1 items-center py-2.5 rounded-lg border ${
                splitMode === mode ? 'bg-surface-container-high border-primary' : 'bg-surface-container border-outline-variant'
              }`}
            >
              <LabelMd className={splitMode === mode ? 'text-primary' : 'text-on-surface-variant'}>
                {MODE_LABELS[mode]}
              </LabelMd>
            </TouchableOpacity>
          ))}
        </View>

        <View className="gap-3">
          {items.map((item, index) => {
            const isSelected = index === selectedItemIndex && splitMode === 'item';
            const isAssigned = item.assignedUserIds.length > 0;
            return (
              <TouchableOpacity
                key={item.id}
                className={`w-full flex-row items-center justify-between p-4 rounded-xl ${
                  isSelected
                    ? 'bg-surface-container-high border-2 border-primary'
                    : 'bg-surface-container border border-outline-variant'
                }`}
                onPress={() => splitMode === 'item' && selectItem(index)}
                disabled={splitMode !== 'item'}
              >
                <View className="flex-row items-center gap-4 flex-1">
                  <View
                    className={`w-6 h-6 rounded-full items-center justify-center ${
                      isAssigned ? 'bg-primary' : 'border-2 border-outline-variant'
                    }`}
                  >
                    {isAssigned && <Icon name="check" size={14} color="#223336" />}
                  </View>
                  <BodyLg className={`flex-1 ${isSelected ? 'font-semibold text-on-surface' : 'text-on-surface'}`} numberOfLines={1}>
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

        {splitMode === 'item' && items.length > 0 && (
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

        {splitMode !== 'item' && (
          <View className="mt-stack-lg gap-2">
            <LabelMd className="text-on-surface-variant uppercase tracking-widest text-[10px]">Split with</LabelMd>
            {friends.length === 0 ? (
              <BodyMd className="text-on-surface-variant">No friends yet — start a chat first.</BodyMd>
            ) : (
              <View className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
                {friends.map((f, idx) => {
                  const isSelected = selectedFriendIds.includes(f.id);
                  const initials = getAvatarInitials(f.displayName);
                  return (
                    <View
                      key={f.id}
                      className={`flex-row items-center px-4 py-3 ${idx > 0 ? 'border-t border-outline-variant' : ''}`}
                    >
                      <TouchableOpacity className="flex-1 flex-row items-center" onPress={() => toggleFriendSelected(f.id)}>
                        <View
                          className={`w-6 h-6 rounded-full items-center justify-center mr-3 ${
                            isSelected ? 'bg-primary' : 'border-2 border-outline-variant'
                          }`}
                        >
                          {isSelected && <Icon name="check" size={14} color="#223336" />}
                        </View>
                        <View
                          className="w-9 h-9 rounded-full items-center justify-center mr-2.5"
                          style={{ backgroundColor: f.avatarColor }}
                        >
                          <Text className="text-white text-xs font-inter-bold font-bold">{initials}</Text>
                        </View>
                        <BodyMd className="text-on-surface font-semibold">{f.displayName}</BodyMd>
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
                        <LabelMd className="text-on-surface-variant">
                          {formatCurrencyCents(Math.round(totalCents / (selectedFriendIds.length + 1)))}
                        </LabelMd>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {splitMode === 'percentage' && selectedFriendIds.length > 0 && (
              <View className="flex-row justify-between px-1 mt-1">
                <LabelMd className="text-on-surface-variant">You</LabelMd>
                <LabelMd className={myPctRemaining < 0 ? 'text-error' : 'text-on-surface'}>
                  {myPctRemaining < 0 ? `Over by ${-myPctRemaining}%` : `Your share: ${myPctRemaining}%`}
                </LabelMd>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 w-full z-40 bg-surface-container-lowest border-t border-white/5 rounded-t-[28px] pb-10 pt-8 px-gutter">
        <View className="flex-row items-center justify-between mb-6">
          <LabelMd className="text-on-surface-variant font-bold uppercase tracking-[0.15em]">
            {splitMode === 'item' ? 'Assign to' : 'Total'}
          </LabelMd>
          {splitMode === 'item' ? (
            <Text className="font-jakarta-bold font-bold text-primary">{formatCurrencyCents(totalCents)}</Text>
          ) : (
            <Text className="font-jakarta-bold font-bold text-on-surface">{formatCurrencyCents(totalCents)}</Text>
          )}
        </View>

        {splitMode === 'item' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-4 pb-4">
            <View className="items-center gap-2 min-w-[72px]">
              <ParticipantAvatarBubble
                participant={{ name: user.displayName, avatarColor: user.avatarColor }}
                isSelected={items[selectedItemIndex]?.assignedUserIds.includes(user.id) ?? false}
                size={64}
                onPress={() => toggleParticipantForSelectedItem(user.id)}
              />
              <LabelMd className="text-primary font-bold">Me</LabelMd>
            </View>
            {friends.map((f) => (
              <View key={f.id} className="items-center gap-2 min-w-[72px]">
                <ParticipantAvatarBubble
                  participant={{ name: f.displayName, avatarColor: f.avatarColor }}
                  isSelected={items[selectedItemIndex]?.assignedUserIds.includes(f.id) ?? false}
                  size={64}
                  onPress={() => toggleParticipantForSelectedItem(f.id)}
                />
                <LabelMd className="text-on-surface-variant" numberOfLines={1}>
                  {f.displayName}
                </LabelMd>
              </View>
            ))}
          </ScrollView>
        )}

        <View className="mt-2">
          <Button
            variant="primary"
            fullWidth
            loading={submitting}
            disabled={submitting || items.length === 0}
            onPress={onSend}
            icon={<Icon name="chevron-right" size={18} color="#223336" />}
            iconPosition="trailing"
          >
            Send Requests
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
