import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTours, useCreateTour, useDeleteTour, useTogglePublish, useToggleDefault } from '@/hooks/useTour';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TourCard } from '@/components/admin/TourCard';
import { slugify } from '@/utils/formatters';
import type { Tour } from '@/types/tour';

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens'),
  description: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

export function ToursPage() {
  const { data: tours, isLoading, isError, error, refetch } = useTours();
  const createTour = useCreateTour();
  const deleteTour = useDeleteTour();
  const togglePublish = useTogglePublish();
  const toggleDefault = useToggleDefault();

  const [createOpen, setCreateOpen] = useState(false);
  const [deletingTour, setDeletingTour] = useState<Tour | null>(null);
  const [publishingTour, setPublishingTour] = useState<Tour | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('slug', slugify(e.target.value));
  };

  const onSubmit = async (data: CreateForm) => {
    await createTour.mutateAsync(data);
    reset();
    setCreateOpen(false);
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
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Tours</h1>
        <Button
          variant="primary"
          className="h-10 px-4 text-sm whitespace-nowrap"
          onClick={() => setCreateOpen(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Tour
        </Button>
      </div>

      {/* Tour grid */}
      {!tours || tours.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" />
            </svg>
          }
          message="No tours yet"
          description="Create your first 360° tour to get started."
          action={{ label: 'Create Tour', onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onTogglePublish={(t) => setPublishingTour(t)}
              onToggleDefault={(t) => toggleDefault.mutate({ id: t.id, is_default: !t.is_default })}
              onDelete={(t) => setDeletingTour(t)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); reset(); }}
        title="Create new tour"
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
              Create tour
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Title"
            placeholder="My amazing tour"
            error={errors.title?.message}
            {...register('title', { onChange: onTitleChange })}
          />
          <Input
            label="Slug"
            placeholder="my-amazing-tour"
            hint="Used in the URL. Auto-generated from title."
            error={errors.slug?.message}
            {...register('slug')}
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="A brief description of this tour…"
              className="border border-gray-300 rounded-md px-3 py-2 text-base text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent resize-none"
              {...register('description')}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deletingTour}
        onClose={() => setDeletingTour(null)}
        onConfirm={async () => {
          if (deletingTour) {
            await deleteTour.mutateAsync(deletingTour.id);
          }
        }}
        title="Delete tour"
        description={`This will permanently delete "${deletingTour?.title}" and all its scenes. This action cannot be undone.`}
        confirmLabel="Delete tour"
        confirmText={deletingTour?.title}
        variant="danger"
      />

      {/* Publish toggle confirm */}
      <ConfirmDialog
        open={!!publishingTour}
        onClose={() => setPublishingTour(null)}
        onConfirm={async () => {
          if (publishingTour) {
            await togglePublish.mutateAsync({
              id: publishingTour.id,
              is_published: !publishingTour.is_published,
            });
          }
        }}
        title={publishingTour?.is_published ? 'Unpublish tour' : 'Publish tour'}
        description={
          publishingTour?.is_published
            ? `"${publishingTour?.title}" will no longer be visible to the public.`
            : `"${publishingTour?.title}" will become publicly accessible.`
        }
        confirmLabel={publishingTour?.is_published ? 'Unpublish' : 'Publish'}
        variant="primary"
      />
    </div>
  );
}
