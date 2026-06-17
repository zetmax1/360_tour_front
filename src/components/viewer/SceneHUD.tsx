interface SceneHUDProps {
  tourTitle: string;
  sceneTitle: string;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function SceneHUD({ tourTitle, sceneTitle, onFullscreen, isFullscreen }: SceneHUDProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}>
      {/* Tour + Scene title */}
      <div className="flex items-center gap-2 max-w-[80vw]">
        <div className="bg-black/40 backdrop-blur-sm rounded-md px-3 py-1.5 pointer-events-auto flex items-center overflow-hidden">
          <span className="text-white/60 text-xs hidden sm:inline whitespace-nowrap">{tourTitle}</span>
          <span className="text-white/40 text-xs mx-1.5 hidden sm:inline">—</span>
          <span className="text-white text-sm sm:text-base font-medium truncate max-w-[60vw] sm:max-w-none">{sceneTitle}</span>
        </div>
      </div>

      {/* Fullscreen toggle */}
      {onFullscreen && (
        <button
          type="button"
          onClick={onFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          className="ml-2 flex-shrink-0 p-2 rounded-lg bg-white/10 text-white active:bg-white/20 active:scale-95 pointer-events-auto transition-transform"
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
      )}
    </div>
  );
}
