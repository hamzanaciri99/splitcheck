import { create } from 'zustand';
import { SplitRepository, Receipt, ReceiptItem, Participant } from '@/repositories/SplitRepository';
import { DEMO_SCANNED_RECEIPT, getAvatarColor } from '@/constants/seedData';

export type TempItem = {
  id: number;
  name: string;
  price: number;
  assignedTo: string[]; // participant names
};

export type AssignmentState = {
  receiptTitle: string;
  items: TempItem[];
  selectedItemIndex: number;
  participants: Participant[];
};

export type DashboardState = {
  owedToYou: number;
  youOwe: number;
  totalBalance: number;
  receipts: Receipt[];
  participants: Participant[];
};

type SplitStore = {
  // Data
  dashboard: DashboardState;
  assignment: AssignmentState;
  isScanning: boolean;
  scanProgress: number;

  // Actions
  refreshDashboard: () => Promise<void>;
  refreshParticipants: () => Promise<void>;
  startScan: () => void;
  captureAndScan: (onComplete: () => void) => void;
  selectItem: (index: number) => void;
  toggleParticipantForSelectedItem: (name: string) => void;
  addCustomParticipant: (name: string) => Promise<void>;
  completeSplitReceipt: () => Promise<number>;
  settleReceipt: (id: number) => Promise<void>;
  settleAll: () => Promise<void>;
  loadAssignmentForReceipt: (receiptId: number) => Promise<void>;
};

export const useSplitStore = create<SplitStore>((set, get) => ({
  dashboard: {
    owedToYou: 0,
    youOwe: 0,
    totalBalance: 0,
    receipts: [],
    participants: [],
  },
  assignment: {
    receiptTitle: '',
    items: [],
    selectedItemIndex: 0,
    participants: [],
  },
  isScanning: false,
  scanProgress: 0,

  refreshDashboard: async () => {
    const [receipts, participants] = await Promise.all([
      SplitRepository.getAllReceipts(),
      SplitRepository.getAllParticipants(),
    ]);

    let owedToYou = 0;
    let youOwe = 0;

    for (const r of receipts) {
      if (r.isSettled) continue;
      const items = await SplitRepository.getItemsForReceipt(r.id);
      for (const item of items) {
        if (!item.assignedTo) continue;
        const people = item.assignedTo.split(',').filter(Boolean);
        if (people.length === 0) continue;
        const share = item.price / people.length;

        if (r.payer === 'You') {
          // Others owe me their share
          for (const p of people) {
            if (p.trim() !== 'Me') owedToYou += share;
          }
        } else {
          // I owe my share if assigned to me
          if (people.map((p) => p.trim()).includes('Me')) {
            youOwe += share;
          }
        }
      }
    }

    set({
      dashboard: {
        owedToYou,
        youOwe,
        totalBalance: owedToYou - youOwe,
        receipts,
        participants,
      },
    });
  },

  refreshParticipants: async () => {
    const participants = await SplitRepository.getAllParticipants();
    set((state) => ({
      assignment: { ...state.assignment, participants },
      dashboard: { ...state.dashboard, participants },
    }));
  },

  startScan: () => {
    // Navigation is handled by the screen
  },

  captureAndScan: (onComplete: () => void) => {
    set({ isScanning: true, scanProgress: 0 });

    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      set({ scanProgress: step / 10 });
      if (step >= 10) {
        clearInterval(interval);
        const { assignment } = get();
        set({
          isScanning: false,
          scanProgress: 0,
          assignment: {
            ...assignment,
            receiptTitle: DEMO_SCANNED_RECEIPT.title,
            items: DEMO_SCANNED_RECEIPT.items.map((i) => ({ ...i, assignedTo: [] })),
            selectedItemIndex: 0,
          },
        });
        onComplete();
      }
    }, 150);
  },

  selectItem: (index: number) => {
    set((state) => ({
      assignment: { ...state.assignment, selectedItemIndex: index },
    }));
  },

  toggleParticipantForSelectedItem: (participantName: string) => {
    set((state) => {
      const { assignment } = state;
      const index = assignment.selectedItemIndex;
      if (index < 0 || index >= assignment.items.length) return state;

      const updatedItems = assignment.items.map((item, idx) => {
        if (idx !== index) return item;
        const list = item.assignedTo.includes(participantName)
          ? item.assignedTo.filter((n) => n !== participantName)
          : [...item.assignedTo, participantName];
        return { ...item, assignedTo: list };
      });

      return { assignment: { ...assignment, items: updatedItems } };
    });
  },

  addCustomParticipant: async (name: string) => {
    if (!name.trim()) return;
    const color = getAvatarColor(name);
    await SplitRepository.insertParticipant(name.trim(), color);
    await get().refreshParticipants();
  },

  completeSplitReceipt: async () => {
    const { assignment } = get();
    const total = assignment.items.reduce((sum, i) => sum + i.price, 0);

    const receiptId = await SplitRepository.insertReceipt(
      assignment.receiptTitle,
      'Today',
      total,
      'You',
      false
    );

    await SplitRepository.insertItems(
      assignment.items.map((i) => ({
        receiptId,
        name: i.name,
        price: i.price,
        assignedTo: i.assignedTo.join(','),
      }))
    );

    await get().refreshDashboard();
    return receiptId;
  },

  settleReceipt: async (id: number) => {
    await SplitRepository.settleReceipt(id);
    await get().refreshDashboard();
  },

  settleAll: async () => {
    await SplitRepository.settleAllReceipts();
    await get().refreshDashboard();
  },

  loadAssignmentForReceipt: async (receiptId: number) => {
    const [receipt, items, participants] = await Promise.all([
      SplitRepository.getReceiptById(receiptId),
      SplitRepository.getItemsForReceipt(receiptId),
      SplitRepository.getAllParticipants(),
    ]);
    if (!receipt) return;

    const tempItems: TempItem[] = items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      assignedTo: item.assignedTo ? item.assignedTo.split(',').filter(Boolean) : [],
    }));

    const firstUnassigned = tempItems.findIndex((i) => i.assignedTo.length === 0);

    set({
      assignment: {
        receiptTitle: receipt.title,
        items: tempItems,
        selectedItemIndex: firstUnassigned >= 0 ? firstUnassigned : 0,
        participants,
      },
    });
  },
}));
