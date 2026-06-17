import { Link } from 'react-router-dom';
import { useTours } from '@/hooks/useTour';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime, getImageUrl } from '@/utils/formatters';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import toast from 'react-hot-toast';

export function DashboardPage() {
  const { data: tours, isLoading, isError, error, refetch } = useTours();
  const user = useAuthStore((s) => s.user);

  const published = tours?.filter((t) => t.is_published).length ?? 0;
  const drafts = (tours?.length ?? 0) - published;
  const recentTours = [...(tours ?? [])].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  ).slice(0, 5);

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['admin', 'cache', 'stats'],
    queryFn: adminApi.getCacheStats,
    refetchInterval: 30_000,
  });

  const clearMutation = useMutation({
    mutationFn: adminApi.clearAllCache,
    onSuccess: (result) => {
      toast.success(result.message || 'Cache cleared');
      refetchStats();
    },
  });

  const warmMutation = useMutation({
    mutationFn: adminApi.warmCache,
    onSuccess: (result) => toast.success(result.message || 'Warming cache'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-accent" />
      </div>
    );
  }

  if (isError) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Welcome back{user ? `, ${user.email.split('@')[0]}` : ''}
        </h2>
        <p className="mt-1 text-sm text-gray-500">Here's what's happening with your tours.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-8">
        <StatCard label="Total Tours" value={tours?.length ?? 0} />
        <StatCard label="Published" value={published} accent />
        <StatCard label="Drafts" value={drafts} muted />
        
        {/* Cache Stats Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cache Hit Rate</p>
              <span className={`w-2 h-2 rounded-full ${stats?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.hit_rate ?? 0}%
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats?.tour360_keys ?? 0} keys cached</p>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => clearMutation.mutate()}
              disabled={clearMutation.isPending}
              className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              onClick={() => warmMutation.mutate()}
              disabled={warmMutation.isPending}
              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
            >
              Warm
            </button>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <Link
          to="/admin/tours"
          className="inline-flex items-center justify-center gap-2 px-4 h-11 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover active:scale-95 transition-all w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create new tour
        </Link>
        <Link
          to="/admin/tours"
          className="inline-flex items-center justify-center gap-2 px-4 h-11 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 active:bg-gray-100 active:scale-95 transition-all w-full sm:w-auto"
        >
          View all tours
        </Link>
      </div>

      {/* Recent activity */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Recently updated</h3>
        {recentTours.length === 0 ? (
          <p className="text-sm text-gray-500">No tours yet. Create your first one!</p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
            {recentTours.map((tour) => (
              <Link
                key={tour.id}
                to={`/admin/tours/${tour.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-md bg-gray-100 overflow-hidden shrink-0">
                  {tour.cover_image_url ? (
                    <img src={getImageUrl(tour.cover_image_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tour.title}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(tour.updated_at)}</p>
                </div>
                <Badge variant={tour.is_published ? 'success' : 'neutral'}>
                  {tour.is_published ? 'Published' : 'Draft'}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
  muted,
}: {
  label: string;
  value: number;
  accent?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p
        className={`mt-1.5 text-3xl font-bold ${accent ? 'text-accent' : muted ? 'text-gray-400' : 'text-gray-900'}`}
      >
        {value}
      </p>
    </div>
  );
}
