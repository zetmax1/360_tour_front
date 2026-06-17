import { useMutation, useQueryClient } from '@tanstack/react-query';
import { linksApi } from '@/api/links';
import { queryKeys } from '@/api/queryKeys';
import type { CreateLinkPayload, UpdateLinkPayload } from '@/types/link';
import toast from 'react-hot-toast';

export function useCreateLink(sceneId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLinkPayload) => linksApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scenes.detail(sceneId) });
      qc.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Link added');
    },
    onError: () => toast.error('Failed to add link'),
  });
}

export function useUpdateLink(sceneId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ linkId, payload }: { linkId: string; payload: UpdateLinkPayload }) =>
      linksApi.update(linkId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scenes.detail(sceneId) });
      qc.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Link updated');
    },
    onError: () => toast.error('Failed to update link'),
  });
}

export function useDeleteLink(sceneId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => linksApi.delete(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scenes.detail(sceneId) });
      qc.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Link removed');
    },
    onError: () => toast.error('Failed to remove link'),
  });
}
