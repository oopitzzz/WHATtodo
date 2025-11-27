import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/auth.store';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore();

  // 토큰 확인
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
