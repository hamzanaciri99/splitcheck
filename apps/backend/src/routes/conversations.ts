import { Router } from 'express';
import { and, desc, eq, inArray, lt } from 'drizzle-orm';
import { createConversationSchema, createMessageSchema, type Conversation } from '@splitcheck/core';
import { db } from '../db/client';
import { attachments, conversationParticipants, conversations, messages, users } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { HttpError } from '../errors';
import { toPublicUser, buildMessageDto } from '../dto';
import { emitToConversation } from '../realtime/socket';
import { upload } from '../upload';
import { extractReceiptItems } from '../receiptExtraction';

export const conversationsRouter = Router();
conversationsRouter.use(requireAuth);

async function assertParticipant(conversationId: string, userId: string): Promise<void> {
  const rows = await db
    .select()
    .from(conversationParticipants)
    .where(
      and(eq(conversationParticipants.conversationId, conversationId), eq(conversationParticipants.userId, userId))
    )
    .limit(1);
  if (rows.length === 0) throw new HttpError(403, 'You are not part of this conversation');
}

async function buildConversationDto(conversationId: string): Promise<Conversation> {
  const [row] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  if (!row) throw new HttpError(404, 'Conversation not found');

  const participantRows = await db
    .select()
    .from(conversationParticipants)
    .where(eq(conversationParticipants.conversationId, conversationId));
  const participantUsers = participantRows.length
    ? await db.select().from(users).where(inArray(users.id, participantRows.map((p) => p.userId)))
    : [];

  const [lastMessageRow] = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(1);

  return {
    id: row.id,
    title: row.title,
    participants: participantUsers.map(toPublicUser),
    lastMessage: lastMessageRow ? await buildMessageDto(lastMessageRow) : null,
    createdAt: row.createdAt.toISOString(),
  };
}

conversationsRouter.get('/', async (req, res) => {
  const mine = await db
    .select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, req.userId!));

  const dtos = await Promise.all(mine.map((c) => buildConversationDto(c.conversationId)));
  dtos.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt ?? a.createdAt;
    const bTime = b.lastMessage?.createdAt ?? b.createdAt;
    return bTime.localeCompare(aTime);
  });
  res.json(dtos);
});

conversationsRouter.post('/', async (req, res) => {
  const input = createConversationSchema.parse(req.body);
  const participantIds = Array.from(new Set([req.userId!, ...input.participantUserIds]));

  const foundUsers = await db.select().from(users).where(inArray(users.id, participantIds));
  if (foundUsers.length !== participantIds.length) {
    throw new HttpError(400, 'One or more participants do not exist');
  }

  const [conversation] = await db
    .insert(conversations)
    .values({ title: input.title ?? null })
    .returning();
  await db
    .insert(conversationParticipants)
    .values(participantIds.map((userId) => ({ conversationId: conversation.id, userId })));

  res.status(201).json(await buildConversationDto(conversation.id));
});

conversationsRouter.get('/:id/messages', async (req, res) => {
  const conversationId = req.params.id;
  await assertParticipant(conversationId, req.userId!);

  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = typeof req.query.before === 'string' ? new Date(req.query.before) : null;

  const rows = await db
    .select()
    .from(messages)
    .where(
      before
        ? and(eq(messages.conversationId, conversationId), lt(messages.createdAt, before))
        : eq(messages.conversationId, conversationId)
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  const dtos = await Promise.all(rows.map(buildMessageDto));
  res.json(dtos.reverse());
});

conversationsRouter.post('/:id/messages', async (req, res) => {
  const conversationId = req.params.id;
  await assertParticipant(conversationId, req.userId!);
  const input = createMessageSchema.parse(req.body);

  const [row] = await db
    .insert(messages)
    .values({ conversationId, senderId: req.userId!, type: 'TEXT', body: input.body })
    .returning();

  const dto = await buildMessageDto(row);
  await emitToConversation(conversationId, 'message:new', dto);
  res.status(201).json(dto);
});

conversationsRouter.post('/:id/attachments', upload.single('file'), async (req, res) => {
  const conversationId = req.params.id as string;
  await assertParticipant(conversationId, req.userId!);
  if (!req.file) throw new HttpError(400, 'No file uploaded');

  const [attachment] = await db
    .insert(attachments)
    .values({
      url: `/uploads/${req.file.filename}`,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
    })
    .returning();

  const [messageRow] = await db
    .insert(messages)
    .values({ conversationId, senderId: req.userId!, type: 'RECEIPT', attachmentId: attachment.id })
    .returning();

  const dto = await buildMessageDto(messageRow);
  await emitToConversation(conversationId, 'message:new', dto);

  const extracted = await extractReceiptItems(req.file.path, req.file.mimetype).catch((err) => {
    console.error('Receipt extraction failed:', err);
    return null;
  });

  res.status(201).json({ message: dto, extracted });
});
