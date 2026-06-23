import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { users } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { toPublicUser } from '../dto';
import { HttpError } from '../errors';

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.get('/search', async (req, res) => {
  const email = String(req.query.email ?? '')
    .trim()
    .toLowerCase();
  if (!email) throw new HttpError(400, 'email query param is required');

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const row = rows[0];
  if (!row || row.id === req.userId) {
    res.json({ user: null });
    return;
  }
  res.json({ user: toPublicUser(row) });
});
