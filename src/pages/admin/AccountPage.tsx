import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import api from '@/api/client';

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
});

type PasswordForm = z.infer<typeof passwordSchema>;

export function AccountPage() {
  const user = useAuthStore((s) => s.user);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data: PasswordForm) => {
    try {
      await api.post('/auth/change-password', data);
      toast.success('Password changed successfully');
      reset();
    } catch {
      toast.error('Failed to change password');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My account</h1>
        <p className="text-xs text-gray-500 mt-0.5">Manage your user profile and security settings.</p>
      </div>

      <div className="space-y-6">
        {/* Info card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile details</h3>
          <div className="space-y-3">
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">Email address</span>
              <span className="text-sm text-gray-900 font-medium">{user?.email}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 uppercase">Role</span>
              <span className="text-sm text-gray-900 font-medium capitalize">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Change password card */}
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Change password</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              error={errors.current_password?.message}
              {...register('current_password')}
            />
            <Input
              label="New password"
              type="password"
              error={errors.new_password?.message}
              {...register('new_password')}
            />
            <div className="flex flex-col sm:flex-row justify-end pt-4 sm:pt-2 mt-2 border-t border-gray-100">
              <Button type="submit" variant="primary" loading={isSubmitting} className="w-full sm:w-auto">
                Update password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
