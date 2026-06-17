import api from './client';
import type { User, AuthTokens } from '@/types/auth';

interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    return api.post<any, AuthTokens>('/auth/login', payload);
  },

  me: async (): Promise<User> => {
    return api.get<any, User>('/auth/me');
  },

  getMe: async (token: string): Promise<User> => {
    return api.get<any, User>('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  refresh: async (refreshToken: string): Promise<AuthTokens> => {
    return api.post<any, AuthTokens>('/auth/refresh', { refresh_token: refreshToken });
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },
};
