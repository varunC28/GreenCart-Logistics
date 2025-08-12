# Frontend App

React + Vite + TypeScript app with routing, auth, charts, and CRUD pages.

## Setup
- `npm i`
- Create `.env` with `VITE_API_URL=http://localhost:4000/api`
- `npm run dev`

## Scripts
- dev: `npm run dev`
- build: `npm run build`
- preview: `npm run preview`

## Pages
- Login (JWT)
- Dashboard (KPIs + charts)
- Simulation (run inputs)
- Drivers/Routes/Orders (CRUD)
- History (past simulations)

## Deployment
- Vercel/Netlify; set `VITE_API_URL` to your backend public `/api` URL.
