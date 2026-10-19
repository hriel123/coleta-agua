import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { escapeHtml, mailConfigured, sendMail } from '../lib/mail.js';

const router = Router();

// Used in place of a real password hash when no user is found, so login takes
// the same time whether or not the email is registered (avoids leaking
// account existence via response timing).
const DUMMY_HASH = bcrypt.hashSync('coleta-agua-timing-defense', 10);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too many attempts, please try again later' },
});

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too many attempts, please try again later' },
});

const RESET_MINUTES = 30;
const APP_URL = (process.env.APP_URL || 'https://coleta-agua.onrender.com').replace(/\/+$/, '');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

router.post('/register', authLimiter, async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'name, email and password are required' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters long' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return res.status(409).json({ error: 'email already registered' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: name.trim().slice(0, 80), email: normalizedEmail, password: hashedPassword },
  });

  res.status(201).json({ id: user.id, name: user.name, email: user.email });
});

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const validPassword = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !validPassword) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token });
});

// Always gives the same answer whether or not the account exists, so it does
// not reveal which emails are registered. The link lasts 30 minutes and works once.
router.post('/forgot', forgotLimiter, async (req, res) => {
  if (!mailConfigured) {
    return res.status(503).json({ error: 'email not configured' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'invalid email format' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString('base64url');
    await prisma.passwordReset.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + RESET_MINUTES * 60000) },
    });
    const link = `${APP_URL}/?redefinir=${token}`;
    const name = user.name.trim().split(/\s+/)[0];
    sendMail({
      to: user.email,
      subject: 'Redefinir sua senha do Coleta de Água',
      text: `Olá, ${name}.\n\nPara criar uma nova senha no Coleta de Água, abra o link abaixo. Ele vale ${RESET_MINUTES} minutos e só funciona uma vez.\n\n${link}\n\nSe você não pediu isso, ignore este e-mail: sua senha continua a mesma.`,
      html: `<p>Olá, ${escapeHtml(name)}.</p>
<p>Para criar uma nova senha no Coleta de Água, toque no botão abaixo. O link vale ${RESET_MINUTES} minutos e só funciona uma vez.</p>
<p><a href="${link}" style="display:inline-block;background:#0B7A96;color:#ffffff;padding:12px 22px;border-radius:12px;font-weight:700;text-decoration:none">Criar nova senha</a></p>
<p style="color:#666">Se o botão não abrir, copie este endereço no navegador:<br>${link}</p>
<p style="color:#666">Se você não pediu isso, ignore este e-mail: sua senha continua a mesma.</p>`,
    }).catch((err) => console.error('password reset email failed:', err.message));
  }

  res.json({ ok: true });
});

router.post('/reset', authLimiter, async (req, res) => {
  const { token, password } = req.body ?? {};

  if (typeof token !== 'string' || typeof password !== 'string' || !token) {
    return res.status(400).json({ error: 'token and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'password must be at least 6 characters long' });
  }

  const reset = await prisma.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    return res.status(400).json({ error: 'invalid or expired reset link' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { password: hashedPassword } }),
    prisma.passwordReset.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: new Date() } }),
  ]);

  const authToken = jwt.sign({ userId: reset.userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.json({ token: authToken });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    return res.status(404).json({ error: 'user not found' });
  }

  res.json({ id: user.id, name: user.name, email: user.email });
});

export default router;
