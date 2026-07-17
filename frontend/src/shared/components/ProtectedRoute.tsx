import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { token } = useAuthStore();
  // Redirect to login if user is not authenticated
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}
