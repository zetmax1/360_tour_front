import api from './client';
import type { Tour, CreateTourPayload, UpdateTourPayload } from '@/types/tour';

export const toursApi = {
  /**
   * List ALL tours (published + draft) — admin only.
   * Backend: GET /tours/all
   */
  list: async (): Promise<Tour[]> => {
    return api.get<any, Tour[]>('/tours/all');
  },

  /**
   * List only published tours — public.
   * Backend: GET /tours  (the public listing endpoint)
   */
  listPublished: async (): Promise<Tour[]> => {
    return api.get<any, Tour[]>('/tours');
  },

  /**
   * Fetch a single tour by slug — public viewer.
   * Backend: GET /tours/{slug}
   */
  getBySlug: async (slug: string): Promise<Tour> => {
    return api.get<any, Tour>(`/tours/${slug}`);
  },

  /**
   * Fetch a tour by UUID — admin detail page.
   * Backend: GET /tours/by-id/{id}  (admin-only)
   */
  getById: async (id: string): Promise<Tour> => {
    return api.get<any, Tour>(`/tours/by-id/${id}`);
  },

  create: async (payload: CreateTourPayload): Promise<Tour> => {
    return api.post<any, Tour>('/tours', payload);
  },

  update: async (id: string, payload: UpdateTourPayload): Promise<Tour> => {
    return api.patch<any, Tour>(`/tours/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tours/${id}`);
  },

  togglePublish: async (id: string, is_published: boolean): Promise<Tour> => {
    return api.patch<any, Tour>(`/tours/${id}/publish`, { is_published });
  },

  /**
   * Toggle default status.
   * Backend: PATCH /tours/{id}/default with body { is_default: bool }
   */
  toggleDefault: async (id: string, is_default: boolean): Promise<Tour> => {
    return api.patch<any, Tour>(`/tours/${id}/default`, { is_default });
  },
};
