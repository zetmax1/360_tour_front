import { CachePanel } from '@/components/admin/CachePanel';

export function SystemSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage backend systems, cache layers, and global configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Cache Management</h3>
          <p className="text-sm text-gray-500 mb-4">
            The application relies heavily on a Redis layer to cache complex scene graphs. 
            Use these controls to forcefully reset the cache if you notice inconsistencies 
            after performing direct database modifications.
          </p>
          <div className="max-w-md">
            <CachePanel />
          </div>
        </section>
      </div>
    </div>
  );
}
