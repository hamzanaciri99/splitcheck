import { create } from 'zustand';
import type { Message, User } from '@splitcheck/core';
import { api } from '@/api/client';
import { useChatStore, otherParticipants } from '@/store/useChatStore';

export type SplitMode = 'item' | 'equal' | 'percentage';

export type DraftItem = {
  id: string;
  name: string;
  priceCents: number;
  assignedUserIds: string[];
};

type InitParams = {
  title: string;
  attachmentId: string | null;
  items: { name: string; priceCents: number }[];
};

type ReceiptSplitState = {
  title: string;
  attachmentId: string | null;
  items: DraftItem[];
  selectedItemIndex: number;
  splitMode: SplitMode;
  friends: User[];
  selectedFriendIds: string[];
  percentages: Record<string, number>;
  submitting: boolean;
  error: string | null;

  initFromScan: (params: InitParams) => void;
  loadFriends: (currentUserId: string) => void;
  setTitle: (title: string) => void;
  addItem: (name: string, priceCents: number) => void;
  removeItem: (index: number) => void;
  selectItem: (index: number) => void;
  toggleParticipantForSelectedItem: (userId: string) => void;
  setSplitMode: (mode: SplitMode) => void;
  toggleFriendSelected: (userId: string) => void;
  setPercentage: (userId: string, pct: number) => void;
  submit: (currentUserId: string) => Promise<Message>;
  reset: () => void;
};

let nextId = 0;
function makeItemId(): string {
  nextId += 1;
  return `receipt-${Date.now()}-${nextId}`;
}

function distributeRemainder(base: number, totalCents: number, n: number): number[] {
  const perPerson = Math.floor(totalCents / n);
  const remainder = totalCents - perPerson * n;
  return Array.from({ length: n }, (_, idx) => perPerson + (idx < remainder ? 1 : 0));
}

function computeItemShares(items: DraftItem[], currentUserId: string): Map<string, number> {
  const shares = new Map<string, number>();
  for (const item of items) {
    const assignees = item.assignedUserIds.length > 0 ? item.assignedUserIds : [currentUserId];
    const parts = distributeRemainder(0, item.priceCents, assignees.length);
    assignees.forEach((userId, idx) => {
      shares.set(userId, (shares.get(userId) ?? 0) + parts[idx]);
    });
  }
  return shares;
}

export const useReceiptSplitStore = create<ReceiptSplitState>((set, get) => ({
  title: '',
  attachmentId: null,
  items: [],
  selectedItemIndex: 0,
  splitMode: 'item',
  friends: [],
  selectedFriendIds: [],
  percentages: {},
  submitting: false,
  error: null,

  initFromScan: ({ title, attachmentId, items }) => {
    set({
      title,
      attachmentId,
      items: items.map((i) => ({ id: makeItemId(), name: i.name, priceCents: i.priceCents, assignedUserIds: [] })),
      selectedItemIndex: 0,
      splitMode: 'item',
      selectedFriendIds: [],
      percentages: {},
      error: null,
    });
  },

  loadFriends: (currentUserId) => {
    // Friends are derived from everyone you've ever shared a conversation with.
    const populate = () => {
      const seen = new Map<string, User>();
      for (const c of useChatStore.getState().conversations) {
        for (const u of otherParticipants(c, currentUserId)) seen.set(u.id, u);
      }
      set({ friends: Array.from(seen.values()) });
    };

    const { conversations, loadConversations } = useChatStore.getState();
    if (conversations.length === 0) {
      loadConversations().then(populate);
    } else {
      populate();
    }
  },

  setTitle: (title) => set({ title }),

  addItem: (name, priceCents) => {
    set((state) => ({
      items: [...state.items, { id: makeItemId(), name, priceCents, assignedUserIds: [] }],
      selectedItemIndex: state.items.length,
    }));
  },

  removeItem: (index) => {
    set((state) => {
      const items = state.items.filter((_, i) => i !== index);
      return { items, selectedItemIndex: Math.min(state.selectedItemIndex, Math.max(items.length - 1, 0)) };
    });
  },

  selectItem: (index) => set({ selectedItemIndex: index }),

  toggleParticipantForSelectedItem: (userId) => {
    set((state) => {
      const index = state.selectedItemIndex;
      if (index < 0 || index >= state.items.length) return state;
      const items = state.items.map((item, idx) => {
        if (idx !== index) return item;
        const assignedUserIds = item.assignedUserIds.includes(userId)
          ? item.assignedUserIds.filter((id) => id !== userId)
          : [...item.assignedUserIds, userId];
        return { ...item, assignedUserIds };
      });
      return { items };
    });
  },

  setSplitMode: (mode) => set({ splitMode: mode }),

  toggleFriendSelected: (userId) => {
    set((state) => ({
      selectedFriendIds: state.selectedFriendIds.includes(userId)
        ? state.selectedFriendIds.filter((id) => id !== userId)
        : [...state.selectedFriendIds, userId],
    }));
  },

  setPercentage: (userId, pct) => {
    set((state) => ({ percentages: { ...state.percentages, [userId]: pct } }));
  },

  submit: async (currentUserId) => {
    const state = get();
    if (state.items.length === 0) throw new Error('Add at least one item');

    let shares = new Map<string, number>();
    const totalCents = state.items.reduce((sum, i) => sum + i.priceCents, 0);

    if (state.splitMode === 'item') {
      shares = computeItemShares(state.items, currentUserId);
    } else if (state.splitMode === 'equal') {
      if (state.selectedFriendIds.length === 0) throw new Error('Select at least one friend');
      const people = [currentUserId, ...state.selectedFriendIds];
      const parts = distributeRemainder(0, totalCents, people.length);
      people.forEach((userId, idx) => shares.set(userId, parts[idx]));
    } else {
      if (state.selectedFriendIds.length === 0) throw new Error('Select at least one friend');
      const people = [currentUserId, ...state.selectedFriendIds];
      const pctSum = people.reduce((sum, id) => sum + (state.percentages[id] ?? 0), 0);
      if (Math.round(pctSum) !== 100) throw new Error('Percentages must add up to 100%');
      let allocated = 0;
      people.forEach((userId, idx) => {
        const pct = state.percentages[userId] ?? 0;
        const cents = idx === people.length - 1 ? totalCents - allocated : Math.round((totalCents * pct) / 100);
        allocated += cents;
        shares.set(userId, cents);
      });
    }

    const friendIds = Array.from(shares.keys()).filter((id) => id !== currentUserId);
    if (friendIds.length === 0) throw new Error('Select at least one friend to request from');

    set({ submitting: true, error: null });
    try {
      const conversation = await api.post<{ id: string }>('/api/conversations', {
        participantUserIds: friendIds,
      });

      const message = await api.post<Message>(`/api/conversations/${conversation.id}/checks`, {
        title: state.title || 'Split',
        currency: 'USD',
        attachmentId: state.attachmentId,
        items: state.items.map((i) => ({ name: i.name, priceCents: i.priceCents })),
        participants: Array.from(shares.entries()).map(([userId, shareCents]) => ({ userId, shareCents })),
      });
      return message;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create split';
      set({ error: message });
      throw err;
    } finally {
      set({ submitting: false });
    }
  },

  reset: () =>
    set({
      title: '',
      attachmentId: null,
      items: [],
      selectedItemIndex: 0,
      splitMode: 'item',
      selectedFriendIds: [],
      percentages: {},
      error: null,
    }),
}));
