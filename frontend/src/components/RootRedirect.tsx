import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Komponent przekierowujący z głównego adresu '/' do odpowiedniego panelu zależnie od roli użytkownika
const RootRedirect = () => {
  const user = useAuthStore((s) => s.user);
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

export default RootRedirect;
