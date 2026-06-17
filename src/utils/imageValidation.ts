/**
 * Client-side image validation for panorama uploads.
 * These checks run before the file is sent to the server to give instant feedback.
 * The server performs the same checks as authoritative validation — never trust client-only.
 */

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif'];
const MAX_SIZE_BYTES = 40 * 1024 * 1024; // 40 MB

/**
 * Validate a file is a valid equirectangular panorama image.
 * Returns an error string if invalid, null if valid.
 */
export async function validatePanoramaImage(file: File): Promise<string | null> {
  // 1. File type check (client-side MIME, not as secure as magic bytes but good for UX)
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, or WebP images are supported.';
  }

  // 2. File size check
  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    return `File is too large (${sizeMB} MB). Maximum is 30 MB.`;
  }

  // Note: Aspect ratio validation (2:1) has been relaxed to support 
  // cylindrical mobile panoramas and partial 360 shots.

  return null; // valid
}

