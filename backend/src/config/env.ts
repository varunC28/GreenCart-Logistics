import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  DATA_DIR: process.env.DATA_DIR || './data',
  SEED_MANAGER_EMAIL: process.env.SEED_MANAGER_EMAIL || 'admin@greencart.local',
  SEED_MANAGER_PASSWORD: process.env.SEED_MANAGER_PASSWORD || 'admin123',
};
