import { useEffect, useState } from 'react';
import api from '../api';

interface Driver {
  id: number;
  name: string;
  currentShiftHours: number;
  past7DayHours: number[];
}

export default function Drivers() {
  const [items, setItems] = useState<Driver[]>([]);
  const [name, setName] = useState('');
  const [shift, setShift] = useState(0);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api.get('/drivers').then((res) => setItems(res.data));
  }, [refresh]);

  async function addDriver(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/drivers', { name, currentShiftHours: shift });
    setName('');
    setShift(0);
    setRefresh((x) => x + 1);
  }

  async function remove(id: number) {
    await api.delete(`/drivers/${id}`);
    setRefresh((x) => x + 1);
  }

  return (
    <div className="page">
      <h2>Drivers</h2>
      <form onSubmit={addDriver} className="flex gap-8 mb-12">
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input type="number" placeholder="Shift Hours" value={shift} onChange={(e) => setShift(parseInt(e.target.value, 10) || 0)} />
        <button type="submit">Add</button>
      </form>
      <table width="100%" border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Shift</th>
            <th>Past 7 Days</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.name}</td>
              <td>{d.currentShiftHours}</td>
              <td>{d.past7DayHours?.join(', ')}</td>
              <td><button onClick={() => remove(d.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


