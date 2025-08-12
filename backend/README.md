# Backend API

Express + Prisma (PostgreSQL) with JWT auth, CRUD, simulation KPIs, and history.

## Scripts
- dev: `npm run dev`
- build/start: `npm run build && npm start`
- test: `npm test`
- seed: `npm run seed`

## Env (.env)
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT` (4000)
- `CORS_ORIGIN` (http://localhost:5173)
- `DATA_DIR` (./data)
- `SEED_MANAGER_EMAIL` (admin@greencart.local)
- `SEED_MANAGER_PASSWORD` (admin123)

## Endpoints (Base: /api)
- POST `/auth/login` { email, password } → { token }
- CRUD: `/drivers`, `/routes`, `/orders`
- Simulation:
  - POST `/simulate` { numDrivers, routeStartTime, maxHoursPerDriver }
  - GET `/simulate/history`
- Docs: `/api/docs`

## Seeding from CSV
- Place `routes.csv`, `orders.csv`, `drivers.csv` in `backend/data/`
- Run `npm run seed`
