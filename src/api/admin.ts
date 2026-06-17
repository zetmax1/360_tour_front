import api from './client';
import { queryClient } from '../App';

export const adminApi = {
  getCacheStats: () => api.get('/admin/cache/stats'),

  clearAllCache: async () => {
    const result = await api.post('/admin/cache/clear');
    // Immediately clear ALL TanStack Query cache
    // so the next navigation fetches fresh from backend
    queryClient.clear();
    return result;
  },

  clearTourCache: async (tourId: string) => {
    const result = await api.post(`/admin/cache/clear/tour/${tourId}`);
    // Invalidate only tour-related queries
    queryClient.invalidateQueries({ queryKey: ['tours'] });
    queryClient.invalidateQueries({ queryKey: ['scenes'] });
    return result;
  },

  warmCache: () => api.post('/admin/cache/warm'),
};
