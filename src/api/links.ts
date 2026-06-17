import api from './client';
import type { SceneLink, CreateLinkPayload, UpdateLinkPayload } from '@/types/link';

export const linksApi = {
  listByScene: async (sceneId: string): Promise<SceneLink[]> => {
    return api.get<any, SceneLink[]>(`/scenes/${sceneId}/links`);
  },

  create: async (payload: CreateLinkPayload): Promise<SceneLink> => {
    const { from_scene_id, ...body } = payload;
    return api.post<any, SceneLink>(`/scenes/${from_scene_id}/links`, body);
  },

  update: async (linkId: string, payload: UpdateLinkPayload): Promise<SceneLink> => {
    return api.patch<any, SceneLink>(`/links/${linkId}`, payload);
  },

  delete: async (linkId: string): Promise<void> => {
    await api.delete(`/links/${linkId}`);
  },
};
