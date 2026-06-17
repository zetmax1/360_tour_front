import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, isAuthenticated, accessToken, setAuth, clearAuth } = useAuthStore();
  return { user, isAuthenticated, accessToken, setAuth, clearAuth };
}
