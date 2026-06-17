import type { Scene } from '@/types/scene';

interface SceneSidebarProps {
  scenes: Scene[];
  currentSceneId: string;
  tourTitle: string;
  onSceneSelect: (sceneId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Collapsible left sidebar listing all scenes in the current tour.
 * Scenes are sorted by their order_index for manual ordering.
 * Clicking a scene name jumps directly to it.
 *
 * Background is nearly transparent so the panorama is clearly visible behind it.
 * Desktop: slides in from left, overlays the panorama.
 * Mobile: acts as a bottom-anchored drawer with a backdrop.
 */
export function SceneSidebar({
  scenes,
  currentSceneId,
  tourTitle,
  onSceneSelect,
  isOpen,
  onClose,
}: SceneSidebarProps) {
  // Sort scenes by order_index for manual ordering
  const sortedScenes = [...scenes].sort((a, b) => a.order_index - b.order_index);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel — nearly transparent so panorama shows clearly */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-30
          w-52 backdrop-blur-md
          border-r border-white/[0.08]
          flex flex-col
          transform transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ background: 'rgba(0, 0, 0, 0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] flex-shrink-0">
          <div className="min-w-0 flex-1">
            <span className="text-white/80 text-xs font-semibold uppercase tracking-wider block truncate">
              {tourTitle}
            </span>
            <span className="text-white/30 text-[10px] mt-0.5 block">
              {sortedScenes.length} scene{sortedScenes.length !== 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/70 transition-colors p-1 rounded ml-2 flex-shrink-0"
            aria-label="Close navigation"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable scene list */}
        <div className="flex-1 overflow-y-auto py-2 scene-sidebar-scroll">
          {sortedScenes.map((scene, index) => (
            <button
              key={scene.id}
              onClick={() => {
                onSceneSelect(scene.id);
                // On mobile, close sidebar after selection
                if (window.innerWidth < 1024) onClose();
              }}
              className={`
                w-full text-left px-4 py-2 flex items-center gap-2.5
                transition-all duration-150 group/scene
                ${scene.id === currentSceneId
                  ? 'bg-white/12 text-white border-l-2 border-blue-400'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/8 border-l-2 border-transparent'
                }
              `}
            >
              {/* Scene number */}
              <span className={`
                text-[11px] font-mono flex-shrink-0 w-5 text-right
                ${scene.id === currentSceneId
                  ? 'text-blue-400'
                  : 'text-white/25 group-hover/scene:text-white/40'
                }
              `}>
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Scene title */}
              <span className="text-[13px] leading-snug line-clamp-2">
                {scene.title}
              </span>

              {/* Entry point indicator */}
              {scene.is_entry_point && (
                <span className="ml-auto flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
