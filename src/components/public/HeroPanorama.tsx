import { useEffect, useRef } from 'react';

interface HeroPanoramaProps {
  imageUrl: string;
}

/**
 * A decorative, auto-rotating panorama viewer for the hero section.
 * Non-interactive — users interact via the tour cards below.
 *
 * Uses IntersectionObserver to pause auto-rotate when the hero
 * scrolls off-screen, saving GPU cycles.
 */
export function HeroPanorama({ imageUrl }: HeroPanoramaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    viewerRef.current = pannellum.viewer(containerRef.current, {
      type: 'equirectangular',
      panorama: imageUrl,
      autoLoad: true,
      showControls: false,
      mouseZoom: false,
      draggable: false,

      // Smooth auto-rotate: -1.5 = rotates right at 1.5°/sec
      // One full rotation ≈ 240s (4 min) — subtle and cinematic
      autoRotate: -1.5,
      autoRotateInactivityDelay: 0,

      pitch: -5,
      hfov: 110,
      minPitch: -5,
      maxPitch: -5,
      friction: 0.0,

      showLoadButton: false,
      loadButtonLabel: '',
      hotSpotDebug: false,
    });

    // Pause auto-rotate when hero is off-screen (saves GPU)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!viewerRef.current) return;
        if (entry.isIntersecting) {
          viewerRef.current.startAutoRotate(-1.5);
        } else {
          viewerRef.current.stopAutoRotate();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [imageUrl]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
