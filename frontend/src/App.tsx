import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import './App.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Simulation from './pages/Simulation';
import Drivers from './pages/Drivers';
import RoutesPage from './pages/RoutesPage';
import OrdersPage from './pages/OrdersPage';
import History from './pages/History';
import { useAuthStore } from './store/auth';

function Protected({ children }: { children: ReactElement }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout } = useAuthStore();
  return (
    <div>
      <nav className="topNav">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/simulation">Simulation</Link>
        <Link to="/drivers">Drivers</Link>
        <Link to="/routes">Routes</Link>
        <Link to="/orders">Orders</Link>
        <Link to="/history">History</Link>
        <span className="spacer" />
        {isAuthenticated && <button onClick={logout}>Logout</button>}
      </nav>
      <div>{children}</div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Layout>
                <Dashboard />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/simulation"
          element={
            <Protected>
              <Layout>
                <Simulation />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/drivers"
          element={
            <Protected>
              <Layout>
                <Drivers />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/routes"
          element={
            <Protected>
              <Layout>
                <RoutesPage />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/orders"
          element={
            <Protected>
              <Layout>
                <OrdersPage />
              </Layout>
            </Protected>
          }
        />
        <Route
          path="/history"
          element={
            <Protected>
              <Layout>
                <History />
              </Layout>
            </Protected>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
