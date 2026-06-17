import { useRef, useCallback } from 'react';
import type { PanoramaViewerRef } from '@/components/viewer/PanoramaViewer';
import { useViewerStore } from '@/store/viewerStore';

export function useViewer() {
  const viewerRef = useRef<PanoramaViewerRef>(null);
  const { hfov, setHfov } = useViewerStore();

  const zoomIn = useCallback(() => {
    const newHfov = Math.max(40, hfov - 10);
    viewerRef.current?.setHfov(newHfov);
    setHfov(newHfov);
  }, [hfov, setHfov]);

  const zoomOut = useCallback(() => {
    const newHfov = Math.min(120, hfov + 10);
    viewerRef.current?.setHfov(newHfov);
    setHfov(newHfov);
  }, [hfov, setHfov]);

  const flyTo = useCallback((yaw: number, pitch?: number) => {
    viewerRef.current?.setYaw(yaw, true);
    if (pitch !== undefined) viewerRef.current?.setPitch(pitch, true);
  }, []);

  return { viewerRef, zoomIn, zoomOut, flyTo };
}
