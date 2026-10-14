import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

const router = Router();

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const MAX_DOC_BYTES = 64 * 1024;
const MAX_IMPORT_DAYS = 3000;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isTooBig(value) {
  return Buffer.byteLength(JSON.stringify(value)) > MAX_DOC_BYTES;
}

function isValidConfig(config) {
  return isObject(config) && Array.isArray(config.pontos) && !isTooBig(config);
}

function isValidDay(day, date) {
  return isObject(day) && DATE_REGEX.test(day.data) && (date === undefined || day.data === date) && !isTooBig(day);
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

router.put('/config', async (req, res) => {
  if (!isValidConfig(req.body)) {
    return res.status(400).json({ error: 'invalid config' });
  }

  await prisma.user.update({ where: { id: req.userId }, data: { config: req.body } });
  res.status(204).end();
});

router.put('/dias/:data', async (req, res) => {
  const { data } = req.params;
  if (!DATE_REGEX.test(data) || !isValidDay(req.body, data)) {
    return res.status(400).json({ error: 'invalid day' });
  }

  await prisma.dia.upsert({
    where: { userId_data: { userId: req.userId, data } },
    create: { userId: req.userId, data, conteudo: req.body },
    update: { conteudo: req.body },
  });
  res.status(204).end();
});

router.delete('/dias/:data', async (req, res) => {
  const { data } = req.params;
  if (!DATE_REGEX.test(data)) {
    return res.status(400).json({ error: 'invalid day' });
  }

  await prisma.dia.deleteMany({ where: { userId: req.userId, data } });
  res.status(204).end();
});

router.post('/importar', async (req, res) => {
  const { config, dias } = req.body ?? {};
  if (config !== undefined && config !== null && !isValidConfig(config)) {
    return res.status(400).json({ error: 'invalid config' });
  }
  if (!Array.isArray(dias) || dias.length > MAX_IMPORT_DAYS || !dias.every((day) => isValidDay(day))) {
    return res.status(400).json({ error: 'invalid days' });
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
