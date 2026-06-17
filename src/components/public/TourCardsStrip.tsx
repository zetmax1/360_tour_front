import { useRef } from 'react';
import { TourCard } from './TourCard';
import type { Tour } from '@/types/tour';

interface TourCardsStripProps {
  tours: Tour[];
}

/**
 * Horizontally scrollable strip of tour cards with
 * scroll-snap and desktop-only left/right arrow buttons.
 */
export function TourCardsStrip({ tours }: TourCardsStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);

  function scrollLeft() {
    stripRef.current?.scrollBy({ left: -320, behavior: 'smooth' });
  }
  function scrollRight() {
    stripRef.current?.scrollBy({ left: 320, behavior: 'smooth' });
  }

  return (
    <div className="relative group/strip">
      {/* Left scroll button — desktop only, visible on hover */}
      <button
        onClick={scrollLeft}
        className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-gray-900/80 border border-white/10 text-white items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity duration-200 hover:bg-gray-800 backdrop-blur-sm"
        aria-label="Scroll left"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Scrollable strip */}
      <div
        ref={stripRef}
        className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory tour-cards-strip"
      >
        {tours.map((tour) => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>

      {/* Right scroll button — desktop only */}
      <button
        onClick={scrollRight}
        className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-gray-900/80 border border-white/10 text-white items-center justify-center opacity-0 group-hover/strip:opacity-100 transition-opacity duration-200 hover:bg-gray-800 backdrop-blur-sm"
        aria-label="Scroll right"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
