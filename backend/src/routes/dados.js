import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';

const router = Router();

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DOC_BYTES = 64 * 1024;
const MAX_IMPORT_DAYS = 3000;
const MAX_USER_BYTES = 5 * 1024 * 1024;

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String(req.userId),
  message: { error: 'too many attempts, please try again later' },
});

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function byteSize(value) {
  return Buffer.byteLength(JSON.stringify(value));
}

function isTooBig(value) {
  return byteSize(value) > MAX_DOC_BYTES;
}

function isRealDate(value) {
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function storedDayBytes(userId, exceptDate = '') {
  const [{ total }] = await prisma.$queryRaw`
    SELECT COALESCE(SUM(octet_length("conteudo"::text)), 0)::int AS total
    FROM "Dia"
    WHERE "userId" = ${userId} AND "data" <> ${exceptDate}`;
  return total;
}

function isValidConfig(config) {
  return isObject(config) && Array.isArray(config.pontos) && !isTooBig(config);
}

function isValidDay(day, date) {
  return isObject(day) && isRealDate(day.data) && (date === undefined || day.data === date) && !isTooBig(day);
}

router.get('/', async (req, res) => {
  const [user, days] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.userId }, select: { config: true } }),
    prisma.dia.findMany({ where: { userId: req.userId }, orderBy: { data: 'asc' } }),
  ]);
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  res.json({ config: user.config ?? null, dias: days.map((day) => day.conteudo) });
});

router.put('/config', writeLimiter, async (req, res) => {
  if (!isValidConfig(req.body)) {
    return res.status(400).json({ error: 'invalid config' });
  }

  await prisma.user.update({ where: { id: req.userId }, data: { config: req.body } });
  res.status(204).end();
});

router.put('/dias/:data', writeLimiter, async (req, res) => {
  const { data } = req.params;
  if (!isRealDate(data) || !isValidDay(req.body, data)) {
    return res.status(400).json({ error: 'invalid day' });
  }
  if ((await storedDayBytes(req.userId, data)) + byteSize(req.body) > MAX_USER_BYTES) {
    return res.status(413).json({ error: 'storage quota exceeded' });
  }

  await prisma.dia.upsert({
    where: { userId_data: { userId: req.userId, data } },
    create: { userId: req.userId, data, conteudo: req.body },
    update: { conteudo: req.body },
  });
  res.status(204).end();
});

router.delete('/dias/:data', writeLimiter, async (req, res) => {
  const { data } = req.params;
  if (!DATE_REGEX.test(data)) {
    return res.status(400).json({ error: 'invalid day' });
  }

  await prisma.dia.deleteMany({ where: { userId: req.userId, data } });
  res.status(204).end();
});

router.post('/importar', writeLimiter, async (req, res) => {
  const { config, dias } = req.body ?? {};
  if (config !== undefined && config !== null && !isValidConfig(config)) {
    return res.status(400).json({ error: 'invalid config' });
  }
  if (!Array.isArray(dias) || dias.length > MAX_IMPORT_DAYS || !dias.every((day) => isValidDay(day))) {
    return res.status(400).json({ error: 'invalid days' });
  }
  const importedBytes = dias.reduce((total, day) => total + byteSize(day), 0);
  if ((await storedDayBytes(req.userId)) + importedBytes > MAX_USER_BYTES) {
    return res.status(413).json({ error: 'storage quota exceeded' });
  }

  await prisma.$transaction([
    ...(config ? [prisma.user.update({ where: { id: req.userId }, data: { config } })] : []),
    ...dias.map((day) =>
      prisma.dia.upsert({
        where: { userId_data: { userId: req.userId, data: day.data } },
        create: { userId: req.userId, data: day.data, conteudo: day },
        update: { conteudo: day },
      }),
    ),
  ]);
  res.json({ importados: dias.length });
});

export default router;
