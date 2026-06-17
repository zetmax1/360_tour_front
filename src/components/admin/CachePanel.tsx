import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '@/api/admin';
import { Button } from '@/components/ui/Button';

function StatCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded p-2 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  );
}

export function CachePanel() {
  const { data: stats, refetch } = useQuery({
    queryKey: ['admin', 'cache', 'stats'],
    queryFn: adminApi.getCacheStats,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  const clearMutation = useMutation({
    mutationFn: adminApi.clearAllCache,
    onSuccess: (result) => {
      toast.success(result.message || `Cleared cache keys. Re-warming...`);
      refetch();
    },
    onError: () => toast.error('Cache clear failed'),
  });
  
  const warmMutation = useMutation({
    mutationFn: adminApi.warmCache,
    onSuccess: (result) => {
      toast.success(result.message || 'Cache warmup started');
    },
    onError: () => toast.error('Cache warm failed'),
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">System Cache</h2>
        <span className={`flex items-center gap-1.5 text-xs font-medium ${stats?.connected ? 'text-green-600' : 'text-red-500'}`}>
          <span className={`w-2 h-2 rounded-full ${stats?.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          {stats?.connected ? 'Redis connected' : 'Redis disconnected'}
        </span>
      </div>

      {stats?.connected && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <StatCell label="Hit Rate" value={`${stats.hit_rate}%`} />
          <StatCell label="Keys" value={stats.tour360_keys} />
          <StatCell label="Hits" value={stats.hits} />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Button
          variant="danger"
          size="sm"
          loading={clearMutation.isPending}
          onClick={() => clearMutation.mutate()}
          className="w-full"
        >
          🗑 Clear all cache
        </Button>
        <Button
          variant="secondary"
          size="sm"
          loading={warmMutation.isPending}
          onClick={() => warmMutation.mutate()}
          className="w-full"
        >
          ♻ Warm cache
        </Button>
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Clear after manual db edits. Auto-warms after clear. {stats?.last_cleared ? `Last cleared: ${new Date(stats.last_cleared).toLocaleString()}` : ''}
      </p>
    </div>
  );
}
