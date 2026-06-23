import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './env';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/error';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`SplitCheck API listening on port ${env.PORT}`);
});
