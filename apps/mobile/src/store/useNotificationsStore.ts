import { create } from 'zustand';
import type { Check } from '@splitcheck/core';
import { formatCurrencyCents } from '@splitcheck/core';
import { api } from '@/api/client';

export type AppNotification = {
  id: string;
  text: string;
  conversationId: string;
  timestamp: string;
};

function deriveNotifications(checks: Check[], currentUserId: string): AppNotification[] {
  const notifications: AppNotification[] = [];

  for (const check of checks) {
    const amIOwner = check.createdBy.id === currentUserId;

    if (amIOwner) {
      for (const p of check.participants) {
        if (p.user.id === currentUserId || !p.respondedAt) continue;
        if (p.status === 'PAID') {
          notifications.push({
            id: `${check.id}-${p.id}-paid`,
            text: `${p.user.displayName} marked "${check.title}" as settled`,
            conversationId: check.conversationId,
            timestamp: p.respondedAt,
          });
        } else if (p.status === 'DECLINED') {
          notifications.push({
            id: `${check.id}-${p.id}-declined`,
            text: `${p.user.displayName} declined "${check.title}"`,
            conversationId: check.conversationId,
            timestamp: p.respondedAt,
          });
        }
      }
    } else {
      const mine = check.participants.find((p) => p.user.id === currentUserId);
      if (mine && mine.status === 'PENDING') {
        notifications.push({
          id: `${check.id}-request`,
          text: `${check.createdBy.displayName} is asking for ${formatCurrencyCents(
            mine.shareCents,
            check.currency
          )} for "${check.title}"`,
          conversationId: check.conversationId,
          timestamp: check.createdAt,
        });
      }
    }
  }

  return notifications.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

type NotificationsState = {
  notifications: AppNotification[];
  loading: boolean;
  refresh: (currentUserId: string) => Promise<void>;
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  loading: false,

  refresh: async (currentUserId: string) => {
    set({ loading: true });
    try {
      const checks = await api.get<Check[]>('/api/checks/mine');
      set({ notifications: deriveNotifications(checks, currentUserId) });
    } finally {
      set({ loading: false });
    }
  },
}));
