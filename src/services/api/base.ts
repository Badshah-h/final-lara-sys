/**
 * Base API service with common functionality for making HTTP requests
 * Configured for Laravel Sanctum session authentication
 */
import {
  API_BASE_URL,
  DEFAULT_HEADERS,
  REQUEST_TIMEOUT,
  ENABLE_CACHING,
  DEFAULT_CACHE_TIME,
  MAX_RETRIES,
  RETRY_DELAY,
  CSRF_ENABLED,
  CSRF_HEADER_NAME,
} from "./config";
import { apiCache } from "./cache";
import { getApiUrl, getEndpointDefinition } from "./registry";

export class ApiError extends Error {
  status: number;
  data: any;
  retryable: boolean;

  constructor(
    message: string,
    status: number,
    data?: any,
    retryable: boolean = true,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.retryable = retryable;
  }
}

type RequestInterceptor = (config: RequestInit) => RequestInit;
type ResponseInterceptor = (response: Response) => Promise<Response>;
type ErrorInterceptor = (error: ApiError) => Promise<any>;

export class BaseApiService {
  protected baseUrl: string;
  protected headers: HeadersInit;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(
    baseUrl: string = API_BASE_URL,
    headers: HeadersInit = DEFAULT_HEADERS,
  ) {
    this.baseUrl = baseUrl;
    this.headers = headers;
  }

  /**
   * Add a request interceptor
   * @param interceptor Function that receives and modifies the request config
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   * @param interceptor Function that receives and modifies the response
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add an error interceptor
   * @param interceptor Function that receives and handles errors
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Make a GET request
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    useCache: boolean = true,
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    const cacheKey = apiCache.generateKey(url, {});

    // Check cache if enabled and method is cacheable
    if (ENABLE_CACHING && useCache) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const response = await this.request<T>(
      url,
      {
        method: "GET",
        headers: this.headers,
        credentials: "include", // Important for Sanctum
      },
      cacheKey,
    );

    // Cache the response if caching is enabled
    if (ENABLE_CACHING && useCache) {
      apiCache.set(cacheKey, response, DEFAULT_CACHE_TIME);
    }

    return response;
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "POST",
      headers: this.headers,
      credentials: "include", // Important for Sanctum
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "PUT",
      headers: this.headers,
      credentials: "include", // Important for Sanctum
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "PATCH",
      headers: this.headers,
      credentials: "include", // Important for Sanctum
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>(url, {
      method: "DELETE",
      headers: this.headers,
      credentials: "include", // Important for Sanctum
    });
  }

  /**
   * Make a request using the API registry
   * @param category The API category (e.g., 'auth', 'users')
   * @param endpoint The endpoint name within the category
   * @param pathParams Optional path parameters (e.g., { id: 123 })
   * @param data Optional request body data
   * @param queryParams Optional query parameters
   */
  async callApi<T>(
    category: string,
    endpoint: string,
    pathParams?: Record<string, string | number>,
    data?: any,
    queryParams?: Record<string, any>,
  ): Promise<T> {
    const endpointDef = getEndpointDefinition(category, endpoint);
    const url = getApiUrl(category, endpoint, pathParams);
    const cacheKey = apiCache.generateKey(url, queryParams);

    // Check cache if enabled and method is GET and endpoint is cacheable
    if (
      ENABLE_CACHING &&
      endpointDef.method === "GET" &&
      endpointDef.cacheable
    ) {
      const cachedData = apiCache.get<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    const options: RequestInit = {
      method: endpointDef.method,
      headers: this.headers,
      credentials: "include", // Important for Sanctum
    };

    if (data && ["POST", "PUT", "PATCH"].includes(endpointDef.method)) {
      options.body = JSON.stringify(data);
    }

    const fullUrl = this.buildUrl(url, queryParams);
    const response = await this.request<T>(fullUrl, options, cacheKey);

    // Cache the response if caching is enabled and method is GET and endpoint is cacheable
    if (
      ENABLE_CACHING &&
      endpointDef.method === "GET" &&
      endpointDef.cacheable
    ) {
      apiCache.set(
        cacheKey,
        response,
        endpointDef.cacheTime || DEFAULT_CACHE_TIME,
      );
    }

    return response;
  }

  /**
   * Cancel a pending request
   * @param requestId The request ID to cancel
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    // If the endpoint is a full URL, use it directly
    if (endpoint.startsWith("http")) {
      const url = new URL(endpoint);

      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }

      return url.toString();
    }

    // Otherwise, combine with the base URL
    const url = new URL(`${this.baseUrl}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Make the actual HTTP request with error handling
   */
  private async request<T>(
    url: string,
    options: RequestInit,
    requestId: string = Math.random().toString(36).substring(2, 9),
    retryCount: number = 0,
  ): Promise<T> {
    // Apply request interceptors
    let finalOptions = options;
    for (const interceptor of this.requestInterceptors) {
      finalOptions = interceptor(finalOptions);
    }

    // Create abort controller for this request
    const abortController = new AbortController();
    this.abortControllers.set(requestId, abortController);
    finalOptions.signal = abortController.signal;

    // Set timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, finalOptions);

      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);

      // Apply response interceptors
      let finalResponse = response;
      for (const interceptor of this.responseInterceptors) {
        finalResponse = await interceptor(finalResponse);
      }

      if (!finalResponse.ok) {
        const errorData = await finalResponse.text();
        let parsedError;
        try {
          parsedError = JSON.parse(errorData);
        } catch {
          parsedError = { message: errorData };
        }

        const apiError = new ApiError(
          parsedError.message || `HTTP ${finalResponse.status}`,
          finalResponse.status,
          parsedError,
          finalResponse.status >= 500 || finalResponse.status === 429,
        );

        // Apply error interceptors
        for (const interceptor of this.errorInterceptors) {
          try {
            await interceptor(apiError);
          } catch (interceptorError) {
            // If interceptor throws, use that error instead
            throw interceptorError;
          }
        }

        // Retry logic for retryable errors
        if (apiError.retryable && retryCount < MAX_RETRIES) {
          console.warn(
            `Request failed, retrying (${retryCount + 1}/${MAX_RETRIES}):`,
            apiError.message,
          );
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return this.request<T>(url, options, requestId, retryCount + 1);
        }

        throw apiError;
      }

      const data = await finalResponse.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);
      this.abortControllers.delete(requestId);

      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors, timeouts, etc.
      const apiError = new ApiError(
        error instanceof Error ? error.message : "Network error",
        0,
        error,
        true,
      );

