import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toursApi } from '@/api/tours';
import { queryKeys } from '@/api/queryKeys';
import { getImageUrl } from '@/utils/formatters';
import type { Tour } from '@/types/tour';

interface TourCardProps {
  tour: Tour;
}

/**
 * Dark-themed card for a single tour in the horizontal strip.
 * Prefetches tour detail on hover/touch for instant first-scene load.
 */
export function TourCard({ tour }: TourCardProps) {
  const queryClient = useQueryClient();

  function handlePrefetch() {
    queryClient.prefetchQuery({
      queryKey: queryKeys.tours.detail(tour.slug),
      queryFn: () => toursApi.getBySlug(tour.slug),
      staleTime: 24 * 60 * 60 * 1000,
    });
  }

  return (
    <Link
      to={`/tour/${tour.slug}`}
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
      className="flex-shrink-0 w-72 snap-start group bg-gray-900 rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
    >
      {/* Cover image */}
      <div className="relative w-full overflow-hidden" style={{ height: '160px' }}>
        {tour.cover_image_url ? (
          <img
            src={getImageUrl(tour.cover_image_url)}
            alt={tour.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <svg className="w-10 h-10 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" />
            </svg>
          </div>
        )}

        {/* Scene count badge */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white/80 text-xs px-2 py-0.5 rounded-full">
          {tour.scenes_count ?? '?'} scenes
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-base leading-snug truncate">
          {tour.title}
        </h3>
        {tour.description && (
          <p className="text-white/50 text-xs mt-1 line-clamp-2 leading-relaxed">
            {tour.description}
          </p>
        )}

        {/* CTA */}
        <div className="mt-4 flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:text-blue-300 transition-colors">
          <span>Start tour</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}
