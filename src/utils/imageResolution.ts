/**
 * Image resolution selection utilities.
 *
 * Selects _low, _medium, or _high resolution variants based on the
 * user's network conditions and device capabilities.
 *
 * Naming convention: "/scenes/abc123.jpg" → "/scenes/abc123_medium.jpg"
 */

export type ImageQuality = 'low' | 'medium' | 'high';

/**
 * Transform a base image URL into its resolution-specific variant.
 * Graceful fallback: in dev mode or if baseUrl is empty, returns the original.
 */
export function selectImageUrl(baseUrl: string, quality: ImageQuality): string {
  if (!baseUrl) return baseUrl;
  // In dev mode, multi-res files may not exist yet — use originals
  if (import.meta.env.DEV) return baseUrl;
  return baseUrl.replace(/\.(\w+)$/, `_${quality}.$1`);
}

/**
 * Detect the optimal image quality for the current device + network.
 *
 * Uses the Network Information API (when available) to pick a resolution
 * that balances quality vs. load speed. Falls back to screen width heuristics.
 */
export function getOptimalQuality(): ImageQuality {
  const connection = (navigator as any).connection;

  if (connection) {
    if (connection.saveData) return 'low';

    const etype = connection.effectiveType;
    if (etype === '4g') {
      return window.devicePixelRatio > 1.5 ? 'high' : 'medium';
    }
    if (etype === '3g') return 'low';
    if (etype === '2g' || etype === 'slow-2g') return 'low';
  }

  // Fallback: screen-width heuristic
  if (window.innerWidth <= 768) return 'medium';
  return 'high';
}
