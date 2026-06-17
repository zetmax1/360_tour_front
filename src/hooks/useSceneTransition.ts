/**
 * useSceneTransition — orchestrates the "walk forward" transition between scenes.
 *
 * Timeline:
 *   0ms    ── click cursor
 *   0–100  ── rotate toward cursor degree (Step 1)
 *   0–150  ── zoom in toward cursor (Step 2, parallel with Step 1)
 *   150ms  ── begin fade to dark overlay (Step 3)
 *   350ms  ── overlay fully dark, swap scene (Step 4)
 *   350ms+ ── new Pannellum viewer loads (hidden)
 *   600ms  ── fade overlay out + zoom out to normal hfov (Step 5)
 *   750ms  ── transition complete
 */

import { useState, useCallback, useRef } from 'react';
import { animateYawToward, animateZoomIn } from '@/utils/degree';
import type { SceneLink } from '@/types/link';

export interface TransitionConfig {
  yawDuration: number;     // default 100ms
  zoomDuration: number;    // default 150ms
  fadeDuration: number;    // default 200ms
  zoomAmount: number;      // hfov degrees to reduce, default 15
}

const DEFAULT_CONFIG: TransitionConfig = {
  yawDuration: 100,
  zoomDuration: 150,
  fadeDuration: 200,
  zoomAmount: 15,
};

interface TransitionCallbacks {
  /** Called when the overlay is fully dark — time to swap the scene */
  onSwapScene: (link: SceneLink) => void;
}

export function useSceneTransition(
  configOverride?: Partial<TransitionConfig>,
) {
  const config = { ...DEFAULT_CONFIG, ...configOverride };
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const transitionRef = useRef(false);

  const triggerTransition = useCallback(
    (
      link: SceneLink,
      viewer: PannellumViewer | null,
      callbacks: TransitionCallbacks,
    ) => {
      if (transitionRef.current || !viewer) return;
      transitionRef.current = true;
      setIsTransitioning(true);

      // Step 1 & 2: rotate toward cursor + zoom in (parallel)
      const yawPromise = animateYawToward(viewer, link.degree, config.yawDuration);
      const zoomPromise = animateZoomIn(viewer, config.zoomAmount, config.zoomDuration);

      // Wait for the longer animation (zoom), then fade to dark
      Promise.all([yawPromise, zoomPromise]).then(() => {
        // Step 3: fade to dark overlay
        setOverlayOpacity(0.85);

        // Wait for fade transition to complete, then swap scene
        setTimeout(() => {
          // Step 4: swap scene
          callbacks.onSwapScene(link);
        }, config.fadeDuration);
      });
    },
    [config.yawDuration, config.zoomDuration, config.fadeDuration, config.zoomAmount],
  );

  const completeTransition = useCallback(() => {
    // Step 5: fade overlay out (CSS transition handles the animation)
    setOverlayOpacity(0);

    // Reset transition state after the fade-out completes
    setTimeout(() => {
      setIsTransitioning(false);
      transitionRef.current = false;
    }, config.fadeDuration + 50); // +50ms buffer
  }, [config.fadeDuration]);

  return {
    isTransitioning,
    overlayOpacity,
    fadeDuration: config.fadeDuration,
    triggerTransition,
    completeTransition,
  };
}
