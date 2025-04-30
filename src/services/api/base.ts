/**
 * Base API service with common functionality for making HTTP requests
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
   * Set authorization header with bearer token
   */
  setAuthToken(token: string): void {
    this.headers = {
      ...this.headers,
      Authorization: `Bearer ${token}`,
    };
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
   * Make a request with timeout, retries, and error handling
   */
  private async request<T>(
    url: string,
    options: RequestInit,
    requestId: string = Math.random().toString(36).substring(2, 9),
    retryCount: number = 0,
  ): Promise<T> {
    // Always include credentials in cross-origin requests
    options.credentials = "include";
    try {
      // Apply request interceptors
      let modifiedOptions = { ...options };
      for (const interceptor of this.requestInterceptors) {
        modifiedOptions = interceptor(modifiedOptions);
      }

      // Create abort controller for this request
      const controller = new AbortController();
      this.abortControllers.set(requestId, controller);
      const { signal } = controller;

      // Set timeout
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      // Make the request
      const response = await fetch(url, { ...modifiedOptions, signal });
      clearTimeout(timeout);
      this.abortControllers.delete(requestId);

      // Apply response interceptors
      let modifiedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        modifiedResponse = await interceptor(modifiedResponse);
      }

      // Parse response data
      let data: any;
      const contentType = modifiedResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await modifiedResponse.json();
      } else {
        data = await modifiedResponse.text();
      }

      // Handle error responses
      if (!modifiedResponse.ok) {
        const apiError = new ApiError(
          data.message || `API error: ${modifiedResponse.status}`,
          modifiedResponse.status,
          data,
          modifiedResponse.status >= 500 || modifiedResponse.status === 429, // Server errors and rate limiting are retryable
        );

        // Try to handle the error with interceptors
        for (const interceptor of this.errorInterceptors) {
          try {
            const result = await interceptor(apiError);
            if (result) return result as T;
          } catch (e) {
            // If the interceptor rethrows, continue with the error
          }
        }

        // If the error is retryable and we haven't exceeded max retries, retry the request
        if (apiError.retryable && retryCount < MAX_RETRIES) {
          const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.request<T>(url, options, requestId, retryCount + 1);
        }

        throw apiError;
      }

      return data as T;
    } catch (error) {
      this.abortControllers.delete(requestId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408, null, true);
      }

      // If the error is a network error and we haven't exceeded max retries, retry the request
      if (
        error instanceof TypeError &&
        error.message.includes("fetch") &&
        retryCount < MAX_RETRIES
      ) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.request<T>(url, options, requestId, retryCount + 1);
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error",
        500,
        null,
        true,
      );
    }
  }
}

// Create and export a singleton instance of the BaseApiService
export const apiService = new BaseApiService();
