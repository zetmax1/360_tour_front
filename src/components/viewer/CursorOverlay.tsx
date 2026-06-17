import { useRef } from 'react';
import type { SceneLink } from '@/types/link';
import { NavigationCursor } from './NavigationCursor';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { useViewerStore } from '@/store/viewerStore';
import { degreeToScreenX, resolveOverlappingCursors } from '@/utils/degree';

interface CursorOverlayProps {
  links: SceneLink[];
  onNavigate: (link: SceneLink) => void;
}

export function CursorOverlay({ links, onNavigate }: CursorOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useResizeObserver(containerRef);
  const { yaw, previousSceneId, history } = useViewerStore();

  const visitedSceneIds = new Set(history.map(h => h.sceneId));

  const filteredLinks = links.filter((link) => {
    const pointsToVisitedScene = visitedSceneIds.has(link.to_scene_id);

    if (!pointsToVisitedScene) {
      return true;
    }

    if (link.to_scene_id === previousSceneId) {
      const allBackLinksToSameScene = links.filter(
        l => l.to_scene_id === previousSceneId
      );
      return link.id === allBackLinksToSameScene[0].id;
    }

    return false;
  });

  // Pre-calculate screenX for all cursors and resolve overlaps
  const cursorPositions = filteredLinks.map((link) => ({
    id: link.id,
    screenX: degreeToScreenX(link.degree, yaw, width),
    link
  }));

  const resolvedPositions = resolveOverlappingCursors(cursorPositions, 60);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      aria-label="Navigation cursors"
    >
      {resolvedPositions.map((pos) => (
        <div key={pos.id} className="pointer-events-auto">
          <NavigationCursor
            link={pos.link}
            viewerWidth={width}
            onClick={onNavigate}
            resolvedScreenX={pos.screenX}
          />
        </div>
      ))}
    </div>
  );
}
