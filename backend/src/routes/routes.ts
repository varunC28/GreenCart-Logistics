import { Router } from 'express';
import { prisma } from '../db/prisma';
import { z } from 'zod';

const router = Router();

const routeSchema = z.object({
  routeId: z.string().min(1),
  distanceKm: z.number().positive(),
  trafficLevel: z.enum(['Low', 'Medium', 'High']).or(z.string()),
  baseTimeMinutes: z.number().int().positive(),
});

router.get('/', async (_req, res) => {
  const routes = await prisma.route.findMany();
  res.json(routes);
});

router.post('/', async (req, res) => {
  const parsed = routeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const route = await prisma.route.create({ data: parsed.data as any });
  res.status(201).json(route);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const route = await prisma.route.findUnique({ where: { id } });
  if (!route) return res.status(404).json({ error: 'Not found' });
  res.json(route);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = routeSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const route = await prisma.route.update({ where: { id }, data: parsed.data as any });
    res.json(route);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.route.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

export default router;
