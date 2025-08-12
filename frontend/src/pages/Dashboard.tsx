import { useEffect, useState } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface Metrics {
  totalProfit: number;
  efficiencyScore: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  fuel: { base: number; surcharge: number };
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.get('/simulate/history');
        const latest = Array.isArray(res.data) && res.data.length > 0 ? res.data[0].metrics : null;
        setMetrics(latest);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>Dashboard</h2>
      {metrics ? (
        <div className="autoGrid">
          <div className="card">
            <h3>Total Profit</h3>
            <div>₹{metrics.totalProfit.toLocaleString()}</div>
          </div>
          <div className="card">
            <h3>Efficiency Score</h3>
            <div>{metrics.efficiencyScore}%</div>
          </div>
          <div className="chartBox card">
            <h3>On-time vs Late</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie dataKey="value" data={[
                  { name: 'On-time', value: metrics.onTimeDeliveries },
                  { name: 'Late', value: metrics.lateDeliveries },
                ]} cx="50%" cy="50%" outerRadius={80} label>
                  <Cell fill="#4caf50" />
                  <Cell fill="#f44336" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chartBox card">
            <h3>Fuel Cost Breakdown</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{ name: 'Fuel', Base: metrics.fuel.base, Surcharge: metrics.fuel.surcharge }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Base" fill="#2196f3" />
                <Bar dataKey="Surcharge" fill="#ff9800" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div>No simulation found yet. Run one to see metrics.</div>
      )}
    </div>
  );
}


