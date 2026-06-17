import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scenesApi } from '@/api/scenes';
import { queryKeys } from '@/api/queryKeys';
import type { CreateScenePayload, UpdateScenePayload } from '@/types/scene';
import toast from 'react-hot-toast';

export function useScenesByTour(tourId: string) {
  return useQuery({
    queryKey: queryKeys.scenes.byTour(tourId),
    queryFn: () => scenesApi.listByTour(tourId),
    enabled: !!tourId,
  });
}

export function useScene(sceneId: string) {
  return useQuery({
    queryKey: queryKeys.scenes.detail(sceneId),
    queryFn: () => scenesApi.getById(sceneId),
    enabled: !!sceneId,
  });
}

export function useCreateScene(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateScenePayload) => scenesApi.create(payload),
    onSuccess: (newScene) => {
      qc.setQueryData(queryKeys.scenes.byTour(tourId), (old: any) => Array.isArray(old) ? [...old, newScene] : old);
      qc.invalidateQueries({ queryKey: queryKeys.scenes.byTour(tourId) });
      toast.success('Scene created');
    },
    onError: () => toast.error('Failed to create scene'),
  });
}

export function useUpdateScene(sceneId: string, tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateScenePayload) => scenesApi.update(sceneId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scenes.detail(sceneId) });
      qc.invalidateQueries({ queryKey: queryKeys.scenes.byTour(tourId) });
      toast.success('Scene saved');
    },
    onError: () => toast.error('Failed to update scene'),
  });
}

export function useDeleteScene(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sceneId: string) => scenesApi.delete(sceneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scenes.byTour(tourId) });
      toast.success('Scene deleted');
    },
    onError: () => toast.error('Failed to delete scene'),
  });
}

export function useSetEntryPoint(tourId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sceneId: string) => scenesApi.setEntryPoint(sceneId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.scenes.byTour(tourId) });
      toast.success('Entry point updated');
    },
    onError: () => toast.error('Failed to set entry point'),
  });
}
