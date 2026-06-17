/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_STATIC_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ── Pannellum CDN global ──────────────────────────────────────────────────────
interface PannellumConfig {
  type?: string;
  panorama?: string;
  autoLoad?: boolean;
  autoRotate?: number;
  autoRotateInactivityDelay?: number;
  showControls?: boolean;
  showFullscreenCtrl?: boolean;
  showZoomCtrl?: boolean;
  hfov?: number;
  minHfov?: number;
  maxHfov?: number;
  pitch?: number;
  yaw?: number;
  minPitch?: number;
  maxPitch?: number;
  compass?: boolean;
  northOffset?: number;
  preview?: string;
  author?: string;
  title?: string;
  strings?: Record<string, string>;
  draggable?: boolean;
  mouseZoom?: boolean | string;
  friction?: number;
  showLoadButton?: boolean;
  loadButtonLabel?: string;
  hotSpotDebug?: boolean;
}

interface PannellumViewer {
  getYaw(): number;
  getPitch(): number;
  getHfov(): number;
  setYaw(yaw: number, animated?: boolean, callback?: () => void): PannellumViewer;
  setPitch(pitch: number, animated?: boolean, callback?: () => void): PannellumViewer;
  setHfov(hfov: number, animated?: boolean, callback?: () => void): PannellumViewer;
  on(event: string, callback: (...args: unknown[]) => void): PannellumViewer;
  off(event: string, callback: (...args: unknown[]) => void): PannellumViewer;
  destroy(): void;
  isLoaded(): boolean;
  startAutoRotate(speed?: number): void;
  stopAutoRotate(): void;
  getConfig(): PannellumConfig;
  getContainer(): HTMLElement;
  addScene(sceneId: string, config: PannellumConfig): PannellumViewer;
  loadScene(sceneId: string, pitch?: number, yaw?: number, hfov?: number): void;
  getScene(): string;
}

declare const pannellum: {
  viewer(container: HTMLElement, config: Record<string, unknown>): PannellumViewer;
};