      // Apply error interceptors
      for (const interceptor of this.errorInterceptors) {
        try {
          await interceptor(apiError);
        } catch (interceptorError) {
          throw interceptorError;
        }
      }

      // Retry logic for network errors
      if (retryCount < MAX_RETRIES) {
        console.warn(
          `Network error, retrying (${retryCount + 1}/${MAX_RETRIES}):`,
          apiError.message,
        );
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return this.request<T>(url, options, requestId, retryCount + 1);
      }

      throw apiError;
    }
  }
}

// Create and export a singleton instance of the BaseApiService
export const apiService = new BaseApiService();

// Add a global error interceptor to handle authentication errors
apiService.addErrorInterceptor(async (error) => {
  // Handle 401 Unauthorized errors
  if (error.status === 401) {
    console.warn("Authentication error detected:", error.message);

    // Check if we're in a storyboard or development context
    const isStoryboard =
      window.location.pathname.includes("/tempobook/") ||
      window.location.pathname.includes("/storyboards/");

    // Don't redirect if we're in a storyboard
    if (isStoryboard) {
      console.log("In storyboard context, not redirecting to login");
      throw error;
    }

    // Redirect to login page if not already there
    if (window.location.pathname !== "/login") {
      console.log("Redirecting to login page due to authentication error");

      // Store the current path to redirect back after login
      const currentPath = window.location.pathname;
      if (currentPath !== "/" && currentPath !== "/login") {
        sessionStorage.setItem("auth_redirect", currentPath);
      }

      // Use a small delay to allow console logs to be seen
      setTimeout(() => {
        window.location.href = "/login";
      }, 100);
    }
  }

  // Always rethrow the error to let the calling code handle it
  throw error;
});
