import { useEffect, useState } from 'react';
import api from '../api';

interface HistoryItem {
  id: number;
  createdAt: string;
  inputs: { numDrivers: number; routeStartTime: string; maxHoursPerDriver: number };
  metrics: { totalProfit: number; efficiencyScore: number; onTimeDeliveries: number; lateDeliveries: number };
}

export default function History() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/simulate/history');
        setItems(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Simulation History</h2>
      {items.length === 0 ? (
        <div>No simulations yet.</div>
      ) : (
        <table width="100%" border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Timestamp</th>
              <th>Drivers</th>
              <th>Start</th>
              <th>Max Hours</th>
              <th>Profit</th>
              <th>Efficiency</th>
              <th>On-time</th>
              <th>Late</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.id}</td>
                <td>{new Date(it.createdAt).toLocaleString()}</td>
                <td>{it.inputs.numDrivers}</td>
                <td>{it.inputs.routeStartTime}</td>
                <td>{it.inputs.maxHoursPerDriver}</td>
                <td>₹{it.metrics.totalProfit.toLocaleString()}</td>
                <td>{it.metrics.efficiencyScore}%</td>
                <td>{it.metrics.onTimeDeliveries}</td>
                <td>{it.metrics.lateDeliveries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


