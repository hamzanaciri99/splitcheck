import { pgTable, text, integer, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { randomUUID } from 'crypto';

const id = () =>
  text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID());

export const messageTypeEnum = pgEnum('message_type', ['TEXT', 'RECEIPT', 'SPLIT_REQUEST']);
export const checkParticipantStatusEnum = pgEnum('check_participant_status', ['PENDING', 'PAID', 'DECLINED']);

export const users = pgTable('users', {
  id: id(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  googleSub: text('google_sub').unique(),
  displayName: text('display_name').notNull(),
  avatarColor: text('avatar_color').notNull().default('#6750A4'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const conversations = pgTable('conversations', {
  id: id(),
  title: text('title'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const conversationParticipants = pgTable('conversation_participants', {
  id: id(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const attachments = pgTable('attachments', {
  id: id(),
  url: text('url').notNull(),
  mimeType: text('mime_type').notNull(),
  originalName: text('original_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const checks = pgTable('checks', {
  id: id(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id),
  title: text('title').notNull(),
  totalAmountCents: integer('total_amount_cents').notNull(),
  currency: text('currency').notNull().default('USD'),
  attachmentId: text('attachment_id').references(() => attachments.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const checkItems = pgTable('check_items', {
  id: id(),
  checkId: text('check_id')
    .notNull()
    .references(() => checks.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  priceCents: integer('price_cents').notNull(),
});

export const checkParticipants = pgTable('check_participants', {
  id: id(),
  checkId: text('check_id')
    .notNull()
    .references(() => checks.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  shareCents: integer('share_cents').notNull(),
  status: checkParticipantStatusEnum('status').notNull().default('PENDING'),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
});

export const messages = pgTable('messages', {
  id: id(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('sender_id')
    .notNull()
    .references(() => users.id),
  type: messageTypeEnum('type').notNull().default('TEXT'),
  body: text('body'),
  attachmentId: text('attachment_id').references(() => attachments.id),
  checkId: text('check_id').references(() => checks.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
