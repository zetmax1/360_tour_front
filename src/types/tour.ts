import type { Scene } from './scene';

export interface Tour {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  scenes_count?: number;
  entry_scene_image_url?: string | null;
  entry_scene_thumbnail_url?: string | null;
  scenes?: Scene[];
}

export interface CreateTourPayload {
  title: string;
  slug: string;
  description?: string | null;
  is_default?: boolean;
}

export interface UpdateTourPayload {
  title?: string;
  slug?: string;
  description?: string | null;
  is_published?: boolean;
  is_default?: boolean;
}
