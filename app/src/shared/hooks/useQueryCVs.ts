import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllCVs, getCVById, createCV, updateCV, deleteCV } from '../services/cv.service';
import type { ResumeData } from '@resumate/schema';

export const cvKeys = {
  all: ['cvs'] as const,
  lists: () => [...cvKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...cvKeys.lists(), { filters }] as const,
  details: () => [...cvKeys.all, 'detail'] as const,
  detail: (id: string) => [...cvKeys.details(), id] as const,
};

export function useAllCVs() {
  return useQuery({
    queryKey: cvKeys.lists(),
    queryFn: getAllCVs,
  });
}

export function useCV(id: string | undefined) {
  return useQuery({
    queryKey: cvKeys.detail(id!),
    queryFn: () => getCVById(id!),
    enabled: !!id,
  });
}

export function useCreateCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResumeData) => createCV(data),
    onSuccess: (newCV) => {
      queryClient.invalidateQueries({ queryKey: cvKeys.lists() });
      queryClient.setQueryData(cvKeys.detail(newCV.id), newCV);
    },
  });
}

export function useUpdateCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ResumeData }) => updateCV(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cvKeys.lists() });
    },
  });
}

export function useDeleteCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCV,
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: cvKeys.lists() });
      queryClient.removeQueries({ queryKey: cvKeys.detail(deletedId) });
    },
  });
}
