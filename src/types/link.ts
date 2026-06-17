export interface SceneLink {
  id: string;
  from_scene_id: string;
  to_scene_id: string;
  to_scene_title: string;
  degree: number;
  label: string | null;
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
