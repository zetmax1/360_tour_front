import { Link } from 'react-router-dom';

/**
 * Shared public navbar — sticky, dark background with glass blur and 360 logo.
 */
export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-gray-950/80 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo / App name */}
        <Link to="/tours" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">360</span>
          </div>
          <span className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors">
            Virtual Tour
          </span>
        </Link>
      </div>
    </nav>
  );
}
