import api from './client';
import { queryClient } from '../App';

export const adminApi = {
  getCacheStats: (): Promise<any> => api.get('/admin/cache/stats'),

  clearAllCache: async (): Promise<any> => {
    const result = await api.post('/admin/cache/clear');
    // Immediately clear ALL TanStack Query cache
    // so the next navigation fetches fresh from backend
    queryClient.clear();
    return result;
  },

  clearTourCache: async (tourId: string): Promise<any> => {
    const result = await api.post(`/admin/cache/clear/tour/${tourId}`);
    // Invalidate only tour-related queries
    queryClient.invalidateQueries({ queryKey: ['tours'] });
    queryClient.invalidateQueries({ queryKey: ['scenes'] });
    return result;
  },

  warmCache: (): Promise<any> => api.post('/admin/cache/warm'),
};
