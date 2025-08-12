import { Router } from 'express';
import { prisma } from '../db/prisma';
import { z } from 'zod';

const router = Router();

const orderSchema = z.object({
  orderId: z.string().min(1),
  valueRs: z.number().int().nonnegative(),
  assignedRouteId: z.number().int().optional(),
  deliveryTimestamp: z.string().datetime().optional(),
});

router.get('/', async (_req, res) => {
  const orders = await prisma.order.findMany({ include: { assignedRoute: true } });
  res.json(orders);
});

router.post('/', async (req, res) => {
  const parsed = orderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { deliveryTimestamp, ...rest } = parsed.data as any;
  const order = await prisma.order.create({
    data: {
      ...rest,
      deliveryTimestamp: deliveryTimestamp ? new Date(deliveryTimestamp) : null,
    },
  });
  res.status(201).json(order);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const order = await prisma.order.findUnique({ where: { id }, include: { assignedRoute: true } });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = orderSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { deliveryTimestamp, ...rest } = parsed.data as any;
  try {
    const order = await prisma.order.update({
      where: { id },
      data: {
        ...rest,
        deliveryTimestamp: deliveryTimestamp ? new Date(deliveryTimestamp) : undefined,
      },
    });
    res.json(order);
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.order.delete({ where: { id } });
    res.status(204).end();
  } catch {
    res.status(404).json({ error: 'Not found' });
  }
});

export default router;
