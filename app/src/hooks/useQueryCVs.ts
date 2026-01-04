import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllCVs, getCVById, createCV, updateCV, deleteCV } from '../services/cv.service';
import type { Resume } from '../types/resume';

// Query keys - centralizados para consistencia
export const cvKeys = {
  all: ['cvs'] as const,
  lists: () => [...cvKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...cvKeys.lists(), { filters }] as const,
  details: () => [...cvKeys.all, 'detail'] as const,
  detail: (id: string) => [...cvKeys.details(), id] as const,
};

/**
 * Hook para obtener todos los CVs
 */
export function useAllCVs() {
  return useQuery({
    queryKey: cvKeys.lists(),
    queryFn: getAllCVs,
  });
}

/**
 * Hook para obtener un CV por ID
 */
export function useCV(id: string | undefined) {
  return useQuery({
    queryKey: cvKeys.detail(id!),
    queryFn: () => getCVById(id!),
    enabled: !!id, // Solo hacer fetch si hay ID
  });
}

/**
 * Hook para crear un nuevo CV
 */
export function useCreateCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCV,
    onSuccess: (newCV) => {
      // Invalidar lista para que se recargue
      queryClient.invalidateQueries({ queryKey: cvKeys.lists() });
      
      // Agregar el nuevo CV al cache optimistically
      queryClient.setQueryData(cvKeys.detail(newCV.metadata.id), newCV);
    },
  });
}

/**
 * Hook para actualizar un CV existente
 */
export function useUpdateCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Resume }) => updateCV(id, data),
    onSuccess: () => {
      // Solo invalidar la lista, NO actualizar el cache del CV individual
      // Zustand ya tiene los datos actualizados, no queremos crear un loop
      queryClient.invalidateQueries({ queryKey: cvKeys.lists() });
      
      // NO hacer setQueryData aquí para evitar loop con auto-save
      // queryClient.setQueryData(cvKeys.detail(updatedCV.metadata.id), updatedCV);
    },
  });
}

/**
 * Hook para eliminar un CV
 */
export function useDeleteCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCV,
    onSuccess: (_data, deletedId) => {
      // Invalidar lista
      queryClient.invalidateQueries({ queryKey: cvKeys.lists() });
      
      // Remover del cache
      queryClient.removeQueries({ queryKey: cvKeys.detail(deletedId) });
    },
  });
}
