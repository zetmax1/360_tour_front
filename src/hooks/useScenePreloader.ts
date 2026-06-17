/**
 * useScenePreloader — preloads images for all linked scenes so navigation feels instant.
 *
 * When a scene loads, this hook immediately starts preloading the panorama images
 * for all scenes linked from the current one. Uses the browser's Image object to
 * trigger HTTP requests that warm the browser cache.
 *
 * Links are staggered 300ms apart to avoid spiking bandwidth.
 */

import { useEffect } from 'react';
import { getImageUrl } from '@/utils/formatters';
import { selectImageUrl, getOptimalQuality } from '@/utils/imageResolution';
import type { SceneLink } from '@/types/link';

export function useScenePreloader(links: SceneLink[]) {
  useEffect(() => {
    if (!links.length) return;

    const quality = getOptimalQuality();
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    links.forEach((link, i) => {
      // Stagger preloads: first link immediately, others delayed
      const delay = i * 300;
      const timeout = setTimeout(() => {
        // Preload the resolution-appropriate panorama
        if (link.to_scene_image_url) {
          const img = new Image();
          img.src = getImageUrl(selectImageUrl(link.to_scene_image_url, quality));
        }

        // Also preload thumbnail for instant blur-up preview
        if (link.to_scene_thumbnail_url) {
          const thumb = new Image();
          thumb.src = getImageUrl(link.to_scene_thumbnail_url);
        }
      }, delay);

      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [links]);
}
