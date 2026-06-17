import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '@/components/ui/Modal';
import { LinkForm } from './LinkForm';
import { LinkPreviewPanel } from './LinkPreviewPanel';
import { useCreateLink, useUpdateLink } from '@/hooks/useLink';
import type { Scene } from '@/types/scene';
import type { SceneLink } from '@/types/link';

interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  scene: Scene;               // the CURRENT scene (we preview its panorama)
  link?: SceneLink | null;    // null = create, defined = edit
  availableScenes: Scene[];   // all other scenes in the tour
}

const linkSchema = z.object({
  to_scene_id: z.string().uuid('Please select a destination scene'),
  degree: z
    .number()
    .min(0, 'Degree must be 0 or greater')
    .max(359.9, 'Degree must be less than 360'),
  label: z.string().max(60, 'Label too long').optional().nullable(),
});

type LinkFormValues = z.infer<typeof linkSchema>;

export function LinkModal({
  isOpen,
  onClose,
  scene,
  link,
  availableScenes,
}: LinkModalProps) {
  const createLink = useCreateLink(scene.id);
  const updateLink = useUpdateLink(scene.id);

  // Shared degree state — controlled between form and preview
  const { register, watch, setValue, handleSubmit, control, reset, formState: { errors } } =
    useForm<LinkFormValues>({
      resolver: zodResolver(linkSchema),
      defaultValues: {
        to_scene_id: link?.to_scene_id ?? '',
        degree: link?.degree ?? 0,
        label: link?.label ?? '',
      },
    });

  // Reset form when modal is opened/closed or link changes
  useEffect(() => {
    if (isOpen) {
      reset({
        to_scene_id: link?.to_scene_id ?? '',
        degree: link?.degree ? Math.round(link.degree * 10) / 10 : 0,
        label: link?.label ?? '',
      });
    }
  }, [isOpen, link, reset]);

  // Watch degree in real time — drives the live preview
  const liveDegree = watch('degree');

  const onSubmit = async (data: LinkFormValues) => {
    try {
      if (link) {
        await updateLink.mutateAsync({
          linkId: link.id,
          payload: {
            degree: data.degree,
            label: data.label || null,
          },
        });
      } else {
        await createLink.mutateAsync({
          from_scene_id: scene.id,
          to_scene_id: data.to_scene_id,
          degree: data.degree,
          label: data.label || null,
        });
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const fullImageUrl = scene.image_url
    ? (scene.image_url.startsWith('http')
      ? scene.image_url
      : `${import.meta.env.VITE_STATIC_BASE_URL}${scene.image_url}`)
    : '';

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={link ? 'Edit Link' : 'Add Navigation Link'}
      size="xl"          // wider than default to fit two panels
    >
      {/* Two-panel layout */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT — Form */}
        <div className="flex flex-col gap-4 lg:w-72 flex-shrink-0">
          <LinkForm
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            availableScenes={availableScenes}
            editingLink={link || null}
            isPending={createLink.isPending || updateLink.isPending}
            onCancel={onClose}
            onSubmit={handleSubmit(onSubmit)}
          />
        </div>

        {/* RIGHT — Live preview */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 mb-2 select-none">
            Preview — where this cursor will appear
          </p>
          <LinkPreviewPanel
            sceneImageUrl={fullImageUrl}
            initialYaw={scene.initial_yaw}
            previewDegree={liveDegree ?? 0}
            onDegreeChange={(deg) =>
              setValue('degree', deg, { shouldValidate: true })
            }
          />
        </div>

      </div>
    </Modal>
  );
}
