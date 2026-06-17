import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface RequireAuthProps {
  allowedRoles?: ('admin' | 'viewer')[];
}

export function RequireAuth({ allowedRoles = ['admin'] }: RequireAuthProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/404" replace />; // Fallback to 404/403 or similar page
  }

  return <Outlet />;
}
