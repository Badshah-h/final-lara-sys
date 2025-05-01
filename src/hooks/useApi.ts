import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/services/api/config";

// Define the hook's options interface
interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
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
  options: UseApiOptions<T> = {},
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  execute: (...args: P) => Promise<T>;
  callApi: <R>(
    endpoint: string,
    method: string,
    pathParams?: Record<string, string | number>,
    payload?: any,
    queryParams?: Record<string, any>,
  ) => Promise<R>;
  reset: () => void;
  hasExecuted: boolean; // Added state to track if the API has been executed
} {
  // State initialization
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasExecuted, setHasExecuted] = useState(false); // New state for tracking API execution

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
        // Ensure token is set for each request
        const token = localStorage.getItem("token");
        if (token) {
          // Set token in axios defaults
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

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
    [apiFunction, onSuccess, onError],
  );

  /**
   * Executes a generic API call via endpoint and method
   */
  const callApi = useCallback(
    async <R>(
      endpoint: string,
      method: string,
      pathParams?: Record<string, string | number>,
      payload?: any,
      queryParams?: Record<string, any>,
    ): Promise<R> => {
      if (!isMountedRef.current) return null as unknown as R;

      setIsLoading(true);
      setError(null);

      try {
        // Build the URL with path parameters
        let url = endpoint;
        if (pathParams) {
          Object.entries(pathParams).forEach(([key, value]) => {
            url = url.replace(`:${key}`, String(value));
          });
        }

        // Ensure token is set for each request
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        // Make the API call
        let response;
        const fullUrl = `${API_BASE_URL}${url}`;

        switch (method.toUpperCase()) {
          case "GET":
            response = await axios.get(fullUrl, { params: queryParams });
            break;
          case "POST":
            response = await axios.post(fullUrl, payload, {
              params: queryParams,
            });
            break;
          case "PUT":
            response = await axios.put(fullUrl, payload, {
              params: queryParams,
            });
            break;
          case "PATCH":
            response = await axios.patch(fullUrl, payload, {
              params: queryParams,
            });
            break;
          case "DELETE":
            response = await axios.delete(fullUrl, { params: queryParams });
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        const result = response.data;

        if (isMountedRef.current) {
          setData(result as unknown as T);
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
    [onSuccess, onError],
  );

  // Auto-execute API call based on dependencies
  useEffect(() => {
    if (autoExecute) {
      void execute(...([] as unknown as P));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExecute, ...dependencies]);

  // Clean up effect on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
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
