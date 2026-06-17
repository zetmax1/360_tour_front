import type { AxiosError } from 'axios';
import { Button } from './Button';

interface ErrorMessageProps {
  error: Error | AxiosError | null | unknown;
  onRetry?: () => void;
  className?: string;
}

function extractMessage(error: unknown): string {
  if (!error) return 'An unexpected error occurred.';
  const axiosErr = error as { response?: { data?: { message?: string; detail?: string } }; message?: string };
  return (
    axiosErr.response?.data?.message ??
    axiosErr.response?.data?.detail ??
    axiosErr.message ??
    'An unexpected error occurred.'
  );
}

export function ErrorMessage({ error, onRetry, className }: ErrorMessageProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center gap-3 ${className ?? ''}`}>
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">Something went wrong</p>
        <p className="text-sm text-gray-500 mt-1">{extractMessage(error)}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
