import { Router } from 'express';
import { and, eq } from 'drizzle-orm';
import { createCheckSchema, respondCheckSchema, rowsToCsv } from '@splitcheck/core';
import { db } from '../db/client';
import { checkItems, checkParticipants, checks, conversationParticipants, messages } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { HttpError } from '../errors';
import { buildCheckDto, buildMessageDto } from '../dto';
import { emitToConversation } from '../realtime/socket';

export const checksRouter = Router();
checksRouter.use(requireAuth);

checksRouter.post('/conversations/:id/checks', async (req, res) => {
  const conversationId = req.params.id;
  const userId = req.userId!;

  const participantRows = await db
    .select()
    .from(conversationParticipants)
    .where(eq(conversationParticipants.conversationId, conversationId));
  const participantUserIds = new Set(participantRows.map((p) => p.userId));
  if (!participantUserIds.has(userId)) throw new HttpError(403, 'You are not part of this conversation');

  const input = createCheckSchema.parse(req.body);

  for (const p of input.participants) {
    if (!participantUserIds.has(p.userId)) {
      throw new HttpError(400, 'All split participants must be part of the conversation');
    }
  }

  const totalAmountCents = input.items.reduce((sum, i) => sum + i.priceCents, 0);
  const totalShareCents = input.participants.reduce((sum, p) => sum + p.shareCents, 0);
  if (totalShareCents !== totalAmountCents) {
    throw new HttpError(400, 'Participant shares must add up to the items total');
  }

  const [checkRow] = await db
    .insert(checks)
    .values({
      conversationId,
      createdBy: userId,
      title: input.title,
      totalAmountCents,
      currency: input.currency,
      attachmentId: input.attachmentId ?? null,
    })
    .returning();

  await db
    .insert(checkItems)
    .values(input.items.map((i) => ({ checkId: checkRow.id, name: i.name, priceCents: i.priceCents })));
  await db
    .insert(checkParticipants)
    .values(input.participants.map((p) => ({ checkId: checkRow.id, userId: p.userId, shareCents: p.shareCents })));

  const [messageRow] = await db
    .insert(messages)
    .values({ conversationId, senderId: userId, type: 'SPLIT_REQUEST', checkId: checkRow.id })
    .returning();

  const messageDto = await buildMessageDto(messageRow);
  await emitToConversation(conversationId, 'message:new', messageDto);

  res.status(201).json(messageDto);
});

checksRouter.patch('/checks/:id/respond', async (req, res) => {
  const checkId = req.params.id;
  const userId = req.userId!;
  const input = respondCheckSchema.parse(req.body);

  const [participantRow] = await db
    .select()
    .from(checkParticipants)
    .where(and(eq(checkParticipants.checkId, checkId), eq(checkParticipants.userId, userId)))
    .limit(1);
  if (!participantRow) throw new HttpError(403, 'You are not a participant on this check');

  await db
    .update(checkParticipants)
    .set({ status: input.status, respondedAt: new Date() })
    .where(eq(checkParticipants.id, participantRow.id));

  const [checkRow] = await db.select().from(checks).where(eq(checks.id, checkId)).limit(1);
  const dto = await buildCheckDto(checkId);
  await emitToConversation(checkRow.conversationId, 'check:updated', dto);

  res.json(dto);
});

checksRouter.get('/checks/export.csv', async (req, res) => {
  const userId = req.userId!;

  const rows = await db
    .select({
      title: checks.title,
      currency: checks.currency,
      createdAt: checks.createdAt,
      conversationId: checks.conversationId,
      shareCents: checkParticipants.shareCents,
      status: checkParticipants.status,
      respondedAt: checkParticipants.respondedAt,
    })
    .from(checkParticipants)
    .innerJoin(checks, eq(checkParticipants.checkId, checks.id))
    .where(eq(checkParticipants.userId, userId));

  const csvRows = rows.map((r) => [
    r.createdAt.toISOString().slice(0, 10),
    r.conversationId,
    r.title,
    (r.shareCents / 100).toFixed(2),
    r.currency,
    r.status,
    r.respondedAt ? r.respondedAt.toISOString().slice(0, 10) : '',
  ]);

  const csv = rowsToCsv(
    ['Date', 'Conversation', 'Check', 'Your Share', 'Currency', 'Status', 'Responded At'],
    csvRows
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="splitcheck-history.csv"');
  res.send(csv);
});
