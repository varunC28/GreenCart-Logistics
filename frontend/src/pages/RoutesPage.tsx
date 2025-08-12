import { useEffect, useState } from 'react';
import api from '../api';

interface RouteItem {
  id: number;
  routeId: string;
  distanceKm: number;
  trafficLevel: string;
  baseTimeMinutes: number;
}

export default function RoutesPage() {
  const [items, setItems] = useState<RouteItem[]>([]);
  const [routeId, setRouteId] = useState('');
  const [distanceKm, setDistanceKm] = useState(1);
  const [trafficLevel, setTrafficLevel] = useState('Medium');
  const [baseTimeMinutes, setBaseTimeMinutes] = useState(10);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api.get('/routes').then((res) => setItems(res.data));
  }, [refresh]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/routes', { routeId, distanceKm, trafficLevel, baseTimeMinutes });
    setRouteId('');
    setDistanceKm(1);
    setTrafficLevel('Medium');
    setBaseTimeMinutes(10);
    setRefresh((x) => x + 1);
  }

  async function remove(id: number) {
    await api.delete(`/routes/${id}`);
    setRefresh((x) => x + 1);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Routes</h2>
      <form onSubmit={addItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
        <input placeholder="Route ID" value={routeId} onChange={(e) => setRouteId(e.target.value)} />
        <input type="number" placeholder="Distance Km" value={distanceKm} onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)} />
        <select aria-label="Traffic Level" value={trafficLevel} onChange={(e) => setTrafficLevel(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input type="number" placeholder="Base Time (min)" value={baseTimeMinutes} onChange={(e) => setBaseTimeMinutes(parseInt(e.target.value, 10) || 0)} />
        <button type="submit">Add</button>
      </form>

      <table width="100%" border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Route ID</th>
            <th>Distance</th>
            <th>Traffic</th>
            <th>Base Time</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.routeId}</td>
              <td>{r.distanceKm}</td>
              <td>{r.trafficLevel}</td>
              <td>{r.baseTimeMinutes}</td>
              <td><button onClick={() => remove(r.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


