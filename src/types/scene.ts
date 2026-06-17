import type { SceneLink } from './link';

export interface Scene {
  id: string;
  tour_id: string;
  title: string;
  description: string | null;
  image_url: string;
  thumbnail_url: string | null;
  initial_yaw: number;
  order_index: number;
  is_entry_point: boolean;
  links: SceneLink[];
}

export interface CreateScenePayload {
  tour_id: string;
  title: string;
  description?: string | null;
  image_url: string;
  thumbnail_url?: string | null;
  initial_yaw?: number;
  order_index?: number;
  is_entry_point?: boolean;
}

export interface UpdateScenePayload {
  title?: string;
  description?: string | null;
  image_url?: string;
  thumbnail_url?: string | null;
  initial_yaw?: number;
  order_index?: number;
  is_entry_point?: boolean;
}
