import './instrument';

import http from 'http';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import { env } from './env';
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { conversationsRouter } from './routes/conversations';
import { checksRouter } from './routes/checks';
import { errorHandler } from './middleware/error';
import { initSocket } from './realtime/socket';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve(env.UPLOADS_DIR)));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api', checksRouter);

Sentry.setupExpressErrorHandler(app);
app.use(errorHandler);

const httpServer = http.createServer(app);
initSocket(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`SplitCheck API listening on port ${env.PORT}`);
});
