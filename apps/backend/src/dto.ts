import { eq, inArray } from 'drizzle-orm';
import type { Attachment, Check, Message, User } from '@splitcheck/core';
import { db } from './db/client';
import { attachments, checkItems, checkParticipants, checks, messages, users } from './db/schema';
import { HttpError } from './errors';

type UserRow = typeof users.$inferSelect;
type AttachmentRow = typeof attachments.$inferSelect;
type MessageRow = typeof messages.$inferSelect;

export function toPublicUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    avatarColor: row.avatarColor,
    createdAt: row.createdAt.toISOString(),
  };
}

export function toAttachmentDto(row: AttachmentRow): Attachment {
  return { id: row.id, url: row.url, mimeType: row.mimeType, originalName: row.originalName };
}

export async function buildCheckDto(checkId: string): Promise<Check> {
  const [checkRow] = await db.select().from(checks).where(eq(checks.id, checkId)).limit(1);
  if (!checkRow) throw new HttpError(404, 'Check not found');

  const [creatorRow] = await db.select().from(users).where(eq(users.id, checkRow.createdBy)).limit(1);

  const itemRows = await db.select().from(checkItems).where(eq(checkItems.checkId, checkId));
  const participantRows = await db.select().from(checkParticipants).where(eq(checkParticipants.checkId, checkId));

  const participantUserRows = participantRows.length
    ? await db.select().from(users).where(inArray(users.id, participantRows.map((p) => p.userId)))
    : [];
  const userById = new Map(participantUserRows.map((u) => [u.id, u]));

  let attachment: Attachment | null = null;
  if (checkRow.attachmentId) {
    const [a] = await db.select().from(attachments).where(eq(attachments.id, checkRow.attachmentId)).limit(1);
    if (a) attachment = toAttachmentDto(a);
  }

  return {
    id: checkRow.id,
    conversationId: checkRow.conversationId,
    createdBy: toPublicUser(creatorRow),
    title: checkRow.title,
    totalAmountCents: checkRow.totalAmountCents,
    currency: checkRow.currency,
    attachment,
    items: itemRows.map((i) => ({ id: i.id, name: i.name, priceCents: i.priceCents })),
    participants: participantRows.map((p) => ({
      id: p.id,
      user: toPublicUser(userById.get(p.userId)!),
      shareCents: p.shareCents,
      status: p.status,
      respondedAt: p.respondedAt ? p.respondedAt.toISOString() : null,
    })),
    createdAt: checkRow.createdAt.toISOString(),
  };
}

export async function buildMessageDto(row: MessageRow): Promise<Message> {
  const [senderRow] = await db.select().from(users).where(eq(users.id, row.senderId)).limit(1);

  let attachment: Attachment | null = null;
  if (row.attachmentId) {
    const [a] = await db.select().from(attachments).where(eq(attachments.id, row.attachmentId)).limit(1);
    if (a) attachment = toAttachmentDto(a);
  }

  const check = row.checkId ? await buildCheckDto(row.checkId) : null;

  return {
    id: row.id,
    conversationId: row.conversationId,
    sender: toPublicUser(senderRow),
    type: row.type,
    body: row.body,
    attachment,
    check,
    createdAt: row.createdAt.toISOString(),
  };
}
