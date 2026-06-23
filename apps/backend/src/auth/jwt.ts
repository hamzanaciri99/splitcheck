import jwt from 'jsonwebtoken';
import type { AuthTokens } from '@splitcheck/core';
import { env } from '../env';

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
}

export function verifyAccessToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
  if (typeof payload.sub !== 'string') throw new Error('Invalid token payload');
  return payload.sub;
}

export function verifyRefreshToken(token: string): string {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
  if (typeof payload.sub !== 'string') throw new Error('Invalid token payload');
  return payload.sub;
}

export function issueTokens(userId: string): AuthTokens {
  return { accessToken: signAccessToken(userId), refreshToken: signRefreshToken(userId) };
}
