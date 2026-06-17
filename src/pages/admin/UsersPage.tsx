import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useUsers,
  useCreateUser,
  useToggleUserActive,
  useUpdateUserRole,
  useDeleteUser,
} from '@/hooks/useUsers';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatters';
import type { User } from '@/types/auth';

const createUserSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  role: z.enum(['admin', 'viewer']),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);
  const { data: users, isLoading, isError, error, refetch } = useUsers();

  const createUser = useCreateUser();
  const toggleUserActive = useToggleUserActive();
  const updateUserRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [statusTogglingUser, setStatusTogglingUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: 'viewer', password: 'password123' },
  });

  const onSubmit = async (data: CreateUserForm) => {
    await createUser.mutateAsync(data);
    reset();
    setCreateOpen(false);
  };

  const handleChangeRole = async (user: User, newRole: 'admin' | 'viewer') => {
    if (user.id === currentUser?.id) return;
    await updateUserRole.mutateAsync({ id: user.id, role: newRole });
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Users</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage administrative accounts and roles.</p>
        </div>
        <Button
          variant="primary"
          className="h-10 px-4 text-sm whitespace-nowrap w-full sm:w-auto"
          onClick={() => setCreateOpen(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
        >
          Add user
        </Button>
      </div>

      {/* Users table */}
      {!users || users.length === 0 ? (
        <EmptyState
          message="No users found"
          description="Create administrative accounts here."
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-900">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100 text-xs uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Role</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Created</th>
                  <th scope="col" className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium truncate max-w-xs">{u.email}</td>
                    <td className="px-6 py-4">
                      {u.id === currentUser?.id ? (
                        <span className="capitalize">{u.role}</span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleChangeRole(u, e.target.value as 'admin' | 'viewer')}
                          aria-label="Change user role"
                          className="bg-transparent border-0 font-medium text-gray-700 focus:ring-0 cursor-pointer text-sm p-0 capitalize hover:text-accent"
                        >
                          <option value="admin">Admin</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.is_active ? 'success' : 'neutral'}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== currentUser?.id && (
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setStatusTogglingUser(u)}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <button
                            onClick={() => setDeletingUser(u)}
                            aria-label="Delete user"
                            className="p-1.5 rounded-md text-gray-400 hover:text-danger hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="block md:hidden divide-y divide-gray-100">
            {users.map((u) => (
              <div key={u.id} className="p-4 flex flex-col gap-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900 truncate pr-2">
                    {u.email}
                  </div>
                  <Badge variant={u.is_active ? 'success' : 'neutral'}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500">Role</span>
                    {u.id === currentUser?.id ? (
                      <span className="text-sm capitalize font-medium">{u.role}</span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u, e.target.value as 'admin' | 'viewer')}
                        aria-label="Change user role"
                        className="bg-transparent border border-gray-300 rounded px-2 py-1 font-medium text-gray-700 text-sm p-0 capitalize focus:ring-accent"
                      >
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-xs text-gray-500">Created</span>
                    <span className="text-sm text-gray-700">{formatDate(u.created_at)}</span>
                  </div>
                </div>

                {u.id !== currentUser?.id && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100 mt-1">
                    <button
                      onClick={() => setStatusTogglingUser(u)}
                      className="flex-1 h-11 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg border border-gray-200 active:bg-gray-100 active:scale-95 transition-all"
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setDeletingUser(u)}
                      aria-label="Delete user"
                      className="h-11 px-3 flex items-center justify-center text-sm text-danger bg-red-50 rounded-lg border border-red-100 active:bg-red-100 active:scale-95 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); reset(); }}
        title="Add administrative user"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => { setCreateOpen(false); reset(); }}>
              Cancel
            </Button>
            <Button
              variant="primary"
              loading={isSubmitting}
              onClick={handleSubmit(onSubmit)}
            >
              Create user
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="staff@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Select
            label="Role"
            options={[
              { value: 'viewer', label: 'Viewer' },
              { value: 'admin', label: 'Admin' },
            ]}
            error={errors.role?.message}
            {...register('role')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
        </form>
      </Modal>

      {/* Confirm Deletion */}
      <ConfirmDialog
        open={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={async () => {
          if (deletingUser) {
            await deleteUser.mutateAsync(deletingUser.id);
          }
        }}
        title="Delete user"
        description={`This will permanently remove user "${deletingUser?.email}".`}
        confirmLabel="Delete user"
        variant="danger"
      />

      {/* Confirm Status Toggle */}
      <ConfirmDialog
        open={!!statusTogglingUser}
        onClose={() => setStatusTogglingUser(null)}
        onConfirm={async () => {
          if (statusTogglingUser) {
            await toggleUserActive.mutateAsync({
              id: statusTogglingUser.id,
              isActive: !statusTogglingUser.is_active,
            });
          }
        }}
        title={statusTogglingUser?.is_active ? 'Deactivate user' : 'Activate user'}
        description={
          statusTogglingUser?.is_active
            ? `User "${statusTogglingUser?.email}" will no longer be able to log in.`
            : `User "${statusTogglingUser?.email}" will regain account access.`
        }
        confirmLabel={statusTogglingUser?.is_active ? 'Deactivate' : 'Activate'}
        variant="primary"
      />
    </div>
  );
}
