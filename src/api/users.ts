import api from './client';
import type { User } from '@/types/auth';

export interface CreateUserPayload {
  email: string;
  password: string;
  role: 'admin' | 'viewer';
}

/**
 * All user management endpoints are under /admin/users/*.
 * These are admin-only — the axios interceptor attaches the Bearer token.
 */
export const usersApi = {
  list: async (): Promise<User[]> => {
    return api.get<any, User[]>('/admin/users');
  },

  create: async (payload: CreateUserPayload): Promise<User> => {
    return api.post<any, User>('/admin/users', payload);
  },

  /**
   * PATCH /admin/users/{id}/active  — { is_active: bool }
   */
  toggleActive: async (id: string, is_active: boolean): Promise<User> => {
    return api.patch<any, User>(`/admin/users/${id}/active`, { is_active });
  },

  /**
   * PATCH /admin/users/{id}/role  — { role: 'admin' | 'viewer' }
   */
  updateRole: async (id: string, role: 'admin' | 'viewer'): Promise<User> => {
    return api.patch<any, User>(`/admin/users/${id}/role`, { role });
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },
};
