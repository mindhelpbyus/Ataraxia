/**
 * API React Hooks
 * Custom hooks for easy API integration in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiException } from '../api/client';

/**
 * Generic hook for API calls with loading and error states
 */
export function useApiCall<T>(
  apiFunc: () => Promise<T>,
  deps: any[] = [],
  options: {
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiException) => void;
  } = {}
) {
  const { immediate = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<ApiException | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunc();
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN_ERROR'
      });
      setError(apiError);
      onError?.(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [apiFunc, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, deps);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return { data, loading, error, refetch, execute };
}

/**
 * Hook for mutations (create, update, delete operations)
 */
export function useMutation<TData, TVariables = void>(
  mutationFunc: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiException, variables: TVariables) => void;
  } = {}
) {
  const { onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiException | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);
      const result = await mutationFunc(variables);
      onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN_ERROR'
      });
      setError(apiError);
      onError?.(apiError, variables);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [mutationFunc, onSuccess, onError]);

  return { mutate, loading, error };
}

/**
 * Hook for paginated data
 */
export function usePaginatedApi<T>(
  apiFunc: (page: number, pageSize: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  initialPageSize: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiException | null>(null);

  const fetchPage = useCallback(async (pageNum: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunc(pageNum, pageSize);
      
      if (pageNum === 1) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }
      
      setTotal(result.total);
      setHasMore(result.hasMore);
      setPage(pageNum);
    } catch (err) {
      const apiError = err instanceof ApiException ? err : new ApiException({
        message: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN_ERROR'
      });
      setError(apiError);
    } finally {
      setLoading(false);
    }
  }, [apiFunc, pageSize]);

  useEffect(() => {
    fetchPage(1);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPage(page + 1);
    }
  }, [loading, hasMore, page, fetchPage]);

  const refresh = useCallback(() => {
    fetchPage(1);
  }, [fetchPage]);

  return {
    data,
    loading,
    error,
    page,
    total,
    hasMore,
    loadMore,
    refresh
  };
}

/**
 * Hook for real-time polling
 */
export function usePolling<T>(
  apiFunc: () => Promise<T>,
  interval: number = 5000, // 5 seconds default
  options: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: ApiException) => void;
  } = {}
) {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiException | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timeoutId: NodeJS.Timeout;

    async function poll() {
      if (cancelled) return;

      try {
        const result = await apiFunc();
        if (!cancelled) {
          setData(result);
          setError(null);
          onSuccess?.(result);
        }
      } catch (err) {
        if (!cancelled) {
          const apiError = err instanceof ApiException ? err : new ApiException({
            message: err instanceof Error ? err.message : 'Unknown error',
            code: 'UNKNOWN_ERROR'
          });
          setError(apiError);
          onError?.(apiError);
        }
      }

      if (!cancelled) {
        timeoutId = setTimeout(poll, interval);
      }
    }

    poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [apiFunc, interval, enabled, onSuccess, onError]);

  return { data, error };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticMutation<TData, TVariables = void>(
  mutationFunc: (variables: TVariables) => Promise<TData>,
  options: {
    optimisticUpdate?: (variables: TVariables) => TData;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: ApiException, variables: TVariables) => void;
    rollback?: (variables: TVariables) => void;
  } = {}
) {
  const { optimisticUpdate, onSuccess, onError, rollback } = options;
  const [data, setData] = useState<TData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiException | null>(null);

  const mutate = useCallback(async (variables: TVariables) => {
    try {
      setLoading(true);
      setError(null);

      // Apply optimistic update
      if (optimisticUpdate) {
        const optimisticData = optimisticUpdate(variables);
        setData(optimisticData);
      }

      // Perform actual mutation
      const result = await mutationFunc(variables);
      setData(result);
      onSuccess?.(result, variables);
      return result;
    } catch (err) {
      // Rollback on error
      if (rollback) {
        rollback(variables);
        setData(null);
      }

      const apiError = err instanceof ApiException ? err : new ApiException({
        message: err instanceof Error ? err.message : 'Unknown error',
        code: 'UNKNOWN_ERROR'
      });
      setError(apiError);
      onError?.(apiError, variables);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, [mutationFunc, optimisticUpdate, onSuccess, onError, rollback]);

  return { mutate, data, loading, error };
}
