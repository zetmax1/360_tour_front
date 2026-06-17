import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
} from 'react';
import { useViewerStore } from '@/store/viewerStore';
import { getOptimalQuality, selectImageUrl } from '@/utils/imageResolution';

interface PanoramaViewerProps {
  imageUrl: string;
  initialYaw?: number;
  initialPitch?: number;
  onLoad?: () => void;
}

export interface PanoramaViewerRef {
  setYaw: (yaw: number, animated?: boolean) => void;
  setPitch: (pitch: number, animated?: boolean) => void;
  setHfov: (hfov: number, animated?: boolean) => void;
  getInstance: () => PannellumViewer | null;
}

export const PanoramaViewer = forwardRef<PanoramaViewerRef, PanoramaViewerProps>(
  ({ imageUrl, initialYaw = 0, initialPitch = 0, onLoad }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewerRef = useRef<PannellumViewer | null>(null);
    const lastWidth = useRef(0);
    const [resizeKey, setResizeKey] = useState(0);

    const onLoadRef = useRef(onLoad);
    useEffect(() => {
      onLoadRef.current = onLoad;
    }, [onLoad]);

    // Initialize viewer, recreate on imageUrl change or significant resize
    useEffect(() => {
      if (!containerRef.current) return;

      const quality = getOptimalQuality();
      const resolvedImageUrl = selectImageUrl(imageUrl, quality);
      const isMobile = window.innerWidth <= 768;

      const viewer = pannellum.viewer(containerRef.current, {
        type: 'equirectangular',
        panorama: resolvedImageUrl,
        yaw: initialYaw,
        pitch: initialPitch || 0, // start at horizon
        hfov: isMobile ? 90 : 100,
        minHfov: 50,
        maxHfov: 110,
        minPitch: -50,
        maxPitch: 50,
        friction: 0.15,
        autoLoad: true,
        showControls: false,
        compass: false,
        showLoadButton: false,
        loadButtonLabel: '',
        hotSpotDebug: false,
        // Subtle auto-rotation: slowly drifts right
        autoRotate: -1.2,
        autoRotateInactivityDelay: 0,
      });

      viewerRef.current = viewer;

      let frameId: number;

      viewer.on('load', () => {
        try {
          useViewerStore.getState().setViewAngles(viewer.getYaw(), viewer.getPitch());
        } catch { /* ignore */ }
        
        // Slight delay to ensure render is complete
        setTimeout(() => {
           onLoadRef.current?.();
        }, 50);

        const updateViewerState = () => {
          try {
            const v = viewerRef.current;
            if (v) {
              useViewerStore.getState().setViewAngles(v.getYaw(), v.getPitch());
            }
          } catch {
            // Pannellum not fully loaded yet
          }
          frameId = requestAnimationFrame(updateViewerState);
        };
        frameId = requestAnimationFrame(updateViewerState);
      });

      // Resize debounce
      let resizeTimer: ReturnType<typeof setTimeout>;
      const handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          const newWidth = containerRef.current?.offsetWidth ?? 0;
          if (Math.abs(newWidth - lastWidth.current) > 50) {
            lastWidth.current = newWidth;
            setResizeKey(prev => prev + 1);
          }
        }, 250);
      };
      
      window.addEventListener('resize', handleResize);

      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', handleResize);
        viewer.destroy();
        viewerRef.current = null;
      };
    }, [imageUrl, initialYaw, initialPitch, resizeKey]);

    useImperativeHandle(ref, () => ({
      setYaw: (yaw, animated = true) => viewerRef.current?.setYaw(yaw, animated),
      setPitch: (pitch, animated = true) => viewerRef.current?.setPitch(pitch, animated),
      setHfov: (hfov, animated = true) => viewerRef.current?.setHfov(hfov, animated),
      getInstance: () => viewerRef.current,
    }));

    return (
      <div className="relative w-full h-full">
        {/* Pannellum attaches to this div */}
        <div ref={containerRef} className="w-full h-full" />
      </div>
    );
  }
);

PanoramaViewer.displayName = 'PanoramaViewer';
