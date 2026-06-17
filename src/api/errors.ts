export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public field: string | null = null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
