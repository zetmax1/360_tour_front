import api from './client';
import type { Scene, CreateScenePayload, UpdateScenePayload } from '@/types/scene';

export const scenesApi = {
  listByTour: async (tourId: string): Promise<Scene[]> => {
    return api.get<any, Scene[]>(`/tours/${tourId}/scenes`);
  },

  getById: async (sceneId: string): Promise<Scene> => {
    return api.get<any, Scene>(`/scenes/${sceneId}`);
  },

  create: async (payload: CreateScenePayload): Promise<Scene> => {
    const { tour_id, ...body } = payload;
    return api.post<any, Scene>(`/tours/${tour_id}/scenes`, body);
  },

  update: async (sceneId: string, payload: UpdateScenePayload): Promise<Scene> => {
    return api.patch<any, Scene>(`/scenes/${sceneId}`, payload);
  },

  delete: async (sceneId: string): Promise<void> => {
    await api.delete(`/scenes/${sceneId}`);
  },

  setEntryPoint: async (sceneId: string): Promise<Scene> => {
    return api.patch<any, Scene>(`/scenes/${sceneId}/entry-point`);
  },

  reorder: async (tourId: string, sceneIds: string[]): Promise<void> => {
    await api.post(`/tours/${tourId}/scenes/reorder`, { scene_ids: sceneIds });
  },
};
