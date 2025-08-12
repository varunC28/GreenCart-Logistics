import { calcFuelCost, estimateDeliveryMinutes, evaluateAssignment, computeKpis } from '../src/utils/kpi';
describe('KPI rules', () => {
    test('fuel cost with high traffic adds surcharge', () => {
        const { cost } = calcFuelCost(10, 'High');
        expect(cost).toBe(70);
    });
    test('fatigue increases delivery time by ~30%', () => {
        const normal = estimateDeliveryMinutes(100, 'Low', false);
        const fatigued = estimateDeliveryMinutes(100, 'Low', true);
        expect(fatigued).toBeGreaterThan(normal);
    });
    test('late penalty after 10-minute grace', () => {
        const result = evaluateAssignment({
            orderId: 'o1',
            valueRs: 100,
            route: { routeId: 'r1', distanceKm: 1, trafficLevel: 'Low', baseTimeMinutes: 10 },
            driver: { id: 1, wasFatigued: false },
        });
        expect(result.penalty).toBe(0);
    });
    test('high-value on-time bonus applied', () => {
        const result = evaluateAssignment({
            orderId: 'o2',
            valueRs: 1500,
            route: { routeId: 'r2', distanceKm: 1, trafficLevel: 'Low', baseTimeMinutes: 10 },
            driver: { id: 1, wasFatigued: false },
        });
        expect(result.bonus).toBe(150);
    });
    test('efficiency score is 0..100', () => {
        const a1 = evaluateAssignment({
            orderId: 'a1',
            valueRs: 100,
            route: { routeId: 'r', distanceKm: 1, trafficLevel: 'Low', baseTimeMinutes: 10 },
            driver: { id: 1, wasFatigued: false },
        });
        const a2 = evaluateAssignment({
            orderId: 'a2',
            valueRs: 100,
            route: { routeId: 'r', distanceKm: 1, trafficLevel: 'High', baseTimeMinutes: 10 },
            driver: { id: 1, wasFatigued: false },
        });
        const kpis = computeKpis([a1, a2], 4);
        expect(kpis.efficiencyScore).toBeGreaterThanOrEqual(0);
        expect(kpis.efficiencyScore).toBeLessThanOrEqual(100);
    });
});
