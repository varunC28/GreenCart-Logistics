import { useEffect, useState } from 'react';
import api from '../api';

interface OrderItem {
  id: number;
  orderId: string;
  valueRs: number;
  assignedRouteId?: number;
}

export default function OrdersPage() {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [orderId, setOrderId] = useState('');
  const [valueRs, setValueRs] = useState(0);
  const [assignedRouteId, setAssignedRouteId] = useState<number | ''>('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api.get('/orders').then((res) => setItems(res.data));
  }, [refresh]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/orders', { orderId, valueRs, assignedRouteId: assignedRouteId === '' ? undefined : assignedRouteId });
    setOrderId('');
    setValueRs(0);
    setAssignedRouteId('');
    setRefresh((x) => x + 1);
  }

  async function remove(id: number) {
    await api.delete(`/orders/${id}`);
    setRefresh((x) => x + 1);
  }

  return (
    <div className="page">
      <h2>Orders</h2>
      <form onSubmit={addItem} className="grid4 mb-12">
        <input placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        <input type="number" placeholder="Value (₹)" value={valueRs} onChange={(e) => setValueRs(parseInt(e.target.value, 10) || 0)} />
        <input type="number" placeholder="Route DB ID (optional)" value={assignedRouteId} onChange={(e) => setAssignedRouteId(e.target.value === '' ? '' : parseInt(e.target.value, 10))} />
        <button type="submit">Add</button>
      </form>

      <table width="100%" border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Order ID</th>
            <th>Value</th>
            <th>Assigned Route ID</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.orderId}</td>
              <td>₹{o.valueRs}</td>
              <td>{o.assignedRouteId ?? '-'}</td>
              <td><button onClick={() => remove(o.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


