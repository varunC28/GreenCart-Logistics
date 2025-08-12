export type TrafficLevel = 'Low' | 'Medium' | 'High';

export interface KpiInputs {
  numDrivers: number;
  routeStartTime: string; // HH:MM
  maxHoursPerDriver: number;
}

export interface FuelBreakdown {
  base: number;
  surcharge: number;
}

export interface AssignmentInput {
  orderId: string;
  valueRs: number;
  route: {
    routeId: string;
    distanceKm: number;
    trafficLevel: TrafficLevel;
    baseTimeMinutes: number;
  };
  driver: {
    id: number;
    wasFatigued: boolean;
  };
}

export interface AssignmentResult extends AssignmentInput {
  onTime: boolean;
  fuelCost: number;
  penalty: number;
  bonus: number;
  profit: number;
  deliveryMinutes: number;
}

export interface KpiResult {
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  fuel: FuelBreakdown;
  assignments: AssignmentResult[];
}

export function calcFuelCost(distanceKm: number, trafficLevel: TrafficLevel): { cost: number; base: number; surcharge: number } {
  const basePerKm = 5;
  const surchargePerKm = trafficLevel === 'High' ? 2 : 0;
  const base = Math.round(basePerKm * distanceKm);
  const surcharge = Math.round(surchargePerKm * distanceKm);
  return { cost: base + surcharge, base, surcharge };
}

export function estimateDeliveryMinutes(baseTimeMinutes: number, trafficLevel: TrafficLevel, fatigued: boolean): number {
  const trafficMultiplier = trafficLevel === 'High' ? 1.25 : trafficLevel === 'Medium' ? 1.1 : 1.0;
  const fatigueMultiplier = fatigued ? 1.3 : 1.0; // 30% slower if fatigued next day
  return Math.round(baseTimeMinutes * trafficMultiplier * fatigueMultiplier);
}

export function evaluateAssignment(input: AssignmentInput): AssignmentResult {
  const { route, valueRs, driver } = input;
  const deliveryMinutes = estimateDeliveryMinutes(route.baseTimeMinutes, route.trafficLevel, driver.wasFatigued);
  const onTime = deliveryMinutes <= route.baseTimeMinutes + 10; // on-time window
  const { cost: fuelCost } = calcFuelCost(route.distanceKm, route.trafficLevel);
  const penalty = onTime ? 0 : 50; // ₹50 late penalty
  const bonus = onTime && valueRs > 1000 ? Math.round(valueRs * 0.1) : 0; // 10% bonus
  const profit = valueRs + bonus - penalty - fuelCost;

  return {
    ...input,
    onTime,
    fuelCost,
    penalty,
    bonus,
    profit,
    deliveryMinutes,
  };
}

export function computeKpis(assignments: AssignmentResult[], totalOrdersInSystem: number): KpiResult {
  const totalProfit = assignments.reduce((sum, a) => sum + a.profit, 0);
  const onTimeDeliveries = assignments.filter((a) => a.onTime).length;
  const lateDeliveries = assignments.length - onTimeDeliveries;
  // Aggregate fuel cost breakdown using the same function to keep logic centralized
  const fuelBase = assignments.reduce((sum, a) => sum + Math.round(5 * a.route.distanceKm), 0);
  const fuelSurcharge = assignments.reduce((sum, a) => sum + (a.route.trafficLevel === 'High' ? Math.round(2 * a.route.distanceKm) : 0), 0);
  const deliveries = assignments.length;
  const onTimeRatio = deliveries === 0 ? 0 : onTimeDeliveries / deliveries;
  const efficiencyScore = Math.round(onTimeRatio * (deliveries / Math.max(totalOrdersInSystem, 1)) * 100);

  return {
    totalProfit,
    efficiencyScore,
    onTimeDeliveries,
    lateDeliveries,
    fuel: { base: fuelBase, surcharge: fuelSurcharge },
    assignments,
  };
}
