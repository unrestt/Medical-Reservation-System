import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Jeśli rola użytkownika jest niedozwolona, przekieruj na '/' (skąd RootRedirect wyśle go na właściwy dashboard)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;