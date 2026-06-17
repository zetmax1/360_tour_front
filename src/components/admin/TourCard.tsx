import { useNavigate } from 'react-router-dom';
import type { Tour } from '@/types/tour';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getImageUrl } from '@/utils/formatters';

interface TourCardProps {
  tour: Tour;
  onTogglePublish: (tour: Tour) => void;
  onToggleDefault: (tour: Tour) => void;
  onDelete: (tour: Tour) => void;
}

export function TourCard({ tour, onTogglePublish, onToggleDefault, onDelete }: TourCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
      {/* Cover image */}
      <div className="aspect-video bg-gray-100 relative">
        {tour.cover_image_url ? (
          <img
            src={getImageUrl(tour.cover_image_url)}
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {tour.is_default && (
            <Badge variant="warning">
              Default
            </Badge>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <Badge variant={tour.is_published ? 'success' : 'neutral'}>
            {tour.is_published ? 'Published' : 'Draft'}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{tour.title}</h3>
        {tour.description && (
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{tour.description}</p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          {tour.scenes_count ?? 0} scene{(tour.scenes_count ?? 0) !== 1 ? 's' : ''} · Updated {formatDate(tour.updated_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/admin/tours/${tour.id}`)}
          className="flex-1 h-11 md:h-9 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 active:bg-gray-100 active:scale-95 transition-all"
        >
          Edit
        </button>
        <button
          onClick={() => onTogglePublish(tour)}
          className="flex-1 h-11 md:h-9 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 active:bg-gray-100 active:scale-95 transition-all"
        >
          {tour.is_published ? 'Unpublish' : 'Publish'}
        </button>
        <button
          onClick={() => onToggleDefault(tour)}
          title={tour.is_default ? 'Remove default' : 'Set as default'}
          className={`h-11 md:h-9 px-3 flex items-center justify-center rounded-lg border transition-all active:scale-95 ${
            tour.is_default
              ? 'text-yellow-600 bg-yellow-50 border-yellow-100'
              : 'text-gray-400 hover:text-yellow-600 bg-gray-50 border-gray-200'
          }`}
        >
          <svg className="w-4 h-4" fill={tour.is_default ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.772-.57-.37-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(tour)}
          aria-label="Delete tour"
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
