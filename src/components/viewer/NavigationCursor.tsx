import type { SceneLink } from '@/types/link';
import { useViewerStore } from '@/store/viewerStore';
import { degreeToScreenX, isInRange } from '@/utils/degree';
import { cn } from '@/utils/cn';

interface NavigationCursorProps {
  link: SceneLink;
  viewerWidth: number;
  onClick: (link: SceneLink) => void;
  resolvedScreenX?: number;
}

export function NavigationCursor({
  link,
  viewerWidth,
  onClick,
  resolvedScreenX,
}: NavigationCursorProps) {
  const { yaw, previousSceneId } = useViewerStore();
  const inRange = isInRange(link.degree, yaw, 30);
  const isBackLink = link.to_scene_id === previousSceneId;

  const screenX = resolvedScreenX !== undefined ? resolvedScreenX : degreeToScreenX(link.degree, yaw, viewerWidth);
  
  if (screenX === null) return null;

  return (
    <button
      type="button"
      onClick={() => onClick(link)}
      aria-label={isBackLink ? `Go back to ${link.to_scene_title}` : `Navigate to ${link.to_scene_title}`}
      className={cn(
        'absolute -translate-x-1/2 flex items-center justify-center w-14 h-14 rounded-full',
        'bg-white/20 backdrop-blur-sm border border-white/30',
        'active:scale-95 transition-transform duration-100',
        'focus:outline-none group',
        inRange ? 'animate-pulse_glow' : 'opacity-80 hover:opacity-100'
      )}
      style={{ left: screenX, bottom: 'max(80px, calc(80px + env(safe-area-inset-bottom)))' }}
    >
      {/* Arrow SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className={cn(
          'drop-shadow-lg transition-all duration-300 w-6 h-6',
          inRange ? 'drop-shadow-[0_0_12px_rgba(255,255,255,1)] scale-110' : 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] group-hover:scale-110'
        )}
        aria-hidden="true"
      >
        {/* Arrow body simplified */}
        <path
          d="M12 2 L22 22 L12 18 L2 22 Z"
          fill={inRange ? '#FFFFFF' : 'rgba(255,255,255,0.9)'}
          stroke={inRange ? '#2563EB' : 'rgba(0,0,0,0.6)'}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Inner accent */}
        {inRange && (
          <path
            d="M12 8 L18 20 L12 17 L6 20 Z"
            fill="#2563EB"
            opacity="0.6"
          />
        )}
      </svg>

      {/* Label - always visible now */}
      {link.label && (
        <span className={cn(
          'absolute -bottom-6 text-xs text-white/80 whitespace-nowrap',
          'hidden sm:block shadow-md px-2 py-0.5 rounded bg-black/60 backdrop-blur-md',
          'transition-all duration-200',
          inRange ? 'text-white bg-blue-600/80 scale-105' : 'group-hover:text-white'
        )}>
          {isBackLink ? `← ${link.label}` : link.label}
        </span>
      )}
    </button>
  );
}
