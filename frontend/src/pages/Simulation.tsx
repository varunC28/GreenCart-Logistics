import { useState } from 'react';
import api from '../api';

interface SimResult {
  simulationId: number;
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  fuel: { base: number; surcharge: number };
}

export default function Simulation() {
  const [numDrivers, setNumDrivers] = useState(3);
  const [routeStartTime, setRouteStartTime] = useState('09:00');
  const [maxHoursPerDriver, setMaxHoursPerDriver] = useState(8);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function runSimulation(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/simulate', { numDrivers, routeStartTime, maxHoursPerDriver });
      setResult(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h2>Simulation</h2>
      <form onSubmit={runSimulation} className="formRow max-480">
        <label>
          Drivers
          <input type="number" min={1} value={numDrivers} onChange={(e) => setNumDrivers(parseInt(e.target.value, 10))} />
        </label>
        <label>
          Start Time
          <input type="time" value={routeStartTime} onChange={(e) => setRouteStartTime(e.target.value)} />
        </label>
        <label>
          Max Hours/Driver
          <input type="number" min={1} value={maxHoursPerDriver} onChange={(e) => setMaxHoursPerDriver(parseInt(e.target.value, 10))} />
        </label>
        <button type="submit" disabled={loading}>{loading ? 'Running...' : 'Run Simulation'}</button>
      </form>

      {error && <div className="error mt-16">{error}</div>}

      {result && (
        <div className="card mt-16">
          <h3>Results</h3>
          <div>Simulation ID: {result.simulationId}</div>
          <div>Total Profit: ₹{result.totalProfit.toLocaleString()}</div>
          <div>Efficiency: {result.efficiencyScore}%</div>
          <div>On-time: {result.onTimeDeliveries} | Late: {result.lateDeliveries}</div>
          <div>Fuel Base: ₹{result.fuel.base} | Surcharge: ₹{result.fuel.surcharge}</div>
        </div>
      )}
    </div>
  );
}


