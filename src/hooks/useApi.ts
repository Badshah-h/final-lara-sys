/**
 * Custom hook for API calls with loading and error states
 */
import { useState, useCallback, useEffect, useRef } from "react";
import { ApiError, apiService } from "@/services/api/base";

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error | ApiError) => void;
  autoExecute?: boolean;
  dependencies?: any[];
  skipCache?: boolean;
}

/**
 * Hook for making API calls with loading and error states
 * @param apiFunction The API function to call
 * @param options Options for the hook
 * @returns Object with data, loading state, error, and execute function
 */
export function useApi<T, P extends any[]>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions = {},
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | ApiError | null>(null);
  const requestIdRef = useRef<string>(
    Math.random().toString(36).substring(2, 9),
  );
  const isMountedRef = useRef<boolean>(true);

  // Default options
  const {
    onSuccess,
    onError,
    autoExecute = false,
    dependencies = [],
    skipCache = false,
  } = options;

  const execute = useCallback(
    async (...args: P) => {
      if (!isMountedRef.current) return null;

      setIsLoading(true);
      setError(null);

      try {
        const result = await apiFunction(...args);
        if (isMountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        if (isMountedRef.current) {
          setError(error);
          onError?.(error);
        }
        throw error;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [apiFunction, onSuccess, onError],
  );

  // Auto-execute the API call when dependencies change
  useEffect(() => {
    if (autoExecute) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExecute, ...dependencies]);

  // Cancel any pending requests when the component unmounts
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      apiService.cancelRequest(requestIdRef.current);
    };
  }, []);

  /**
   * Execute the API call with the registry
   * @param category The API category (e.g., 'auth', 'users')
   * @param endpoint The endpoint name within the category
   * @param pathParams Optional path parameters (e.g., { id: 123 })
   * @param data Optional request body data
   * @param queryParams Optional query parameters
   */
  const callApi = useCallback(
    async <R>(
      category: string,
      endpoint: string,
      pathParams?: Record<string, string | number>,
      data?: any,
      queryParams?: Record<string, any>,
    ): Promise<R> => {
      if (!isMountedRef.current) return null as unknown as R;

      setIsLoading(true);
      setError(null);

      try {
        const result = await apiService.callApi<R>(
          category,
          endpoint,
          pathParams,
          data,
          queryParams,
        );

        if (isMountedRef.current) {
          setData(result as unknown as T);
          onSuccess?.(result);
        }
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("An unknown error occurred");
        if (isMountedRef.current) {
          setError(error);
          onError?.(error);
        }
        throw error;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [onSuccess, onError],
  );

  return {
    data,
    isLoading,
    error,
    execute,
    callApi,
    reset: () => {
      setData(null);
      setError(null);
    },
  };
}
