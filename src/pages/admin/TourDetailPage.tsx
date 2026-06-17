import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTourById, useTogglePublish } from '@/hooks/useTour';
import { useScenesByTour, useCreateScene, useDeleteScene, useSetEntryPoint } from '@/hooks/useScene';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import toast from 'react-hot-toast';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Badge } from '@/components/ui/Badge';
import { SceneCard } from '@/components/admin/SceneCard';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import type { Scene } from '@/types/scene';

const addSceneSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional(),
  initial_yaw: z.number().min(0).max(359),
  order_index: z.number().min(0).int(),
  image_url: z.string().min(1, 'Image is required'),
  thumbnail_url: z.string().optional(),
});

type AddSceneForm = z.infer<typeof addSceneSchema>;

export function TourDetailPage() {
  const { tourId } = useParams<{ tourId: string }>();
  const { data: tour, isLoading: tourLoading, isError: tourError, error: tourErr, refetch: refetchTour } =
    useTourById(tourId!);
  const { data: scenes, isLoading: scenesLoading, isError: scenesError, error: scenesErr, refetch: refetchScenes } =
    useScenesByTour(tourId!);

  // const updateTour = useUpdateTour(tourId!);
  const togglePublish = useTogglePublish();
  const createScene = useCreateScene(tourId!);
  const deleteScene = useDeleteScene(tourId!);
  const setEntryPoint = useSetEntryPoint(tourId!);
  const clearCacheMutation = useMutation({
    mutationFn: () => adminApi.clearTourCache(tourId!),
    onSuccess: (result) => toast.success(result.message || 'Tour cache cleared'),
    onError: () => toast.error('Failed to clear tour cache'),
  });

  const [addSceneOpen, setAddSceneOpen] = useState(false);
  const [deletingScene, setDeletingScene] = useState<Scene | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedThumbUrl, setUploadedThumbUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset: resetScene,
    formState: { errors: sceneErrors, isSubmitting: sceneSubmitting },
  } = useForm<AddSceneForm>({
    resolver: zodResolver(addSceneSchema),
    defaultValues: { initial_yaw: 0, order_index: 0 },
  });

  const closeAddModal = () => {
    setAddSceneOpen(false);
    setStep(1);
    setUploadedImageUrl(null);
    setUploadedThumbUrl(null);
    resetScene();
  };

  const onSceneSubmit = async (data: AddSceneForm) => {
    await createScene.mutateAsync({
      ...data,
      tour_id: tourId!,
      thumbnail_url: uploadedThumbUrl ?? undefined,
    });
    closeAddModal();
  };

  const handleImageUploaded = (result: { url: string; thumbnail_url?: string; filename: string }) => {
    setUploadedImageUrl(result.url);
    if (result.thumbnail_url) setUploadedThumbUrl(result.thumbnail_url);
    setValue('image_url', result.url);
    setValue('thumbnail_url', result.thumbnail_url ?? '');
  };

  if (tourLoading || scenesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-accent" />
      </div>
    );
  }

  if (tourError) return <ErrorMessage error={tourErr} onRetry={refetchTour} />;
  if (scenesError) return <ErrorMessage error={scenesErr} onRetry={refetchScenes} />;
  if (!tour) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/tours" className="hover:text-gray-900 transition-colors">Tours</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{tour.title}</span>
      </nav>

      {/* Tour meta */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">{tour.title}</h2>
              <Badge variant={tour.is_published ? 'success' : 'neutral'}>
                {tour.is_published ? 'Published' : 'Draft'}
              </Badge>
            </div>
            {tour.description && (
              <p className="mt-1 text-sm text-gray-500">{tour.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-400 font-mono">/{tour.slug}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => togglePublish.mutate({ id: tourId!, is_published: !tour.is_published })}
              loading={togglePublish.isPending}
            >
              {tour.is_published ? 'Unpublish' : 'Publish'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              loading={clearCacheMutation.isPending}
              onClick={() => clearCacheMutation.mutate()}
            >
              Clear tour cache
            </Button>
            {tour.is_published && (
              <a
                href={`/tour/${tour.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Preview
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Scenes header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          Scenes <span className="text-gray-400 font-normal">({scenes?.length ?? 0})</span>
        </h3>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddSceneOpen(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add scene
        </Button>
      </div>

      {/* Scenes grid */}
      {!scenes || scenes.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          message="No scenes yet"
          description="Add panorama scenes to build your tour."
          action={{ label: 'Add Scene', onClick: () => setAddSceneOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {scenes.map((scene) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              tourId={tourId!}
              onSetEntryPoint={(s) => setEntryPoint.mutate(s.id)}
              onDelete={(s) => setDeletingScene(s)}
            />
          ))}
        </div>
      )}

      {/* Add Scene Modal — 2-step */}
      <Modal
        open={addSceneOpen}
        onClose={closeAddModal}
        title={step === 1 ? 'Add scene — Upload image' : 'Add scene — Details'}
        size="lg"
        footer={
          <>
            {step === 2 && (
              <Button variant="ghost" onClick={() => setStep(1)}>
                ← Back
              </Button>
            )}
            <Button variant="secondary" onClick={closeAddModal}>
              Cancel
            </Button>
            {step === 1 ? (
              <Button
                variant="primary"
                disabled={!uploadedImageUrl}
                onClick={() => setStep(2)}
              >
                Next →
              </Button>
            ) : (
              <Button
                variant="primary"
                loading={sceneSubmitting}
                onClick={handleSubmit(onSceneSubmit)}
              >
                Create scene
              </Button>
            )}
          </>
        }
      >
        {step === 1 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload a panorama image.
            </p>
            <ImageUploadZone onUploaded={handleImageUploaded} currentUrl={uploadedImageUrl} />
            {uploadedImageUrl && (
              <p className="text-xs text-green-600 font-medium">✓ Image ready — click Next to continue</p>
            )}
          </div>
        ) : (
          <form noValidate className="space-y-4">
            <input type="hidden" {...register('image_url')} />
            <Input
              label="Scene title"
              placeholder="Main lobby"
              error={sceneErrors.title?.message}
              {...register('title')}
            />
            <div className="flex flex-col gap-1">
              <label htmlFor="scene-description" className="text-sm font-medium text-gray-700">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="scene-description"
                rows={2}
                placeholder="Brief description of this scene…"
                className="border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                {...register('description')}
              />
            </div>
            <Input
              label="Initial yaw (°)"
              type="number"
              min={0}
              max={359}
              hint="The direction the viewer faces when entering this scene (0–359°)"
              error={sceneErrors.initial_yaw?.message}
              {...register('initial_yaw', { valueAsNumber: true })}
            />
            <Input
              label="Display order"
              type="number"
              min={0}
              hint="Lower numbers appear first in the sidebar"
              error={sceneErrors.order_index?.message}
              {...register('order_index', { valueAsNumber: true })}
            />
          </form>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deletingScene}
        onClose={() => setDeletingScene(null)}
        onConfirm={async () => {
          if (deletingScene) {
            await deleteScene.mutateAsync(deletingScene.id);
          }
        }}
        title="Delete scene"
        description={`This will permanently delete "${deletingScene?.title}" and all its links.`}
        confirmLabel="Delete scene"
        variant="danger"
      />
    </div>
  );
}
