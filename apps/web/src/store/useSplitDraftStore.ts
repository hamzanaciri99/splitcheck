import { create } from 'zustand';
import type { Message, User } from '@splitcheck/core';
import { api } from '../api/client';

export type DraftItem = {
  id: string;
  name: string;
  priceCents: number;
  assignedUserIds: string[];
};

type InitParams = {
  conversationId: string;
  title: string;
  participants: User[];
  items?: { name: string; priceCents: number }[];
  attachmentId?: string | null;
};

type SplitDraftState = {
  conversationId: string | null;
  title: string;
  participants: User[];
  items: DraftItem[];
  selectedItemIndex: number;
  attachmentId: string | null;
  submitting: boolean;
  error: string | null;
  initDraft: (params: InitParams) => void;
  setTitle: (title: string) => void;
  addItem: (name: string, priceCents: number) => void;
  removeItem: (index: number) => void;
  selectItem: (index: number) => void;
  toggleParticipantForSelectedItem: (userId: string) => void;
  submit: () => Promise<Message>;
  reset: () => void;
};

let nextId = 0;
function makeItemId(): string {
  nextId += 1;
  return `draft-${Date.now()}-${nextId}`;
}

function computeShares(items: DraftItem[]): Map<string, number> {
  const shares = new Map<string, number>();
  for (const item of items) {
    const n = item.assignedUserIds.length;
    if (n === 0) continue;
    const base = Math.floor(item.priceCents / n);
    const remainder = item.priceCents - base * n;
    item.assignedUserIds.forEach((userId, idx) => {
      const extra = idx < remainder ? 1 : 0;
      shares.set(userId, (shares.get(userId) ?? 0) + base + extra);
    });
  }
  return shares;
}

export const useSplitDraftStore = create<SplitDraftState>((set, get) => ({
  conversationId: null,
  title: '',
  participants: [],
  items: [],
  selectedItemIndex: 0,
  attachmentId: null,
  submitting: false,
  error: null,

  initDraft: ({ conversationId, title, participants, items, attachmentId }) => {
    set({
      conversationId,
      title,
      participants,
      attachmentId: attachmentId ?? null,
      items: (items ?? []).map((i) => ({ id: makeItemId(), name: i.name, priceCents: i.priceCents, assignedUserIds: [] })),
      selectedItemIndex: 0,
      error: null,
    });
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

  submit: async () => {
    const state = get();
    if (!state.conversationId) throw new Error('No conversation selected');
    if (state.items.length === 0) throw new Error('Add at least one item');
    if (state.items.some((i) => i.assignedUserIds.length === 0)) {
      throw new Error('Every item must be assigned to at least one person');
    }

    const shares = computeShares(state.items);

    set({ submitting: true, error: null });
    try {
      const message = await api.post<Message>(`/api/conversations/${state.conversationId}/checks`, {
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
      conversationId: null,
      title: '',
      participants: [],
      items: [],
      selectedItemIndex: 0,
      attachmentId: null,
      error: null,
    }),
}));
