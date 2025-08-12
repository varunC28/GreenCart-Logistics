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

describe('Drivers CRUD (integration)', () => {
  jest.setTimeout(20000);
  let token = '';
  let createdDriverId: number | undefined;

  beforeAll(async () => {
    const existing = await prisma.manager.findUnique({ where: { email: TEST_EMAIL } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);
      await prisma.manager.create({ data: { email: TEST_EMAIL, passwordHash } });
    }
    const res = await request(app).post('/api/auth/login').send({ email: TEST_EMAIL, password: TEST_PASSWORD });
    expect(res.status).toBe(200);
    token = res.body.token;
  });

  afterAll(async () => {
    if (createdDriverId) {
      await prisma.driver.delete({ where: { id: createdDriverId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/drivers');
    expect(res.status).toBe(401);
  });

  it('creates, fetches, updates, and deletes a driver', async () => {
    // Create
    const createRes = await request(app)
      .post('/api/drivers')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'INT Driver 1', currentShiftHours: 0 });
    expect([200, 201]).toContain(createRes.status);
    createdDriverId = createRes.body.id;

    // Fetch one
    const getRes = await request(app)
      .get(`/api/drivers/${createdDriverId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe('INT Driver 1');

    // Update
    const putRes = await request(app)
      .put(`/api/drivers/${createdDriverId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentShiftHours: 2 });
    expect(putRes.status).toBe(200);
    expect(putRes.body.currentShiftHours).toBe(2);

    // Delete
    const delRes = await request(app)
      .delete(`/api/drivers/${createdDriverId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(204);
    createdDriverId = undefined;
  });
});


