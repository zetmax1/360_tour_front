/**
 * Convert a link's degree + the viewer's current yaw into a screen X position.
 * The panorama maps 360° to screen width.
 *
 * @param linkDegree - Absolute compass bearing of the link (0–359, from DB)
 * @param currentYaw - Current viewer yaw from Pannellum.getYaw() (0–359, absolute)
 * @param viewerWidth - Width of the viewer container in pixels
 * @param hfov - Horizontal field of view
 *
 * NOTE: initialYaw is NOT a parameter here. Pannellum's getYaw() already
 * returns the absolute yaw accounting for initialYaw. Do not add initialYaw
 * to the calculation — it would double-count the rotation.
 *
 * @returns X position in pixels from the left edge
 */
export function degreeToScreenX(
  linkDegree: number,
  currentYaw: number,
  viewerWidth: number,
  hfov: number = 90
): number | null {
  if (viewerWidth <= 0) return null;

  // Calculate shortest angular distance from center [-180, 180]
  let diff = ((linkDegree - currentYaw) % 360 + 360) % 360;
  if (diff > 180) diff -= 360;

  // If the link is more than 90 degrees away, it's behind the camera
  if (Math.abs(diff) > 90) {
    return null;
  }

  // Calculate pixel position based on field of view
  const pixelsPerDegree = viewerWidth / hfov;
  const center = viewerWidth / 2;
  const screenX = center + (diff * pixelsPerDegree);

  // If you only want to render cursors that are strictly on-screen:
  // if (screenX < -50 || screenX > viewerWidth + 50) return null;

  return screenX;
}

/**
 * Normalize a degree value to 0–359 range.
 */
export function normalizeDegree(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Calculate angular difference between two compass degrees (smallest arc).
 * Returns a value in [-180, 180].
 */
export function angularDiff(a: number, b: number): number {
  let diff = ((b - a) + 360) % 360;
  if (diff > 180) diff -= 360;
  return diff;
}

/**
 * Returns true if the link's degree is within ±tolerance of the current yaw.
 */
export function isInRange(
  linkDegree: number,
  currentYaw: number,
  tolerance = 30
): boolean {
  return Math.abs(angularDiff(linkDegree, currentYaw)) <= tolerance;
}

/**
 * Returns true if a link is "in front of" the viewer (within ±threshold degrees).
 * Used to decide whether the cursor should pulse/glow.
 */
export function isLinkInFrontOfViewer(
  linkDegree: number,
  currentYaw: number,
  thresholdDegrees: number = 30
): boolean {
  const relative = ((linkDegree - currentYaw) + 360) % 360;
  // relative near 0 or near 360 = in front
  return relative <= thresholdDegrees || relative >= (360 - thresholdDegrees);
}

export function resolveOverlappingCursors(
  cursors: Array<{ id: string; screenX: number | null; link: any }>,
  minSpacing: number = 60
): Array<{ id: string; screenX: number; adjusted: boolean; link: any }> {
  // Filter out nulls first
  const visible = cursors.filter((c) => c.screenX !== null) as Array<{
    id: string;
    screenX: number;
    link: any;
  }>;

  const sorted = [...visible].sort((a, b) => a.screenX - b.screenX);
  const result = sorted.map((c) => ({ ...c, adjusted: false }));

  for (let i = 1; i < result.length; i++) {
    const prev = result[i - 1];
    const curr = result[i];
    if (curr.screenX - prev.screenX < minSpacing) {
      result[i] = { ...curr, screenX: prev.screenX + minSpacing, adjusted: true };
    }
  }
  return result;
}

// ── Transition animation utilities ───────────────────────────────────────────

/**
 * Smoothly rotate the Pannellum viewer's yaw toward a target degree.
 * Takes the shortest arc (handles 0/360 wraparound).
 */
export function animateYawToward(
  viewer: PannellumViewer,
  targetDegree: number,
  durationMs: number = 100,
): Promise<void> {
  return new Promise((resolve) => {
    const startYaw = viewer.getYaw();
    let delta = targetDegree - startYaw;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const startTime = performance.now();
    function frame(now: number) {
      const t = Math.min((now - startTime) / durationMs, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easeInOut
      viewer.setYaw(startYaw + delta * eased);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

/**
 * Smoothly zoom in (reduce hfov) to simulate physically walking toward the next scene.
 */
export function animateZoomIn(
  viewer: PannellumViewer,
  zoomAmount: number = 15,
  durationMs: number = 150,
): Promise<void> {
  return new Promise((resolve) => {
    const startHfov = viewer.getHfov();
    const targetHfov = Math.max(startHfov - zoomAmount, 40);
    const delta = targetHfov - startHfov;

    const startTime = performance.now();
    function frame(now: number) {
      const t = Math.min((now - startTime) / durationMs, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      viewer.setHfov(startHfov + delta * eased);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}

/**
 * Smoothly zoom out (increase hfov) after transitioning to a new scene.
 */
export function animateZoomOut(
  viewer: PannellumViewer,
  targetHfov: number = 100,
  durationMs: number = 250,
): Promise<void> {
  return new Promise((resolve) => {
    const startHfov = viewer.getHfov();
    const delta = targetHfov - startHfov;

    const startTime = performance.now();
    function frame(now: number) {
      const t = Math.min((now - startTime) / durationMs, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      viewer.setHfov(startHfov + delta * eased);
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  });
}
