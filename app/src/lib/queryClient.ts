import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos - datos frescos por 5 min
      retry: 1, // Solo reintenta una vez en caso de fallo
      refetchOnWindowFocus: false, // No refetch al volver a la pestaña
    },
    mutations: {
      retry: 0, // No reintentar mutations
    },
  },
});
