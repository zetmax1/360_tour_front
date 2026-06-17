import React, { useRef, useEffect, useState, useMemo } from 'react';
import { PreviewArrow } from './PreviewArrow';
import { degreeToScreenX, isLinkInFrontOfViewer } from '@/utils/degree';

interface LinkPreviewPanelProps {
  sceneImageUrl: string;       // current scene's full panorama image URL
  initialYaw: number;          // current scene's initialYaw
  previewDegree: number;       // controlled: current degree from the form
  onDegreeChange: (deg: number) => void;  // called when admin drags arrow
}

export function LinkPreviewPanel({
  sceneImageUrl,
  initialYaw,
  previewDegree,
  onDegreeChange,
}: LinkPreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Using 'any' for PannellumViewer type since it's global and might not be fully typed in all environments
  const viewerRef = useRef<any>(null);
  const [viewerYaw, setViewerYaw] = useState(initialYaw);
  const [viewerWidth, setViewerWidth] = useState(0);
  const [isDraggingArrow, setIsDraggingArrow] = useState(false);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // Fallback check: try medium resolution first, fall back to original if needed
  useEffect(() => {
    if (!sceneImageUrl) {
      setImageUrl('');
      return;
    }
    const mediumUrl = sceneImageUrl.replace(/\.(\w+)$/, '_medium.$1');
    const testImg = new Image();
    testImg.src = mediumUrl;
    testImg.onload = () => {
      setImageUrl(mediumUrl);
    };
    testImg.onerror = () => {
      setImageUrl(sceneImageUrl);
    };
  }, [sceneImageUrl]);

  // Initialize Pannellum mini viewer
  useEffect(() => {
    // Access global pannellum securely
    const globalPannellum = (window as any).pannellum || (typeof pannellum !== 'undefined' ? pannellum : null);
    if (!imageUrl || !containerRef.current || !globalPannellum) return;

    // Start facing the link's current degree if set, otherwise scene initialYaw
    const startYaw = previewDegree !== undefined ? previewDegree : initialYaw;

    const viewer = globalPannellum.viewer(containerRef.current, {
      type: 'equirectangular',
      panorama: imageUrl,
      autoLoad: true,
      showControls: false,
      yaw: startYaw,
      pitch: 0,
      hfov: 100,
      minPitch: -50,
      maxPitch: 50,
      friction: 0.15,
      mouseZoom: true,
    });

    viewerRef.current = viewer;

    let rafId: number;

    viewer.on('load', () => {
      setIsViewerReady(true);
      setViewerWidth(containerRef.current?.offsetWidth ?? 0);
      setViewerYaw(viewer.getYaw());

      function syncYaw() {
        if (!viewerRef.current) return;
        setViewerYaw(viewerRef.current.getYaw());
        rafId = requestAnimationFrame(syncYaw);
      }
      rafId = requestAnimationFrame(syncYaw);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      viewer.destroy();
      viewerRef.current = null;
      setIsViewerReady(false);
    };
  }, [imageUrl, initialYaw]);

  // Rotate the viewer to face the target degree when changed via form inputs (not dragging arrow)
  useEffect(() => {
    if (viewerRef.current && !isDraggingArrow && isViewerReady) {
      viewerRef.current.setYaw(previewDegree, false); // immediate jump for snappy responsiveness
    }
  }, [previewDegree, isDraggingArrow, isViewerReady]);

  // Update viewerWidth on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setViewerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate screen X position of the preview arrow (hfov is 100)
  const arrowScreenX = useMemo(() => {
    return degreeToScreenX(previewDegree, viewerYaw, viewerWidth, 100);
  }, [previewDegree, viewerYaw, viewerWidth]);

  const isInFront = isLinkInFrontOfViewer(previewDegree, viewerYaw, 30);

  // Handle dragging the arrow across the panorama to set degree
  function handleArrowDrag(clientX: number) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const fractionAcrossScreen = relativeX / rect.width;

    // Convert screen fraction back to an absolute degree based on field of view (hfov = 100)
    const hfov = 100;
    const relativeDeg = (fractionAcrossScreen - 0.5) * hfov;
    const absoluteDeg = (viewerYaw + relativeDeg + 360) % 360;
    onDegreeChange(Math.round(absoluteDeg * 10) / 10); // 1 decimal precision
  }

  if (!sceneImageUrl) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-900 rounded-lg aspect-video p-6 text-center text-gray-400">
        <svg className="w-12 h-12 mb-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm font-medium">Upload a panorama image to this scene first to preview link placement</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Panorama container */}
      <div
        className="relative w-full rounded-lg overflow-hidden bg-gray-900 border border-gray-200 shadow-inner"
        style={{ aspectRatio: '16/9', minHeight: '200px' }}
      >
        {/* Pannellum viewer */}
        <div ref={containerRef} className="absolute inset-0" />

        {/* Loading overlay */}
        {!isViewerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-20">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Preview arrow overlay */}
        {isViewerReady && arrowScreenX !== null && (
          <PreviewArrow
            screenX={arrowScreenX}
            isInFront={isInFront}
            isDragging={isDraggingArrow}
            onDragStart={() => setIsDraggingArrow(true)}
            onDragEnd={() => setIsDraggingArrow(false)}
            onDrag={(clientX) => handleArrowDrag(clientX)}
          />
        )}

        {/* Degree badge — always visible in corner */}
        {isViewerReady && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs font-mono px-2 py-1 rounded-md border border-white/10 z-20 select-none">
            {previewDegree.toFixed(1)}°
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center select-none">
        Drag the panorama to look around · Drag the arrow to reposition
      </p>
    </div>
  );
}
