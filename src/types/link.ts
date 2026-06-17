export interface SceneLink {
  id: string;
  from_scene_id: string;
  to_scene_id: string;
  to_scene_title: string;
  degree: number;
  label: string | null;
  to_scene_image_url?: string;
  to_scene_thumbnail_url?: string;
}

export interface CreateLinkPayload {
  from_scene_id: string;
  to_scene_id: string;
  degree: number;
  label?: string | null;
}

export interface UpdateLinkPayload {
  degree?: number;
  label?: string | null;
}
