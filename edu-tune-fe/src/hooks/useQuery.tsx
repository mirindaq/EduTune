import { useQuery as useReactQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';

interface CustomQueryOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  queryKey?: string[];
  staleTime?: number;
  gcTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number | boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
}

export function useQuery<T>(
  fetchFn: () => Promise<T>,
  options: CustomQueryOptions<T> = {}
) {

  const queryOptions: UseQueryOptions<T, Error> = {
    queryKey: options.queryKey || ['query'],
    queryFn: async () => {
      const response = await fetchFn();
      return response as T;
    },
    enabled: options.enabled,
    staleTime: options.staleTime || 0, // 5 phút
    gcTime: options.gcTime || 0, // 10 phút
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? true,
    retry: options.retry ?? 1,
    refetchOnMount: options.refetchOnMount ?? true,
    refetchOnReconnect: options.refetchOnReconnect ?? true,
  };

  const result = useReactQuery<T, Error>(queryOptions);

  if (result.isSuccess && options.onSuccess) {
    options.onSuccess(result.data);
  }

  if (result.isError && options.onError) {
    options.onError(result.error);
  }

  return result;
}
