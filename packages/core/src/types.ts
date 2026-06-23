export type MessageType = 'TEXT' | 'RECEIPT' | 'SPLIT_REQUEST';

export type CheckParticipantStatus = 'PENDING' | 'PAID' | 'DECLINED';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarColor: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface Conversation {
  id: string;
  title: string | null;
  participants: User[];
  lastMessage: Message | null;
  createdAt: string;
}

export interface Attachment {
  id: string;
  url: string;
  mimeType: string;
  originalName: string;
}

export interface CheckItem {
  id: string;
  name: string;
  priceCents: number;
}

export interface CheckParticipant {
  id: string;
  user: User;
  shareCents: number;
  status: CheckParticipantStatus;
  respondedAt: string | null;
}

export interface Check {
  id: string;
  conversationId: string;
  createdBy: User;
  title: string;
  totalAmountCents: number;
  currency: string;
  attachment: Attachment | null;
  items: CheckItem[];
  participants: CheckParticipant[];
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  type: MessageType;
  body: string | null;
  attachment: Attachment | null;
  check: Check | null;
  createdAt: string;
}

export interface ExtractedReceiptItem {
  name: string;
  priceCents: number;
}

export interface ExtractedReceipt {
  merchant: string | null;
  items: ExtractedReceiptItem[];
  totalCents: number | null;
}
