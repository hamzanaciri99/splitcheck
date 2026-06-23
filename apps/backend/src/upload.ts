import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import multer from 'multer';
import { env } from './env';
import { HttpError } from './errors';

fs.mkdirSync(env.UPLOADS_DIR, { recursive: true });

export const upload = multer({
  storage: multer.diskStorage({
    destination: env.UPLOADS_DIR,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      cb(null, `${randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new HttpError(400, 'Only image uploads are allowed'));
      return;
    }
    cb(null, true);
  },
});
