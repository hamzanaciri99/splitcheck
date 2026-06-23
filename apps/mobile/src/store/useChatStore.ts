import { create } from 'zustand';
import type { Check, CheckParticipantStatus, Conversation, Message, User } from '@splitcheck/core';
import { SOCKET_EVENTS } from '@splitcheck/core';
import { api } from '@/api/client';
import { getSocket } from '@/api/socket';

type ChatState = {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  socketConnected: boolean;
  connectSocket: () => void;
  upsertMessage: (message: Message) => void;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, body: string) => Promise<void>;
  startConversation: (participantUserId: string) => Promise<Conversation>;
  respondToCheck: (checkId: string, status: Exclude<CheckParticipantStatus, 'PENDING'>) => Promise<void>;
};

function upsertConversationFromMessage(conversations: Conversation[], message: Message): Conversation[] {
  const idx = conversations.findIndex((c) => c.id === message.conversationId);
  if (idx === -1) return conversations;
  const updated = { ...conversations[idx], lastMessage: message };
  const rest = conversations.filter((_, i) => i !== idx);
  return [updated, ...rest];
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  socketConnected: false,

  connectSocket: () => {
    const socket = getSocket();
    if (socket.connected || get().socketConnected) return;

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, (message: Message) => {
      get().upsertMessage(message);
    });

    socket.on(SOCKET_EVENTS.CHECK_UPDATED, (check: Check) => {
      set((state) => {
        const next: Record<string, Message[]> = { ...state.messages };
        for (const conversationId of Object.keys(next)) {
          next[conversationId] = next[conversationId].map((m) =>
            m.check?.id === check.id ? { ...m, check } : m
          );
        }
        return { messages: next };
      });
    });

    socket.connect();
    set({ socketConnected: true });
  },

  upsertMessage: (message) => {
    set((state) => {
      const existing = state.messages[message.conversationId] ?? [];
      if (existing.some((m) => m.id === message.id)) return state;
      return {
        messages: { ...state.messages, [message.conversationId]: [...existing, message] },
        conversations: upsertConversationFromMessage(state.conversations, message),
      };
    });
  },

  loadConversations: async () => {
    const conversations = await api.get<Conversation[]>('/api/conversations');
    set({ conversations });
  },

  loadMessages: async (conversationId) => {
    const messages = await api.get<Message[]>(`/api/conversations/${conversationId}/messages`);
    set((state) => ({ messages: { ...state.messages, [conversationId]: messages } }));
  },

  sendMessage: async (conversationId, body) => {
    const message = await api.post<Message>(`/api/conversations/${conversationId}/messages`, { body });
    get().upsertMessage(message);
  },

  startConversation: async (participantUserId) => {
    const conversation = await api.post<Conversation>('/api/conversations', {
      participantUserIds: [participantUserId],
    });
    set((state) =>
      state.conversations.some((c) => c.id === conversation.id)
        ? state
        : { conversations: [conversation, ...state.conversations] }
    );
    return conversation;
  },

  respondToCheck: async (checkId, status) => {
    await api.patch(`/api/checks/${checkId}/respond`, { status });
  },
}));

export function otherParticipants(conversation: Conversation, currentUserId: string): User[] {
  return conversation.participants.filter((p) => p.id !== currentUserId);
}

export function conversationTitle(conversation: Conversation, currentUserId: string): string {
  if (conversation.title) return conversation.title;
  const others = otherParticipants(conversation, currentUserId);
  if (others.length === 0) return 'You';
  return others.map((u) => u.displayName).join(', ');
}
