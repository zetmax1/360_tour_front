interface ViewerControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function ViewerControls({ onZoomIn, onZoomOut }: ViewerControlsProps) {
  return (
    <div className="absolute right-3 bottom-32 sm:bottom-8 z-10 flex flex-col gap-2">
      <button
        type="button"
        onClick={onZoomIn}
        aria-label="Zoom in"
        className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xl font-light flex items-center justify-center active:scale-95 transition-transform"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomOut}
        aria-label="Zoom out"
        className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xl font-light flex items-center justify-center active:scale-95 transition-transform"
      >
        −
      </button>
    </div>
  );
}
