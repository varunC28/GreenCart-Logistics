import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuthStore } from '../store/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '80px auto' }}>
      <h2>Manager Login</h2>
      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="email">Email</label>
          <input id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ width: '100%' }} required />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="password">Password</label>
          <input id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" style={{ width: '100%' }} required />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}


