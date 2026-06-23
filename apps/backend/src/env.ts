import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().optional(),
  UPLOADS_DIR: z.string().default('./uploads'),
  ANTHROPIC_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
  SENTRY_DSN: z.string().optional(),
  NODE_ENV: z.string().default('development'),
});

export const env = envSchema.parse(process.env);
