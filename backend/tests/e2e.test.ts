// Ensure env for Neon before anything imports Prisma
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_pPFzgC0LaK6i@ep-solitary-pond-a1rfkjzi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
process.env.PORT = process.env.PORT || '4000';

import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/db/prisma';
import bcrypt from 'bcryptjs';

const TEST_EMAIL = process.env.SEED_MANAGER_EMAIL || 'admin@greencart.local';
const TEST_PASSWORD = process.env.SEED_MANAGER_PASSWORD || 'admin123';

describe('E2E API (Neon)', () => {
  jest.setTimeout(30000);
  let token: string = '';
  const createdIds: { routeId?: number; driverIds: number[]; orderIds: number[]; simulationId?: number } = { driverIds: [], orderIds: [] };

  beforeAll(async () => {
    // Ensure manager exists
    const existing = await prisma.manager.findUnique({ where: { email: TEST_EMAIL } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
      await prisma.manager.create({ data: { email: TEST_EMAIL, passwordHash } });
    }
  });

  afterAll(async () => {
    // Cleanup created records to avoid DB pollution
    try {
      if (createdIds.simulationId) {
        await prisma.assignment.deleteMany({ where: { simulationId: createdIds.simulationId } });
        await prisma.simulationResult.delete({ where: { id: createdIds.simulationId } }).catch(() => {});
      }
      if (createdIds.orderIds.length) await prisma.order.deleteMany({ where: { id: { in: createdIds.orderIds } } });
      if (createdIds.driverIds.length) await prisma.driver.deleteMany({ where: { id: { in: createdIds.driverIds } } });
      if (createdIds.routeId) await prisma.route.delete({ where: { id: createdIds.routeId } }).catch(() => {});
    } finally {
      await prisma.$disconnect();
    }
  });

  it('logs in and receives JWT', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
  });

  it('creates a route, drivers, and orders, then runs a simulation', async () => {
    const unique = Date.now();
    const routeCode = `E2E-R-${unique}`;
    const orderA = `E2E-O-${unique}-A`;
    const orderB = `E2E-O-${unique}-B`;

    // Create route
    const r = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send({ routeId: routeCode, distanceKm: 10, trafficLevel: 'High', baseTimeMinutes: 30 });
    expect([200, 201]).toContain(r.status);
    createdIds.routeId = r.body.id;

    // Create drivers
    const d1 = await request(app).post('/api/drivers').set('Authorization', `Bearer ${token}`).send({ name: 'E2E Driver 1', currentShiftHours: 0 });
    expect([200, 201]).toContain(d1.status);
    const d2 = await request(app).post('/api/drivers').set('Authorization', `Bearer ${token}`).send({ name: 'E2E Driver 2', currentShiftHours: 0 });
    expect([200, 201]).toContain(d2.status);
    createdIds.driverIds.push(d1.body.id, d2.body.id);

    // Create orders
    const o1 = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({ orderId: orderA, valueRs: 800, assignedRouteId: createdIds.routeId });
    expect([200, 201]).toContain(o1.status);
    const o2 = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({ orderId: orderB, valueRs: 1500, assignedRouteId: createdIds.routeId });
    expect([200, 201]).toContain(o2.status);
    createdIds.orderIds.push(o1.body.id, o2.body.id);

    // Run simulation
    const sim = await request(app)
      .post('/api/simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({ numDrivers: 2, routeStartTime: '09:00', maxHoursPerDriver: 8 });
    expect(sim.status).toBe(200);
    expect(sim.body.efficiencyScore).toBeGreaterThanOrEqual(0);
    expect(sim.body.onTimeDeliveries + sim.body.lateDeliveries).toBeGreaterThanOrEqual(1);
    createdIds.simulationId = sim.body.simulationId;

    // Check history
    const hist = await request(app).get('/api/simulate/history').set('Authorization', `Bearer ${token}`);
    expect(hist.status).toBe(200);
    expect(Array.isArray(hist.body)).toBe(true);
    expect(hist.body.length).toBeGreaterThan(0);
  });
});


