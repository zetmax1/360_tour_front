import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toursApi } from '@/api/tours';
import { queryKeys } from '@/api/queryKeys';
import type { CreateTourPayload, UpdateTourPayload } from '@/types/tour';
import toast from 'react-hot-toast';

export function useTours() {
  return useQuery({
    queryKey: queryKeys.tours.all,
    queryFn: toursApi.list,
  });
}

export function usePublishedTours() {
  return useQuery({
    queryKey: queryKeys.tours.published,
    queryFn: toursApi.listPublished,
  });
}

export function useTourBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.tours.detail(slug),
    queryFn: () => toursApi.getBySlug(slug),
    enabled: !!slug,
  });
}

export function useTourById(id: string) {
  return useQuery({
    queryKey: queryKeys.tours.byId(id),
    queryFn: () => toursApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTourPayload) => toursApi.create(payload),
    onSuccess: (newTour) => {
      qc.setQueryData(queryKeys.tours.all, (old: any) => Array.isArray(old) ? [newTour, ...old] : old);
      qc.invalidateQueries({ queryKey: queryKeys.tours.all });
      toast.success('Tour created');
    },
    onError: () => toast.error('Failed to create tour'),
  });
}

export function useUpdateTour(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTourPayload) => toursApi.update(id, payload),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.tours.all });
      qc.invalidateQueries({ queryKey: queryKeys.tours.byId(id) });
      qc.invalidateQueries({ queryKey: queryKeys.tours.detail(updated.slug) });
      toast.success('Tour updated');
    },
    onError: () => toast.error('Failed to update tour'),
  });
}

export function useDeleteTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => toursApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.tours.all });
      toast.success('Tour deleted');
    },
    onError: () => toast.error('Failed to delete tour'),
  });
}

export function useTogglePublish() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_published }: { id: string; is_published: boolean }) =>
      toursApi.togglePublish(id, is_published),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.tours.all });
      qc.invalidateQueries({ queryKey: queryKeys.tours.byId(updated.id) });
      qc.invalidateQueries({ queryKey: queryKeys.tours.published });
      toast.success(updated.is_published ? 'Tour published' : 'Tour unpublished');
    },
    onError: () => toast.error('Failed to update tour'),
  });
}

export function useToggleDefault() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_default }: { id: string; is_default: boolean }) =>
      toursApi.toggleDefault(id, is_default),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.tours.all });
      qc.invalidateQueries({ queryKey: queryKeys.tours.byId(updated.id) });
      qc.invalidateQueries({ queryKey: queryKeys.tours.published });
      toast.success(updated.is_default ? 'Set as default tour' : 'Removed default status');
    },
    onError: () => toast.error('Failed to update default status'),
  });
}
