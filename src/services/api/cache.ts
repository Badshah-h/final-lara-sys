/**
 * API Cache Service
 * Provides caching functionality for API responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get an item from the cache
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if the entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set an item in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param ttl Time to live in milliseconds
   */
  set<T>(key: string, data: T, ttl: number): void {
    const timestamp = Date.now();
    const expiry = timestamp + ttl;

    this.cache.set(key, {
      data,
      timestamp,
      expiry,
    });
  }

  /**
   * Check if an item exists in the cache and is not expired
   * @param key The cache key
   * @returns True if the item exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if the entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove an item from the cache
   * @param key The cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear all expired items from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generate a cache key from a URL and parameters
   * @param url The URL
   * @param params Optional parameters
   * @returns A cache key
   */
  static generateKey(url: string, params?: Record<string, any>): string {
    if (!params) return url;
    return `${url}?${Object.entries(params)
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join("&")}`;
  }
}

// Export a singleton instance
export const apiCache = new ApiCache();
