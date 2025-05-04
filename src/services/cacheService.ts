/**
 * Simple cache service for storing and retrieving data with expiration
 */

interface CacheItem<T> {
  data: T;
  expiry: number;
}

class CacheService {
  private cache: Record<string, CacheItem<any>> = {};
  
  /**
   * Set an item in the cache with optional expiration time
   * @param key Cache key
   * @param data Data to store
   * @param expiryInMinutes Expiration time in minutes (default: 30)
   */
  set<T>(key: string, data: T, expiryInMinutes: number = 30): void {
    const expiryTime = Date.now() + (expiryInMinutes * 60 * 1000);
    this.cache[key] = { data, expiry: expiryTime };
  }
  
  /**
   * Get an item from the cache
   * @param key Cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache[key];
    
    // Check if item exists and is not expired
    if (item && item.expiry > Date.now()) {
      return item.data as T;
    }
    
    // Remove expired item
    if (item) {
      this.remove(key);
    }
    
    return null;
  }
  
  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  remove(key: string): void {
    delete this.cache[key];
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache = {};
  }
  
  /**
   * Clear expired items from the cache
   */
  clearExpired(): void {
    const now = Date.now();
    Object.keys(this.cache).forEach(key => {
      if (this.cache[key].expiry <= now) {
        this.remove(key);
      }
    });
  }
}

// Create a singleton instance
const cacheService = new CacheService();

export default cacheService;
