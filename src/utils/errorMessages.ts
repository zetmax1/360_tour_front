const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED:          'Please log in to continue.',
  FORBIDDEN:             'You don\'t have permission to do that.',
  NOT_FOUND:             'The requested item was not found.',
  DUPLICATE_LINK:        'A link between these two scenes already exists.',
  SELF_LINK:             'A scene cannot link to itself.',
  INVALID_DEGREE:        'Degree must be between 0 and 359.',
  UPLOAD_TOO_LARGE:      'Image is too large. Maximum size is 30 MB.',
  INVALID_IMAGE_TYPE:    'Only JPEG, PNG, or WebP images are supported.',
  INVALID_ASPECT_RATIO:  'Panorama image must have a 2:1 aspect ratio (e.g. 4096×2048).',
  TOUR_NOT_PUBLISHED:    'This tour is not available yet.',
  VALIDATION_ERROR:      'Please check your input and try again.',
};

export function getErrorMessage(code: string, fallback?: string): string {
  return ERROR_MESSAGES[code] ?? fallback ?? 'Something went wrong. Please try again.';
}
