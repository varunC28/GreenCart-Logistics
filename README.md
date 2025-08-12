# GreenCart Logistics – Delivery Simulation & KPI Dashboard

Internal tool to simulate delivery operations and visualize KPIs.

## Tech Stack
- Backend: Node.js, Express, Prisma (PostgreSQL), Zod, JWT, bcrypt
- Frontend: React + Vite + TypeScript, React Router, Zustand, Recharts
- DB: PostgreSQL (Neon)
- Tests: Jest + ts-jest

## Monorepo
- `backend/` API server
- `frontend/` React app

## Setup
1) Prereqs: Node 18+, Postgres URL
2) Backend
- Copy `backend/.env.example` → `backend/.env`
- `cd backend && npm i`
- `npx prisma db push` (or `npm run prisma:migrate` if using migrations)
- `npm run prisma:generate`
- Optional seed: place CSVs in `backend/data` and run `npm run seed`
- `npm run dev`
3) Frontend
- `cd frontend && npm i`
- Create `frontend/.env` with `VITE_API_URL=http://localhost:4000/api`
- `npm run dev`

## Env Vars
Backend:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `CORS_ORIGIN`
- `DATA_DIR`
- `SEED_MANAGER_EMAIL`
- `SEED_MANAGER_PASSWORD`

Frontend:
- `VITE_API_URL`

## API Overview (Base: /api)
- Auth: POST `/auth/login`
- Drivers: CRUD `/drivers`
- Routes: CRUD `/routes`
- Orders: CRUD `/orders`
- Simulation: POST `/simulate`, GET `/simulate/history`
- Docs: `/api/docs`

## Rules
- Late penalty: ₹50 if delivery > base + 10m
- Fatigue: >8h previous day → 30% slower
- Bonus: value > ₹1000 and on-time → +10%
- Fuel: ₹5/km + ₹2/km if High traffic
- Profit: value + bonus - penalty - fuel
- Efficiency: onTime / total × 100

## Deploy
- Backend: Render/Railway; set env vars; run build/start
- Frontend: Vercel/Netlify; set `VITE_API_URL`
- DB: Neon

## Testing
- `cd backend && npm test`
