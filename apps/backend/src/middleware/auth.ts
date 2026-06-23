import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../auth/jwt';
import { HttpError } from '../errors';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next(new HttpError(401, 'Missing access token'));
    return;
  }
  try {
    req.userId = verifyAccessToken(header.slice('Bearer '.length));
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired access token'));
  }
};
