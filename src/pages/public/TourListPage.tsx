import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublishedTours } from '@/hooks/useTour';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Navbar } from '@/components/public/Navbar';
import { HeroPanorama } from '@/components/public/HeroPanorama';
import { TourCardsStrip } from '@/components/public/TourCardsStrip';
import { getImageUrl } from '@/utils/formatters';

/**
 * Skeleton loader cards shown while tours are loading.
 */
function TourCardsSkeleton() {
  return (
    <div className="flex gap-5 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex-shrink-0 w-72 rounded-2xl overflow-hidden bg-gray-900 border border-white/5 animate-pulse"
        >
          <div className="h-40 bg-gray-800" />
          <div className="p-4 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-800 rounded w-1/2" />
            <div className="h-3 bg-gray-800 rounded w-2/3 mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TourListPage() {
  const navigate = useNavigate();
  const { data: tours, isLoading, isError, error, refetch } = usePublishedTours();

  // Auto-redirect: immediately begin default tour if published tours exist
  useEffect(() => {
    if (!isLoading && tours && tours.length > 0) {
      navigate(`/tour/${tours[0].slug}`, { replace: true });
    }
  }, [tours, isLoading, navigate]);

  // Show nothing while loading or redirecting to prevent flash of old design
  if (isLoading || (tours && tours.length > 0)) {
    return null;
  }

  // Featured tour = first published tour with a valid entry scene image
  const featuredTour = tours?.[0] ?? null;
  const heroImageUrl = featuredTour?.entry_scene_image_url
    ? getImageUrl(featuredTour.entry_scene_image_url)
    : null;

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <ErrorMessage error={error} onRetry={refetch} className="text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">
      <Navbar />

      {/* ── Hero section ── */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: '65vh', minHeight: '400px' }}
      >
        {/* Live panorama viewer — auto rotates */}
        {heroImageUrl ? (
          <HeroPanorama imageUrl={heroImageUrl} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}

        {/* Bottom gradient overlay — blends panorama into page bg */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none" />

        {/* Hero text overlay */}
        <div className="absolute inset-x-0 bottom-12 px-6 sm:px-12 pointer-events-none">
          <h1 className="text-3xl sm:text-5xl font-bold text-white drop-shadow-lg leading-tight">
            Explore virtual tours
          </h1>
          {featuredTour && (
            <p className="text-white/60 text-sm sm:text-base mt-2">
              Currently previewing: {featuredTour.title}
            </p>
          )}
        </div>

        {/* Loading overlay — shown while tours are loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/60">
            <Spinner size="lg" className="text-white" />
          </div>
        )}
      </section>

      {/* ── Tour cards horizontal strip ── */}
      <section className="px-6 sm:px-12 py-8">
        <h2 className="text-lg font-semibold text-white/80 mb-5">
          All tours
        </h2>

        {isLoading ? (
          <TourCardsSkeleton />
        ) : !tours || tours.length === 0 ? (
          <div className="bg-gray-900 rounded-xl border border-white/[0.08] p-8">
            <EmptyState
              message="No published tours yet"
              description="Please check back later or contact administrators."
            />
          </div>
        ) : (
          <TourCardsStrip tours={tours} />
        )}
      </section>
    </div>
  );
}
