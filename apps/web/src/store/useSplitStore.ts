import { create } from 'zustand';
import type { ActivityReceipt, Check } from '@splitcheck/core';
import { api } from '../api/client';

export type DashboardState = {
  owedToYou: number;
  youOwe: number;
  totalBalance: number;
  receipts: ActivityReceipt[];
};

type SplitStore = {
  dashboard: DashboardState;
  refreshDashboard: (currentUserId: string) => Promise<void>;
};

function toActivityReceipt(check: Check, currentUserId: string): ActivityReceipt {
  const isSettled = check.participants.every((p) => p.status !== 'PENDING');
  const isMine = check.createdBy.id === currentUserId;
  return {
    id: check.id,
    title: check.title,
    date: new Date(check.createdAt).toLocaleDateString(),
    totalAmount: check.totalAmountCents / 100,
    payer: isMine ? 'You' : check.createdBy.displayName,
    isMine,
    isSettled,
  };
}

export const useSplitStore = create<SplitStore>((set) => ({
  dashboard: { owedToYou: 0, youOwe: 0, totalBalance: 0, receipts: [] },

  refreshDashboard: async (currentUserId: string) => {
    const checks = await api.get<Check[]>('/api/checks/mine');

    let owedToYou = 0;
    let youOwe = 0;

    for (const check of checks) {
      const amIOwner = check.createdBy.id === currentUserId;
      for (const p of check.participants) {
        if (p.status !== 'PENDING') continue;
        if (amIOwner && p.user.id !== currentUserId) {
          owedToYou += p.shareCents;
        } else if (!amIOwner && p.user.id === currentUserId) {
          youOwe += p.shareCents;
        }
      }
    }

    set({
      dashboard: {
        owedToYou: owedToYou / 100,
        youOwe: youOwe / 100,
        totalBalance: (owedToYou - youOwe) / 100,
        receipts: checks.map((c) => toActivityReceipt(c, currentUserId)),
      },
    });
  },
}));
