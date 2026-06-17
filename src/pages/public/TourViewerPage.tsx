import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTourBySlug } from '@/hooks/useTour';

import { useViewer } from '@/hooks/useViewer';
import { useViewerStore } from '@/store/viewerStore';
import { PanoramaViewer } from '@/components/viewer/PanoramaViewer';
import { CursorOverlay } from '@/components/viewer/CursorOverlay';
import { SceneSidebar } from '@/components/viewer/SceneSidebar';
import { ViewerControls } from '@/components/viewer/ViewerControls';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useSceneTransition } from '@/hooks/useSceneTransition';
import { useScenePreloader } from '@/hooks/useScenePreloader';
import { getImageUrl } from '@/utils/formatters';
import { animateZoomOut } from '@/utils/degree';
import type { Scene } from '@/types/scene';
import type { SceneLink } from '@/types/link';

/** Auto-rotation speed in degrees/sec (negative = rotate right) */
const AUTO_ROTATE_SPEED = -1.2;

/** Creates a URL-friendly slug from a scene title */
const createSceneSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export function TourViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: tour, isLoading: tourLoading, isError: tourError, error: tourErr, refetch: refetchTour } =
    useTourBySlug(slug!);

  const [scenes, setScenes] = useState<Scene[]>([]);

  const [activeScene, setActiveScene] = useState<Scene | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoadingPanorama, setIsLoadingPanorama] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true); // ← open by default
  const [isAutoRotating, setIsAutoRotating] = useState(true); // auto-rotation on by default

  const containerRef = useRef<HTMLDivElement>(null);
  const { viewerRef, zoomIn, zoomOut } = useViewer();
  const setScene = useViewerStore((s) => s.setScene);
  const resetViewerStore = useViewerStore((s) => s.reset);
  const clearHistory = useViewerStore((s) => s.clearHistory);

  useScenePreloader(activeScene?.links ?? []);
  
  const { isTransitioning, overlayOpacity, fadeDuration, triggerTransition, completeTransition } = useSceneTransition();

  // Reset active scene when slug changes
  useEffect(() => {
    setActiveScene(null);
  }, [slug]);

  // 1. Derive scenes from tour when loaded
  useEffect(() => {
    if (!tour) return;
    const tourScenes = tour.scenes;
    if (tourScenes && tourScenes.length > 0) {
      setScenes(tourScenes);
      setActiveScene((current) => {
        if (current) {
          // If we already have an active scene, keep it but update its reference to the fresh one
          const updated = tourScenes.find((s: Scene) => s.id === current.id);
          return updated || current;
        }
        // Check hash for a scene slug
        const hashVal = window.location.hash.replace('#', '');
        if (hashVal) {
          const hashScene = tourScenes.find((s: Scene) => createSceneSlug(s.title) === hashVal);
          if (hashScene) {
            setScene(hashScene.id, null);
            return hashScene;
          }
        }

        // Otherwise, initialize to entry point
        const entry = tourScenes.find((s: Scene) => s.is_entry_point) ?? tourScenes[0];
        setScene(entry.id, null);
        return entry;
      });
    } else {
      setScenes([]);
      setActiveScene(null);
    }
  }, [tour, setScene]);

  // Cleanup on unmount
  useEffect(() => {
    clearHistory();
    return () => {
      resetViewerStore();
    };
  }, [resetViewerStore, clearHistory]);

  // Monitor fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ── Auto-rotation logic ──
  useEffect(() => {
    const viewer = viewerRef.current?.getInstance();
    if (!viewer) return;

    if (isAutoRotating) {
      viewer.startAutoRotate(AUTO_ROTATE_SPEED);
    } else {
      viewer.stopAutoRotate();
    }
  }, [isAutoRotating, viewerRef]);

  // When user interacts (drags), stop auto-rotation
  useEffect(() => {
    const viewer = viewerRef.current?.getInstance();
    if (!viewer) return;

    const handleMouseDown = () => {
      if (isAutoRotating) {
        setIsAutoRotating(false);
      }
    };

    const container = viewer.getContainer();
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('touchstart', handleMouseDown, { passive: true });

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('touchstart', handleMouseDown);
    };
  }, [isAutoRotating, viewerRef]);

  const toggleAutoRotation = useCallback(() => {
    setIsAutoRotating((prev) => !prev);
  }, []);

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleNavigate = (link: SceneLink) => {
    if (isTransitioning) return;
    
    // Stop auto-rotation during navigation
    setIsAutoRotating(false);

    triggerTransition(link, viewerRef.current?.getInstance() ?? null, {
      onSwapScene: async (l) => {
        setIsLoadingPanorama(true);
        const nextScene = scenes.find((s) => s.id === l.to_scene_id);
        if (nextScene) {
          window.history.replaceState(null, '', `#${createSceneSlug(nextScene.title)}`);
          setActiveScene(nextScene);
          setScene(nextScene.id, l.id);
        } else {
          console.error('Failed to load next scene: not found in tour scenes');
        }
      }
    });
  };

  /**
   * Direct scene jump from the sidebar.
   * No cursor animation — we just transition with a fade.
   */
  const handleJumpToScene = useCallback((sceneId: string) => {
    if (sceneId === activeScene?.id) return;

    const targetScene = scenes.find((s) => s.id === sceneId);
    if (!targetScene) return;

    // Simple fade transition — no yaw/zoom animation since it's a direct jump
    setIsLoadingPanorama(true);
    window.history.replaceState(null, '', `#${createSceneSlug(targetScene.title)}`);
    setActiveScene(targetScene);
    setScene(targetScene.id, null);
  }, [activeScene?.id, scenes, setScene]);

  const handlePanoramaLoad = useCallback(() => {
    setIsLoadingPanorama(false);

    // Start auto-rotation on new scene load if enabled
    if (isAutoRotating) {
      const viewer = viewerRef.current?.getInstance();
      if (viewer) {
        viewer.startAutoRotate(AUTO_ROTATE_SPEED);
      }
    }

    if (isTransitioning) {
      const viewerInstance = viewerRef.current?.getInstance();
      if (viewerInstance) {
        viewerInstance.setHfov(85, false);
        animateZoomOut(viewerInstance, 100, 250);
      }
      completeTransition();
    }
  }, [isTransitioning, isAutoRotating, completeTransition]);

  if (tourLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" className="text-accent" />
      </div>
    );
  }

  if (tourError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
        <ErrorMessage error={tourErr} onRetry={refetchTour} className="text-white" />
      </div>
    );
  }

  if (!tour || scenes.length === 0 || !activeScene) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-sm font-medium">This tour has no scenes yet.</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs text-accent hover:underline"
        >
          ← Back to tours
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {/* ── Full-screen panorama viewer ── */}
      <div className="absolute inset-0">
        <PanoramaViewer
          key={activeScene.id}
          ref={viewerRef}
          imageUrl={getImageUrl(activeScene.image_url)}
          initialYaw={activeScene.initial_yaw}
          initialPitch={0}
          onLoad={handlePanoramaLoad}
        />
      </div>

      {/* Blur-up placeholder while loading full panorama */}
      {isLoadingPanorama && activeScene.thumbnail_url && (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none z-10"
          style={{ filter: 'blur(20px)', transform: 'scale(1.05)' }}
        >
          <img
            src={getImageUrl(activeScene.thumbnail_url)}
            className="w-full h-full object-cover"
            aria-hidden
            alt=""
          />
        </div>
      )}

      {/* Transition overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none z-20"
        style={{
          opacity: overlayOpacity,
          transition: `opacity ${fadeDuration}ms ease-in-out`,
        }}
      />

      {/* Scene sidebar */}
      <SceneSidebar
        scenes={scenes}
        currentSceneId={activeScene.id}
        tourTitle={tour.title}
        onSceneSelect={handleJumpToScene}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Floating top-left: sidebar toggle ── */}
      {!sidebarOpen && (
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/50 transition-all"
            aria-label="Open scene list"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <rect x="2" y="4" width="14" height="1.5" rx="0.75" />
              <rect x="2" y="8.25" width="14" height="1.5" rx="0.75" />
              <rect x="2" y="12.5" width="14" height="1.5" rx="0.75" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Floating top-right: auto-rotation + fullscreen ── */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {/* Auto-rotation toggle */}
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-xl backdrop-blur-sm transition-all ${
            isAutoRotating
              ? 'bg-black/30 text-blue-400 hover:bg-black/50'
              : 'bg-black/30 text-white/60 hover:text-white hover:bg-black/50'
          }`}
          aria-label={isAutoRotating ? 'Stop auto-rotation' : 'Start auto-rotation'}
          onClick={toggleAutoRotation}
          title={isAutoRotating ? 'Stop rotation' : 'Start rotation'}
        >
          {isAutoRotating ? (
            /* Pause icon */
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            /* Play icon */
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5.14v14.72a1 1 0 001.5.86l11-7.36a1 1 0 000-1.72l-11-7.36A1 1 0 008 5.14z" />
            </svg>
          )}
        </button>

        {/* Fullscreen button */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-black/30 backdrop-blur-sm text-white/60 hover:text-white hover:bg-black/50 transition-all"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          onClick={handleFullscreenToggle}
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 9L4 4m0 0h5m-5 0v5M15 9l5-5m0 0h-5m5 0v5M9 15l-5 5m0 0h5m-5 0v-5M15 15l5 5m0 0h-5m5 0v-5" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>

      {/* Floating navigation cursors */}
      <CursorOverlay
        links={activeScene.links}
        onNavigate={handleNavigate}
      />

      {/* Zoom controls */}
      <ViewerControls
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
      />

      {/* Back button (bottom left) */}
      <div className="absolute left-4 bottom-4 z-20">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="bg-black/30 backdrop-blur-sm rounded-xl px-3 py-2 text-white/60 hover:text-white hover:bg-black/50 transition-all text-xs flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Leave tour
        </button>
      </div>
    </div>
  );
}
