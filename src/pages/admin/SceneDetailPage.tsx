import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useScene, useUpdateScene, useScenesByTour } from '@/hooks/useScene';
import { useDeleteLink } from '@/hooks/useLink';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LinkRow } from '@/components/admin/LinkRow';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { LinkModal } from '@/components/admin/LinkModal';
import type { SceneLink } from '@/types/link';

const sceneEditSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().optional().nullable(),
  initial_yaw: z.number().min(0).max(359),
  order_index: z.number().min(0).int(),
  image_url: z.string().min(1, 'Image is required'),
});

type SceneEditForm = z.infer<typeof sceneEditSchema>;

export function SceneDetailPage() {
  const { tourId, sceneId } = useParams<{ tourId: string; sceneId: string }>();
  const { data: scene, isLoading: sceneLoading, isError: sceneError, error: sceneErr, refetch: refetchScene } =
    useScene(sceneId!);
  const { data: allScenes, isLoading: allScenesLoading } = useScenesByTour(tourId!);

  const updateScene = useUpdateScene(sceneId!, tourId!);
  const deleteLink = useDeleteLink(sceneId!);

  const [linkModalState, setLinkModalState] = useState<{
    open: boolean;
    link: SceneLink | null;
  }>({ open: false, link: null });
  const [deletingLink, setDeletingLink] = useState<SceneLink | null>(null);
  const [isChangingImage, setIsChangingImage] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'links'>('info');

  const {
    register: registerScene,
    handleSubmit: handleSubmitScene,
    setValue: setSceneValue,
    watch: watchScene,
    formState: { errors: sceneErrors, isDirty: isSceneDirty },
  } = useForm<SceneEditForm>({
    resolver: zodResolver(sceneEditSchema),
    values: scene
      ? {
          title: scene.title,
          description: scene.description,
          initial_yaw: scene.initial_yaw,
          order_index: scene.order_index,
          image_url: scene.image_url,
        }
      : undefined,
  });

  const currentImageUrl = watchScene('image_url');

  const onSceneSubmit = async (data: SceneEditForm) => {
    await updateScene.mutateAsync(data);
    setIsChangingImage(false);
  };

  const handleImageUploaded = (result: { url: string; filename: string }) => {
    setSceneValue('image_url', result.url, { shouldDirty: true });
  };

  if (sceneLoading || allScenesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-accent" />
      </div>
    );
  }

  if (sceneError) return <ErrorMessage error={sceneErr} onRetry={refetchScene} />;
  if (!scene) return null;

  // Destination choices must exclude this scene
  const destinationOptions = (allScenes ?? [])
    .filter((s) => s.id !== sceneId)
    .map((s) => ({ value: s.id, label: s.title }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/admin/tours" className="hover:text-gray-900 transition-colors">Tours</Link>
        <span>/</span>
        <Link to={`/admin/tours/${tourId}`} className="hover:text-gray-900 transition-colors">
          {allScenes?.[0]?.title ? 'Tour details' : 'Tour'}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{scene.title}</span>
      </nav>

      {/* Mobile Tabs */}
      <div className="flex lg:hidden bg-white p-1 rounded-lg border border-gray-200 mb-6 w-full">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'info' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Scene Info
        </button>
        <button
          onClick={() => setActiveTab('links')}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'links' ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Navigation links
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left: Info & image edit */}
        <div className={`bg-white rounded-lg border border-gray-200 p-4 sm:p-6 flex-col gap-6 ${activeTab === 'info' ? 'flex' : 'hidden lg:flex'}`}>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Scene information</h3>
            <p className="text-xs text-gray-500">Edit general properties and panorama resource.</p>
          </div>

          <form onSubmit={handleSubmitScene(onSceneSubmit)} className="space-y-4">
            <Input
              label="Scene title"
              placeholder="Main lobby"
              error={sceneErrors.title?.message}
              {...registerScene('title')}
            />

            <div className="flex flex-col gap-1">
              <label htmlFor="scene-desc" className="text-sm font-medium text-gray-700">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="scene-desc"
                rows={2}
                placeholder="A description of this space..."
                className="border border-gray-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                {...registerScene('description')}
              />
            </div>

            <Input
              label="Initial yaw angle (°)"
              type="number"
              min={0}
              max={359}
              error={sceneErrors.initial_yaw?.message}
              {...registerScene('initial_yaw', { valueAsNumber: true })}
            />

            <Input
              label="Display order"
              type="number"
              min={0}
              hint="Lower numbers appear first in the sidebar"
              error={sceneErrors.order_index?.message}
              {...registerScene('order_index', { valueAsNumber: true })}
            />

            {/* Panorama Image preview/upload */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700">Panorama image</span>
              {isChangingImage ? (
                <div className="space-y-2">
                  <ImageUploadZone onUploaded={handleImageUploaded} currentUrl={currentImageUrl} />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsChangingImage(false)}
                  >
                    Cancel change
                  </Button>
                </div>
              ) : (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={
                      currentImageUrl?.startsWith('http')
                        ? currentImageUrl
                        : `${import.meta.env.VITE_STATIC_BASE_URL}${currentImageUrl}`
                    }
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => setIsChangingImage(true)}
                    >
                      Change image
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                disabled={!isSceneDirty && !isChangingImage}
                loading={updateScene.isPending}
              >
                Save changes
              </Button>
            </div>
          </form>
        </div>

        {/* Right: Navigation Links */}
        <div className={`bg-white rounded-lg border border-gray-200 p-4 sm:p-6 flex-col h-fit ${activeTab === 'links' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Navigation Links</h3>
              <p className="text-xs text-gray-500">Define degree-based cursors to other scenes.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setLinkModalState({ open: true, link: null })}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Add link
            </Button>
          </div>

          {scene.links.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">No navigation links added yet.</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
              {scene.links.map((link) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  onEdit={(l) => setLinkModalState({ open: true, link: l })}
                  onDelete={(l) => setDeletingLink(l)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Link Modal */}
      <LinkModal
        isOpen={linkModalState.open}
        onClose={() => setLinkModalState({ open: false, link: null })}
        scene={scene}
        link={linkModalState.link}
        availableScenes={(allScenes ?? []).filter((s) => s.id !== sceneId)}
      />

      {/* Delete Link confirm */}
      <ConfirmDialog
        open={!!deletingLink}
        onClose={() => setDeletingLink(null)}
        onConfirm={async () => {
          if (deletingLink) {
            await deleteLink.mutateAsync(deletingLink.id);
          }
        }}
        title="Remove link"
        description={`Are you sure you want to remove the link to "${deletingLink?.to_scene_title}"?`}
        confirmLabel="Remove link"
        variant="danger"
      />
    </div>
  );
}
