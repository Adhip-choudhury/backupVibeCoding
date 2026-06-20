import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { StoreProvider } from './store/store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MachineView from './pages/MachineView';
import OperatorView from './pages/OperatorView';
import PlanningBoard from './pages/PlanningBoard';
import ShiftPlanner from './pages/ShiftPlanner';
import AlertsPanel from './pages/AlertsPanel';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Signup from './pages/Signup';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-loading">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="auth-loading">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Layout hideSidebar={!isAuthenticated}>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/machines" element={<ProtectedRoute><MachineView /></ProtectedRoute>} />
        <Route path="/operators" element={<ProtectedRoute><OperatorView /></ProtectedRoute>} />
        <Route path="/planning" element={<ProtectedRoute><PlanningBoard /></ProtectedRoute>} />
        <Route path="/shifts" element={<ProtectedRoute><ShiftPlanner /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><AlertsPanel /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </StoreProvider>
    </AuthProvider>
  );
}

export default App;
