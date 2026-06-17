import React from 'react';

interface PreviewArrowProps {
  screenX: number;           // pixel X position on the viewer
  isInFront: boolean;        // true = link is facing us (pulse)
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrag: (clientX: number) => void;
}

export function PreviewArrow({
  screenX,
  isInFront,
  isDragging,
  onDragStart,
  onDragEnd,
  onDrag,
}: PreviewArrowProps) {

  // Pointer events — works on mouse AND touch
  function handlePointerDown(e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();   // prevent panorama from rotating when dragging arrow
    (e.target as Element).setPointerCapture(e.pointerId);
    onDragStart();
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    e.preventDefault();
    onDrag(e.clientX);
  }

  function handlePointerUp(e: React.PointerEvent) {
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch { /* ignore */ }
    onDragEnd();
  }

  return (
    <div
      className="absolute bottom-[20%] z-10"
      style={{
        left: screenX,
        transform: 'translateX(-50%)',
        transition: isDragging ? 'none' : 'left 0.05s linear',
        // Smooth when degree changes via typing/compass,
        // instant when dragging (no lag)
      }}
    >
      {/* Outer drag handle — large touch target */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`
          flex flex-col items-center gap-1 cursor-grab
          ${isDragging ? 'cursor-grabbing' : ''}
          select-none
        `}
      >
        {/* Arrow icon — matches the viewer's navigation cursor style */}
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center
          border-2 transition-all duration-150
          ${isInFront
            ? 'bg-blue-500/90 border-blue-300 shadow-lg shadow-blue-500/40 scale-110'
            : 'bg-white/25 border-white/50'
          }
          ${isDragging ? 'scale-125 bg-blue-400/90' : ''}
        `}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 4L12 20M12 4L6 10M12 4L18 10"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Drag hint — shown only when not dragging */}
        {!isDragging && (
          <span className="text-white text-[10px] font-medium
                           bg-black/50 px-1.5 py-0.5 rounded
                           whitespace-nowrap pointer-events-none">
            drag to move
          </span>
        )}
      </div>

      {/* Vertical line from arrow down to horizon */}
      <div className="absolute top-full left-1/2 -translate-x-1/2
                      w-px bg-white/40 h-8 pointer-events-none" />
    </div>
  );
}
