import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { useSplitStore } from '@/store/useSplitStore';
import { ParticipantAvatarBubble } from '@/components/ParticipantAvatarBubble';
import { AssignmentProgressBar } from '@/components/AssignmentProgressBar';
import { COLORS } from '@/theme/theme';

export default function AssignItemsScreen() {
  const {
    assignment,
    selectItem,
    toggleParticipantForSelectedItem,
    addCustomParticipant,
    completeSplitReceipt,
    refreshParticipants,
  } = useSplitStore();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    refreshParticipants();
  }, []);

  const handleAddMember = async () => {
    if (!newName.trim()) return;
    await addCustomParticipant(newName.trim());
    setNewName('');
    setShowAddDialog(false);
  };

  const handleDone = async () => {
    const receiptId = await completeSplitReceipt();
    router.replace(`/split-summary/${receiptId}`);
  };

  const selectedItem = assignment.items[assignment.selectedItemIndex];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Assign Items</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{assignment.receiptTitle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <AssignmentProgressBar items={assignment.items} />

      {/* Items list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 280 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>TAP AN ITEM TO SELECT, THEN TAP A PERSON TO ASSIGN</Text>

        {assignment.items.map((item, index) => {
          const isSelected = index === assignment.selectedItemIndex;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, isSelected && styles.itemCardSelected]}
              onPress={() => selectItem(index)}
              activeOpacity={0.75}
            >
              <View style={[styles.itemCheckbox, isSelected && styles.itemCheckboxSelected]}>
                {item.assignedTo.length > 0 && (
                  <MaterialCommunityIcons name="check" size={14} color={COLORS.onPrimary} />
                )}
              </View>

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, isSelected && { color: COLORS.primary }]}>
                  {item.name}
                </Text>
                {item.assignedTo.length > 0 ? (
                  <Text style={styles.itemAssigned}>
                    {item.assignedTo.join(', ')}
                  </Text>
                ) : (
                  <Text style={styles.itemUnassigned}>Unassigned</Text>
                )}
              </View>

              <Text style={[styles.itemPrice, isSelected && { color: COLORS.primary }]}>
                ${item.price.toFixed(2)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Sticky bottom drawer */}
      <View style={styles.drawer}>
        <View style={styles.drawerHandle} />

        {selectedItem && (
          <Text style={styles.drawerPrompt}>
            Assign <Text style={styles.drawerItemName}>{selectedItem.name}</Text> to:
          </Text>
        )}

        <FlatList
          data={assignment.participants}
          keyExtractor={(p) => p.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.participantList}
          contentContainerStyle={styles.participantListContent}
          ListFooterComponent={() => (
            <TouchableOpacity
              style={styles.addPersonBtn}
              onPress={() => setShowAddDialog(true)}
            >
              <Svg width={52} height={52} style={StyleSheet.absoluteFill}>
                <Circle
                  cx={26}
                  cy={26}
                  r={24}
                  stroke={COLORS.outline}
                  strokeWidth={1.5}
                  strokeDasharray="6 5"
                  fill="none"
                />
              </Svg>
              <MaterialCommunityIcons
                name="plus"
                size={22}
                color={COLORS.onSurfaceVariant}
              />
            </TouchableOpacity>
          )}
          renderItem={({ item: participant }) => {
            const isAssigned = selectedItem?.assignedTo.includes(participant.name) ?? false;
            return (
              <View style={styles.participantItem}>
                <ParticipantAvatarBubble
                  participant={participant}
                  isSelected={isAssigned}
                  size={52}
                  onPress={() => toggleParticipantForSelectedItem(participant.name)}
                />
                <Text style={styles.participantName} numberOfLines={1}>
                  {participant.name}
                </Text>
              </View>
            );
          }}
        />

        <Button
          mode="contained"
          onPress={handleDone}
          style={styles.doneBtn}
          labelStyle={styles.doneBtnLabel}
          icon="check"
        >
          Done — Proceed to Summary
        </Button>
      </View>

      {/* Add Member Dialog */}
      <Portal>
        <Dialog visible={showAddDialog} onDismiss={() => setShowAddDialog(false)}>
          <Dialog.Title>Add Member</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              autoFocus
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onPress={handleAddMember}>Add</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  scroll: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 10,
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.8,
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  itemCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryContainer,
  },
  itemCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: COLORS.outline,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCheckboxSelected: {
    backgroundColor: COLORS.primary,
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
    fontSize: 12,
    color: COLORS.success,
    marginTop: 2,
  },
  itemUnassigned: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 16,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  drawerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    alignSelf: 'center',
    marginBottom: 12,
  },
  drawerPrompt: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  drawerItemName: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  participantList: {
    marginBottom: 14,
  },
  participantListContent: {
    paddingHorizontal: 16,
    gap: 16,
  },
  participantItem: {
    alignItems: 'center',
    gap: 6,
    width: 60,
  },
  participantName: {
    fontSize: 11,
    color: COLORS.onSurface,
    textAlign: 'center',
    maxWidth: 56,
  },
  addPersonBtn: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtn: {
    marginHorizontal: 16,
    borderRadius: 28,
  },
  doneBtnLabel: {
    fontWeight: '700',
    fontSize: 14,
  },
});
