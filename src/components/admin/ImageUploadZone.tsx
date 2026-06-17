import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { uploadApi } from '@/api/upload';
import { formatFileSize } from '@/utils/formatters';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/avif'];
const MAX_SIZE_MB = 40;
const POLL_INTERVAL_MS = 2000;

interface UploadResult {
  url: string;
  thumbnail_url?: string;
  filename: string;
}

interface ImageUploadZoneProps {
  onUploaded: (result: UploadResult) => void;
  currentUrl?: string | null;
  label?: string;
  validateAspectRatio?: boolean;
}

type UploadState =
  | { status: 'idle' }
  | { status: 'dragging' }
  | { status: 'uploading'; progress: number }
  | { status: 'processing'; uploadId: string; filename: string; imageUrl: string }
  | { status: 'success'; result: UploadResult }
  | { status: 'error'; message: string };

export function ImageUploadZone({
  onUploaded,
  currentUrl,
  label = 'Drag panorama image here or click to browse',
  validateAspectRatio = true,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [state, setState] = useState<UploadState>(
    currentUrl
      ? { status: 'success', result: { url: currentUrl, filename: 'Current image' } }
      : { status: 'idle' }
  );

  // ── Clean up polling on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ── Polling logic ─────────────────────────────────────────────────────
  const startPolling = useCallback(
    (uploadId: string, filename: string, imageUrl: string) => {
      if (pollRef.current) clearInterval(pollRef.current);

      pollRef.current = setInterval(async () => {
        try {
          const status = await uploadApi.getUploadStatus(uploadId);

          if (status.status === 'ready') {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;

            const result: UploadResult = {
              url: status.image_url || imageUrl,
              thumbnail_url: status.thumbnail_url || undefined,
              filename,
            };
            setState({ status: 'success', result });
            onUploaded(result);
          } else if (status.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setState({
              status: 'error',
              message: status.error_message || 'Image processing failed.',
            });
          }
          // If still 'processing' or 'pending', keep polling
        } catch {
          // Network glitch — keep retrying, don't kill the poll
        }
      }, POLL_INTERVAL_MS);
    },
    [onUploaded]
  );

  const validateFile = useCallback(
    (file: File): Promise<string | null> => {
      return new Promise((resolve) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          return resolve('Only JPEG, PNG, WebP, HEIC, or AVIF images are accepted.');
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          return resolve(`File exceeds ${MAX_SIZE_MB}MB limit (${formatFileSize(file.size)}).`);
        }
        
        // Aspect ratio validation relaxed to support mobile panoramas
        resolve(null);
      });
    },
    []
  );

  const processFile = useCallback(
    async (file: File) => {
      const error = await validateFile(file);
      if (error) {
        setState({ status: 'error', message: error });
        return;
      }

      setState({ status: 'uploading', progress: 0 });
      try {
        const result = await uploadApi.uploadSceneImage(file, (pct) => {
          setState({ status: 'uploading', progress: pct });
        });

        // The server accepted the file — now it's processing the poles in the background
        if (result.status === 'processing' || result.status === 'pending') {
          setState({
            status: 'processing',
            uploadId: result.upload_id,
            filename: file.name,
            imageUrl: result.image_url,
          });
          startPolling(result.upload_id, file.name, result.image_url);
        } else if (result.status === 'ready') {
          // Already done (shouldn't happen often, but handle it)
          const uploadResult: UploadResult = {
            url: result.image_url,
            thumbnail_url: result.thumbnail_url,
            filename: file.name,
          };
          setState({ status: 'success', result: uploadResult });
          onUploaded(uploadResult);
        } else {
          setState({ status: 'error', message: 'Upload failed unexpectedly.' });
        }
      } catch {
        setState({ status: 'error', message: 'Upload failed. Please try again.' });
      }
    },
    [validateFile, onUploaded, startPolling]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
      else setState({ status: 'idle' });
    },
    [processFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const reset = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setState({ status: 'idle' });
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-colors min-h-[160px]',
          state.status === 'idle' && 'border-gray-300 hover:border-gray-400 cursor-pointer bg-gray-50',
          state.status === 'dragging' && 'border-accent bg-blue-50 cursor-copy',
          state.status === 'uploading' && 'border-gray-200 bg-gray-50 cursor-default',
          state.status === 'processing' && 'border-amber-300 bg-amber-50 cursor-default',
          state.status === 'success' && 'border-green-300 bg-green-50',
          state.status === 'error' && 'border-danger bg-red-50',
        )}
        onDragOver={(e) => { e.preventDefault(); setState({ status: 'dragging' }); }}
        onDragLeave={() => setState({ status: 'idle' })}
        onDrop={handleDrop}
        onClick={() => (state.status === 'idle' || state.status === 'error') && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleChange}
          className="hidden"
          aria-label="Upload image"
        />

        {/* Idle */}
        {(state.status === 'idle') && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 font-medium">
              <span className="hidden md:inline">Drag image here or </span>
              <span className="text-blue-600 underline">tap to browse</span>
            </p>
            <p className="text-xs text-gray-400">JPEG, PNG, WebP, HEIC, AVIF · Max {MAX_SIZE_MB}MB</p>
          </div>
        )}

        {/* Dragging */}
        {state.status === 'dragging' && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium text-accent">Drop image here</p>
          </div>
        )}

        {/* Uploading */}
        {state.status === 'uploading' && (
          <div className="flex flex-col items-center justify-center py-8 gap-3 px-6">
            <p className="text-sm text-gray-600">Uploading… {state.progress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-accent h-2 rounded-full transition-all duration-150"
                style={{ width: `${state.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Processing (background pole-fix) */}
        {state.status === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8 gap-3 px-6">
            <div className="flex items-center gap-2">
              {/* Pulsing dot indicator */}
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <p className="text-sm text-amber-700 font-medium">
                Processing panorama
                <span className="inline-flex w-6 text-left">
                  <ProcessingDots />
                </span>
              </p>
            </div>
            <p className="text-xs text-amber-600/70">
              Fixing polar distortion — this takes a few seconds
            </p>
          </div>
        )}

        {/* Success */}
        {state.status === 'success' && (
          <div className="flex items-center gap-3 p-4">
            {state.result.url && (
              <img
                src={state.result.url.startsWith('http') || state.result.url.startsWith('blob:') || state.result.url.startsWith('data:') ? state.result.url : `${import.meta.env.VITE_STATIC_BASE_URL}${state.result.url}`}
                alt="Uploaded preview"
                className="w-16 h-10 object-cover rounded border border-gray-200 shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-700 truncate">{state.result.filename}</p>
              <p className="text-xs text-green-600">Upload successful</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="text-xs text-gray-500 hover:text-gray-700 underline shrink-0"
            >
              Change
            </button>
          </div>
        )}

        {/* Error */}
        {state.status === 'error' && (
          <div className="flex items-center gap-3 p-4">
            <svg className="w-5 h-5 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-danger flex-1">{state.message}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="text-xs text-gray-500 hover:text-gray-700 underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


/**
 * Animated "..." dots for the processing state.
 * Cycles through "", ".", "..", "..." every 500ms for a subtle pulsing effect.
 */
function ProcessingDots() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const id = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '' : d + '.'));
    }, 500);
    return () => clearInterval(id);
  }, []);

  return <>{dots}</>;
}
