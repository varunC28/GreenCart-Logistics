import { Router } from 'express';
import { prisma } from '../db/prisma';
import { z } from 'zod';

const router = Router();

const driverSchema = z.object({
  name: z.string().min(1),
  currentShiftHours: z.number().int().min(0).optional(),
  past7DayHours: z.array(z.number().int().min(0)).optional(),
});

router.get('/', async (_req, res) => {
  const drivers = await prisma.driver.findMany();
  res.json(drivers);
});

router.post('/', async (req, res) => {
  const parsed = driverSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const driver = await prisma.driver.create({ data: parsed.data });
  res.status(201).json(driver);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) return res.status(404).json({ error: 'Not found' });
  res.json(driver);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = driverSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const driver = await prisma.driver.update({ where: { id }, data: parsed.data });
    res.json(driver);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.driver.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

export default router;
