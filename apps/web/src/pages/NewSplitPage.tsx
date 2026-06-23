import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrencyCents } from '@splitcheck/core';
import { ParticipantAvatarBubble, COLORS } from '@splitcheck/ui';
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
    <View style={styles.page}>
      <AppHeader />

      <View style={styles.header}>
        <Button mode="text" compact onPress={() => navigate(`/chat/${conversationId}`)}>
          Close
        </Button>
        <Text style={styles.headerTitle}>New Split</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <TextInput mode="outlined" label="What's this for?" value={title} onChangeText={setTitle} style={styles.input} />

        <Text style={styles.sectionLabel}>Items</Text>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemRow, index === selectedItemIndex && styles.itemRowSelected]}
            onPress={() => selectItem(index)}
          >
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemAssigned}>
                {item.assignedUserIds.length === 0
                  ? 'Tap avatars below to assign'
                  : `Split between ${item.assignedUserIds.length} ${item.assignedUserIds.length === 1 ? 'person' : 'people'}`}
              </Text>
            </View>
            <Text style={styles.itemPrice}>{formatCurrencyCents(item.priceCents)}</Text>
            <Button mode="text" compact accessibilityLabel={`Remove ${item.name}`} onPress={() => removeItem(index)}>
              Remove
            </Button>
          </TouchableOpacity>
        ))}

        <View style={styles.addItemRow}>
          <TextInput
            mode="outlined"
            placeholder="Item name"
            value={newItemName}
            onChangeText={setNewItemName}
            style={styles.addItemNameInput}
            dense
          />
          <TextInput
            mode="outlined"
            placeholder="0.00"
            value={newItemPrice}
            onChangeText={setNewItemPrice}
            keyboardType="decimal-pad"
            style={styles.addItemPriceInput}
            dense
          />
          <Button mode="contained-tonal" compact accessibilityLabel="Add item" onPress={onAddItem}>
            Add
          </Button>
        </View>

        {items.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>
              {selectedItemIndex < items.length ? `Who shares "${items[selectedItemIndex].name}"?` : 'Select an item'}
            </Text>
            <View style={styles.avatarRow}>
              {participants.map((p) => (
                <View key={p.id} style={styles.avatarWrapper}>
                  <ParticipantAvatarBubble
                    participant={{ name: p.displayName, avatarColor: p.avatarColor }}
                    isSelected={items[selectedItemIndex]?.assignedUserIds.includes(p.id)}
                    onPress={() => toggleParticipantForSelectedItem(p.id)}
                  />
                </View>
              ))}
            </View>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrencyCents(totalCents)}</Text>
        </View>
        <Button
          mode="contained"
          loading={submitting}
          disabled={submitting || items.length === 0}
          onPress={onSubmit}
          style={styles.submitButton}
        >
          Send Split Request
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    minHeight: '100vh' as unknown as number,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onBackground,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 32,
    gap: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 12,
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemRowSelected: {
    borderColor: COLORS.primary,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  itemAssigned: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.onSurface,
    marginRight: 4,
  },
  addItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addItemNameInput: {
    flex: 2,
    backgroundColor: COLORS.surface,
    marginRight: 6,
  },
  addItemPriceInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  error: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 8,
  },
  footer: {
    maxWidth: 640,
    width: '100%',
    alignSelf: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.onBackground,
  },
  submitButton: {
    borderRadius: 24,
  },
});
