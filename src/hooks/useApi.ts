import { useState, useCallback, useEffect, useRef } from "react";
import { ApiError, apiService } from "@/services/api/base";

// Define the hook's options interface
interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error | ApiError) => void;
  autoExecute?: boolean;
  dependencies?: any[];
  skipCache?: boolean;
}

/**
 * Generic hook to make API calls with loading, error, and data state.
 * @param apiFunction - The API function that returns a Promise.
 * @param options - Optional hook behavior and callbacks.
 */
export function useApi<T = any, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | ApiError | null;
  execute: (...args: P) => Promise<T>;
  callApi: <R>(
    category: string,
    endpoint: string,
    pathParams?: Record<string, string | number>,
    payload?: any,
    queryParams?: Record<string, any>
  ) => Promise<R>;
  reset: () => void;
  hasExecuted: boolean; // Added state to track if the API has been executed
} {
  // State initialization
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | ApiError | null>(null);
  const [hasExecuted, setHasExecuted] = useState(false); // New state for tracking API execution

  const requestIdRef = useRef<string>(
    Math.random().toString(36).substring(2, 9)
  );
  const isMountedRef = useRef<boolean>(true);

  const {
    onSuccess,
    onError,
    autoExecute = false,
    dependencies = [],
    skipCache = false,
  } = options;

  /**
   * Executes the provided API function.
   */
  const execute = useCallback(
    async (...args: P): Promise<T> => {
      if (!isMountedRef.current) return null as unknown as T;

      setIsLoading(true);
      setError(null);
      setHasExecuted(true); // Mark as executed when function starts

      try {
        const result = await apiFunction(...args);
        if (isMountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }
        return result;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("An unknown error occurred");
        if (isMountedRef.current) {
          setError(errorObj);
          onError?.(errorObj);
        }
        throw errorObj;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [apiFunction, onSuccess, onError]
  );

  /**
   * Executes a generic API call via category/endpoint, bypassing the primary apiFunction.
   */
  const callApi = useCallback(
    async <R>(
      category: string,
      endpoint: string,
      pathParams?: Record<string, string | number>,
      payload?: any,
      queryParams?: Record<string, any>
    ): Promise<R> => {
      if (!isMountedRef.current) return null as unknown as R;

      setIsLoading(true);
      setError(null);

      try {
        const result = await apiService.callApi<R>(
          category,
          endpoint,
          pathParams,
          payload,
          queryParams
        );

        if (isMountedRef.current) {
          setData(result as unknown as T); // Cast required for type safety
          onSuccess?.(result as unknown as T);
        }

        return result;
      } catch (err) {
        const errorObj =
          err instanceof Error ? err : new Error("An unknown error occurred");
        if (isMountedRef.current) {
          setError(errorObj);
          onError?.(errorObj);
        }
        throw errorObj;
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [onSuccess, onError]
  );

  // Auto-execute API call based on dependencies
  useEffect(() => {
    if (autoExecute) {
      void execute(...([] as unknown as P));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExecute, ...dependencies]);

  // Clean up effect and cancel request on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      apiService.cancelRequest(requestIdRef.current);
    };
  }, []);

  // Return the API response and state
  return {
    data,
    isLoading,
    error,
    execute,
    callApi,
    reset: () => {
      setData(null);
      setError(null);
      setHasExecuted(false); // Reset the executed state
    },
    hasExecuted, // Track if the hook was executed
  };
}
