import app from './app';
import { env } from './config/env';
import { prisma } from './db/prisma';
import bcrypt from 'bcryptjs';

async function ensureSeedManager() {
  const email = env.SEED_MANAGER_EMAIL;
  const existing = await prisma.manager.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(env.SEED_MANAGER_PASSWORD, 10);
    await prisma.manager.create({ data: { email, passwordHash } });
    console.log('Seeded manager account:', email);
  }
}

async function start() {
  await ensureSeedManager();
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
