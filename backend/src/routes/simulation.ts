import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { AssignmentInput, AssignmentResult, KpiResult, computeKpis, evaluateAssignment } from '../utils/kpi';

const router = Router();

const simSchema = z.object({
  numDrivers: z.number().int().positive(),
  routeStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  maxHoursPerDriver: z.number().int().positive(),
});

router.post('/', async (req, res) => {
  const parsed = simSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { numDrivers, routeStartTime, maxHoursPerDriver } = parsed.data;

  const allOrders = await prisma.order.findMany({ include: { assignedRoute: true } });
  const allDrivers = await prisma.driver.findMany();

  if (numDrivers > allDrivers.length) {
    return res.status(400).json({ error: 'numDrivers exceeds available drivers' });
  }

  const drivers = allDrivers.slice(0, numDrivers).map((d) => ({
    id: d.id,
    name: d.name,
    hoursUsed: 0,
    wasFatigued: (d.past7DayHours[d.past7DayHours.length - 1] || 0) > 8,
  }));

  const minutesPerHour = 60;
  const assignments: AssignmentResult[] = [];

  for (const order of allOrders) {
    if (!order.assignedRoute) continue;
    const available = drivers.find((dr) => dr.hoursUsed < maxHoursPerDriver);
    if (!available) break;

    const input: AssignmentInput = {
      orderId: order.orderId,
      valueRs: order.valueRs,
      route: {
        routeId: order.assignedRoute.routeId,
        distanceKm: order.assignedRoute.distanceKm,
        trafficLevel: (order.assignedRoute.trafficLevel as any) || 'Medium',
        baseTimeMinutes: order.assignedRoute.baseTimeMinutes,
      },
      driver: { id: available.id, wasFatigued: available.wasFatigued },
    };

    const result = evaluateAssignment(input);
    available.hoursUsed += Math.ceil(result.deliveryMinutes / minutesPerHour);
    assignments.push(result);
  }

  const kpis: KpiResult = computeKpis(assignments, allOrders.length);

  const sim = await prisma.simulationResult.create({
    data: {
      inputs: { numDrivers, routeStartTime, maxHoursPerDriver },
      metrics: kpis as any,
      assignments: {
        create: assignments.map((a) => ({
          order: { connect: { orderId: a.orderId } },
          driver: { connect: { id: a.driver.id } },
          onTime: a.onTime,
          fuelCost: a.fuelCost,
          penalty: a.penalty,
          bonus: a.bonus,
          profit: a.profit,
          deliveryMinutes: a.deliveryMinutes,
        })),
      },
    },
  });

  res.json({ simulationId: sim.id, ...kpis });
});

router.get('/history', async (_req, res) => {
  const sims = await prisma.simulationResult.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { assignments: true },
  });
  res.json(sims);
});

export default router;
