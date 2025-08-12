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
    <div className="page container-420">
      <h2>Manager Login</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-12">
          <label htmlFor="email">Email</label>
          <input id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-100" required />
        </div>
        <div className="mb-12">
          <label htmlFor="password">Password</label>
          <input id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-100" required />
        </div>
        {error && <div className="error mb-12">{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}


