import { Router } from 'express';
import { prisma } from '../db/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
  }
  const { email, password } = parsed.data;
  const manager = await prisma.manager.findUnique({ where: { email } });
  if (!manager) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, manager.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: manager.id, email: manager.email }, env.JWT_SECRET, { expiresIn: '12h' });
  res.json({ token });
});

export default router;
