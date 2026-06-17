import { useNavigate } from 'react-router-dom';
import type { Scene } from '@/types/scene';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getImageUrl } from '@/utils/formatters';

interface SceneCardProps {
  scene: Scene;
  tourId: string;
  onSetEntryPoint: (scene: Scene) => void;
  onDelete: (scene: Scene) => void;
}

export function SceneCard({ scene, tourId, onSetEntryPoint, onDelete }: SceneCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 relative">
        {scene.thumbnail_url ? (
          <img
            src={getImageUrl(scene.thumbnail_url)}
            alt={scene.title}
            className="w-full h-full object-cover"
          />
        ) : scene.image_url ? (
          <img
            src={getImageUrl(scene.image_url)}
            alt={scene.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {scene.is_entry_point && (
          <div className="absolute top-2 left-2">
            <Badge variant="info">Entry Point</Badge>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
          {scene.links.length} link{scene.links.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{scene.title}</h3>
        {scene.description && (
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{scene.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-400">Initial yaw: {scene.initial_yaw}°</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/admin/tours/${tourId}/scenes/${scene.id}`)}
          className="flex-1 h-11 md:h-9 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 active:bg-gray-100 active:scale-95 transition-all"
        >
          Edit
        </button>
        {!scene.is_entry_point && (
          <button
            onClick={() => onSetEntryPoint(scene)}
            className="flex-1 h-11 md:h-9 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 active:bg-gray-100 active:scale-95 transition-all"
          >
            Set Entry
          </button>
        )}
        <button
          onClick={() => onDelete(scene)}
          aria-label="Delete scene"
          className="h-11 md:h-9 px-3 flex items-center justify-center text-sm text-danger bg-red-50 rounded-lg border border-red-100 active:bg-red-100 active:scale-95 transition-all"
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
