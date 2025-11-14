import type { AxiosResponse } from 'axios';
import { useState } from 'react';

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  onSettled?: () => void;
}

type MutationFn<T> = (variables: any) => Promise<T> | Promise<AxiosResponse<T>>;

export function useMutation<T>(
  mutationFn: MutationFn<T>,
  options: UseMutationOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const mutate = async (variables: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      const responseData = result instanceof Object && 'data' in result ? result.data : result;
      setData(responseData);
      options.onSuccess?.(responseData);
    
      return responseData;
    } catch (err) {
      setError(err);
      options.onError?.(err);
      throw err;
    } finally {
      setIsLoading(false);
      options.onSettled?.();
    }
  };

  return {
    mutate,
    data,
    isLoading,
    error,
  };
} 