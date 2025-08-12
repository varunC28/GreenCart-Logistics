import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { prisma } from '../db/prisma';
import { env } from '../config/env';

interface RouteRow { route_id: string; distance_km: string; traffic_level: string; base_time_min: string }
interface OrderRow { order_id: string; value_rs: string; route_id: string; delivery_time?: string }
interface DriverRow { name: string; shift_hours: string; past_week_hours?: string }

async function main() {
  const routesPath = path.resolve(env.DATA_DIR, 'routes.csv');
  const ordersPath = path.resolve(env.DATA_DIR, 'orders.csv');
  const driversPath = path.resolve(env.DATA_DIR, 'drivers.csv');

  if (!fs.existsSync(routesPath) || !fs.existsSync(ordersPath) || !fs.existsSync(driversPath)) {
    throw new Error('Missing CSV files in ' + env.DATA_DIR);
  }

  const routeRows = parse(fs.readFileSync(routesPath), { columns: true, skip_empty_lines: true }) as RouteRow[];
  const orderRows = parse(fs.readFileSync(ordersPath), { columns: true, skip_empty_lines: true }) as OrderRow[];
  const driverRows = parse(fs.readFileSync(driversPath), { columns: true, skip_empty_lines: true }) as DriverRow[];

  await prisma.assignment.deleteMany();
  await prisma.simulationResult.deleteMany();
  await prisma.order.deleteMany();
  await prisma.route.deleteMany();
  await prisma.driver.deleteMany();

  for (const r of routeRows) {
    await prisma.route.create({
      data: {
        routeId: String(r.route_id),
        distanceKm: parseFloat(r.distance_km),
        trafficLevel: r.traffic_level,
        baseTimeMinutes: parseInt(r.base_time_min, 10),
      },
    });
  }

  const routes = await prisma.route.findMany();
  const routeMap = new Map(routes.map((r) => [r.routeId, r.id]));

  for (const o of orderRows) {
    const assignedRouteId = routeMap.get(String(o.route_id));
    await prisma.order.create({
      data: {
        orderId: String(o.order_id),
        valueRs: parseInt(o.value_rs, 10),
        assignedRouteId: assignedRouteId || null,
        deliveryTimestamp: o.delivery_time ? new Date(o.delivery_time) : null,
      },
    });
  }

  for (const d of driverRows) {
    const past = (d.past_week_hours || '')
      .split('|')
      .map((x) => x.trim())
      .filter(Boolean)
      .map((x) => parseInt(x, 10));
    await prisma.driver.create({
      data: {
        name: d.name,
        currentShiftHours: parseInt(d.shift_hours, 10) || 0,
        past7DayHours: past,
      },
    });
  }

  console.log('Seed completed');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
