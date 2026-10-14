import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { Prisma } from '@prisma/client';
import authRoutes from './routes/auth.js';
import dadosRoutes from './routes/dados.js';
import { authMiddleware } from './middleware/auth.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set.');
  process.exit(1);
}

const allowedOrigins = (process.env.CORS_ORIGIN || 'https://hriel123.github.io')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '5mb' }));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/auth', authRoutes);
app.use('/dados', authMiddleware, dadosRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'payload too large' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'invalid json' });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'resource already exists' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'resource not found' });
    }
  }

  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
