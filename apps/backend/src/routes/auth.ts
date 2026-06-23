import { Router } from 'express';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { signupSchema, loginSchema, googleAuthSchema, refreshSchema, type AuthResult } from '@splitcheck/core';
import { db } from '../db/client';
import { users } from '../db/schema';
import { issueTokens, verifyRefreshToken } from '../auth/jwt';
import { HttpError } from '../errors';
import { requireAuth } from '../middleware/auth';
import { env } from '../env';
import { toPublicUser } from '../dto';

export const authRouter = Router();

type UserRow = typeof users.$inferSelect;

const AVATAR_COLORS = ['#6750A4', '#7D5260', '#386A20', '#B3261E', '#1D6C8C', '#9C5700'];
function colorForEmail(email: string): string {
  const sum = email.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
}

async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}

async function findUserById(id: string): Promise<UserRow | undefined> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

async function findUserByGoogleSub(googleSub: string): Promise<UserRow | undefined> {
  const rows = await db.select().from(users).where(eq(users.googleSub, googleSub)).limit(1);
  return rows[0];
}

authRouter.post('/signup', async (req, res) => {
  const input = signupSchema.parse(req.body);

  const existing = await findUserByEmail(input.email);
  if (existing) throw new HttpError(409, 'An account with this email already exists');

  const passwordHash = await bcrypt.hash(input.password, 10);
  const [row] = await db
    .insert(users)
    .values({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
      avatarColor: colorForEmail(input.email),
    })
    .returning();

  const result: AuthResult = { user: toPublicUser(row), tokens: issueTokens(row.id) };
  res.status(201).json(result);
});

authRouter.post('/login', async (req, res) => {
  const input = loginSchema.parse(req.body);

  const row = await findUserByEmail(input.email);
  if (!row || !row.passwordHash) throw new HttpError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(input.password, row.passwordHash);
  if (!valid) throw new HttpError(401, 'Invalid email or password');

  const result: AuthResult = { user: toPublicUser(row), tokens: issueTokens(row.id) };
  res.json(result);
});

const googleClient = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null;

authRouter.post('/google', async (req, res) => {
  if (!googleClient) throw new HttpError(500, 'Google sign-in is not configured on this server');
  const input = googleAuthSchema.parse(req.body);

  const ticket = await googleClient.verifyIdToken({ idToken: input.idToken, audience: env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.sub) throw new HttpError(401, 'Invalid Google token');

  let row = await findUserByGoogleSub(payload.sub);

  if (!row) {
    const byEmail = await findUserByEmail(payload.email);
    if (byEmail) {
      const [updated] = await db
        .update(users)
        .set({ googleSub: payload.sub })
        .where(eq(users.id, byEmail.id))
        .returning();
      row = updated;
    }
  }

  if (!row) {
    const [created] = await db
      .insert(users)
      .values({
        email: payload.email,
        googleSub: payload.sub,
        displayName: payload.name ?? payload.email.split('@')[0],
        avatarColor: colorForEmail(payload.email),
      })
      .returning();
    row = created;
  }

  const result: AuthResult = { user: toPublicUser(row), tokens: issueTokens(row.id) };
  res.json(result);
});

authRouter.post('/refresh', async (req, res) => {
  const input = refreshSchema.parse(req.body);

  let userId: string;
  try {
    userId = verifyRefreshToken(input.refreshToken);
  } catch {
    throw new HttpError(401, 'Invalid refresh token');
  }

  const row = await findUserById(userId);
  if (!row) throw new HttpError(401, 'Invalid refresh token');

  res.json(issueTokens(row.id));
});

authRouter.post('/logout', (_req, res) => {
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const row = await findUserById(req.userId!);
  if (!row) throw new HttpError(404, 'User not found');
  res.json(toPublicUser(row));
});
