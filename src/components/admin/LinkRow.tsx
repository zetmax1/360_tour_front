import { useState } from 'react';
import type { SceneLink } from '@/types/link';
import { Button } from '@/components/ui/Button';

interface LinkRowProps {
  link: SceneLink;
  onEdit: (link: SceneLink) => void;
  onDelete: (link: SceneLink) => void;
}

export function LinkRow({ link, onEdit, onDelete }: LinkRowProps) {
  const [deleteHover, setDeleteHover] = useState(false);

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
      {/* Arrow indicator */}
      <div
        className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 text-accent shrink-0"
        style={{ transform: `rotate(${link.degree}deg)` }}
        aria-hidden="true"
      >
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3l7 14H3L10 3z" />
        </svg>
      </div>

      {/* Label + destination */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          → {link.to_scene_title}
        </p>
        {link.label && (
          <p className="text-xs text-gray-500 truncate">{link.label}</p>
        )}
      </div>

      {/* Degree badge */}
      <span className="shrink-0 text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
        {link.degree.toFixed(0)}°
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <button
          onClick={() => onEdit(link)}
          aria-label={`Edit link to ${link.to_scene_title}`}
          className="h-10 px-3 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 active:bg-gray-100 active:scale-95 transition-all"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(link)}
          onMouseEnter={() => setDeleteHover(true)}
          onMouseLeave={() => setDeleteHover(false)}
          aria-label={`Delete link to ${link.to_scene_title}`}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-danger bg-red-50 border border-red-100 active:bg-red-100 active:scale-95 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
