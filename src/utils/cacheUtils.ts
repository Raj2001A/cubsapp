/**
 * Cache utility for storing and retrieving data with expiration
 * and request throttling
 */

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

// Request tracking interface
interface RequestTracker {
  lastRequestTime: number;
  inProgress: boolean;
  pendingPromise: Promise<any> | null;
}

// Cache storage
const cache = new Map<string, CacheEntry<any>>();

// Request tracker storage
const requestTrackers = new Map<string, RequestTracker>();

// Default cache duration (5 minutes)
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

// Default throttle duration (2000ms)
const DEFAULT_THROTTLE_DURATION = 2000;

// Maximum number of items in cache
const MAX_CACHE_SIZE = 200;

// Cache hit counter for LRU implementation
const cacheHits = new Map<string, number>();

// Cache access counter
let cacheAccessCounter = 0;

import { getEnv } from './env';

/**
 * Evict least recently used items from cache if it exceeds maximum size
 */
const evictLRUItems = (): void => {
  if (cache.size <= MAX_CACHE_SIZE) return;

  // Sort keys by hit count (ascending)
  const sortedKeys = Array.from(cacheHits.entries())
    .sort((a, b) => a[1] - b[1])
    .map(entry => entry[0]);

  // Calculate how many items to remove
  const itemsToRemove = Math.ceil(cache.size * 0.2); // Remove 20% of items

  // Remove the least recently used items
  for (let i = 0; i < itemsToRemove && i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    cache.delete(key);
    cacheHits.delete(key);

    if (getEnv('VITE_DEV', '') === 'true') {
      console.log(`Cache: Evicted LRU item "${key}"`);
    }
  }
};

/**
 * Set data in cache with expiration
 * @param key Cache key
 * @param data Data to cache
 * @param duration Cache duration in milliseconds (default: 5 minutes)
 */
export const setCacheItem = <T>(key: string, data: T, duration: number = DEFAULT_CACHE_DURATION): void => {
  // Check if we need to evict items before adding new one
  if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
    evictLRUItems();
  }

  const timestamp = Date.now();
  const expiry = timestamp + duration;

  // Store in memory cache
  cache.set(key, {
    data,
    timestamp,
    expiry
  });

  // Initialize or update hit counter
  cacheHits.set(key, cacheAccessCounter++);

  // Also store in localStorage for persistence across page reloads
  try {
    // Only store in localStorage if the data is serializable
    // and not too large (to avoid localStorage quota issues)
    const serialized = JSON.stringify({ data, timestamp, expiry });
    if (serialized.length < 500000) { // 500KB limit
      localStorage.setItem(`cache_${key}`, serialized);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`Failed to store cache item in localStorage: ${error.message}`);
    } else {
      console.warn('Failed to store cache item in localStorage:', error);
    }
  }

  // Log cache operation in development
  if (getEnv('VITE_DEV', '') === 'true') {
    console.log(`Cache: Set "${key}" (expires in ${duration / 1000}s)`);
  }
};

/**
 * Get data from cache if not expired
 * @param key Cache key
 * @returns Cached data or null if expired or not found
 */
export const getCacheItem = <T>(key: string): T | null => {
  // First try to get from memory cache
  const entry = cache.get(key) as CacheEntry<T> | undefined;

  // If entry exists in memory cache
  if (entry) {
    // Check if entry is expired
    if (Date.now() > entry.expiry) {
      // Remove expired entry
      cache.delete(key);
      cacheHits.delete(key);

      // Also remove from localStorage
      try {
        localStorage.removeItem(`cache_${key}`);
      } catch (error) {
        if (error instanceof Error) {
          console.warn(`Failed to remove cache item from localStorage: ${error.message}`);
        } else {
          console.warn('Failed to remove cache item from localStorage:', error);
        }
      }

      console.log(`Cache: Miss "${key}" (expired)`);
      return null;
    }

    // Update hit counter for LRU tracking
    cacheHits.set(key, cacheAccessCounter++);

    // Return cached data
    const ageSeconds = Math.round((Date.now() - entry.timestamp) / 1000);
    console.log(`Cache: Hit "${key}" (memory cache, age: ${ageSeconds}s)`);
    return entry.data;
  }

  // If not in memory cache, try localStorage
  try {
    const localStorageKey = `cache_${key}`;
    const storedData = localStorage.getItem(localStorageKey);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        // Check if the localStorage data is expired
        if (parsedData.expiry && Date.now() > parsedData.expiry) {
          // Remove expired entry
          localStorage.removeItem(localStorageKey);
          console.log(`Cache: Miss "${key}" (localStorage expired)`);
          return null;
        }

        // Restore the data to memory cache
        if (parsedData.data !== undefined) {
          // Add to memory cache
          cache.set(key, {
            data: parsedData.data,
            timestamp: parsedData.timestamp || Date.now(),
            expiry: parsedData.expiry || (Date.now() + DEFAULT_CACHE_DURATION)
          });

          // Update hit counter
          cacheHits.set(key, cacheAccessCounter++);

          console.log(`Cache: Hit "${key}" (restored from localStorage)`);
          return parsedData.data as T;
        }
      } catch (parseError) {
        // Invalid JSON in localStorage
        if (parseError instanceof Error) {
          console.warn(`Cache: Invalid JSON in localStorage for "${key}": ${parseError.message}`);
        } else {
          console.warn('Cache: Invalid JSON in localStorage for "' + key + '":', parseError);
        }
        localStorage.removeItem(localStorageKey);
      }
    }
  } catch (localStorageError) {
    if (localStorageError instanceof Error) {
      console.warn(`Cache: Error accessing localStorage: ${localStorageError.message}`);
    } else {
      console.warn('Cache: Error accessing localStorage:', localStorageError);
    }
  }

  console.log(`Cache: Miss "${key}" (not in cache)`);
  return null;
};

/**
 * Remove item from cache
 * @param key Cache key
 */
export const removeCacheItem = (key: string): void => {
  // Remove from memory cache
  cache.delete(key);
  cacheHits.delete(key);

  // Also remove from localStorage
  try {
    localStorage.removeItem(`cache_${key}`);
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`Failed to remove cache item from localStorage: ${error.message}`);
    } else {
      console.warn('Failed to remove cache item from localStorage:', error);
    }
  }

  console.log(`Cache: Removed "${key}"`);
};

/**
 * Clear all items from cache
 */
export const clearCache = (): void => {
  // Clear memory cache
  cache.clear();
  cacheHits.clear();
  cacheAccessCounter = 0;

  // Also clear localStorage cache
  try {
    // Only clear cache items, not all localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        keysToRemove.push(key);
      }
    }

    // Remove all cache keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log(`Cache: Cleared all items (${keysToRemove.length} from localStorage)`);
  } catch (error) {
    if (error instanceof Error) {
      console.warn(`Failed to clear cache items from localStorage: ${error.message}`);
    } else {
      console.warn('Failed to clear cache items from localStorage:', error);
    }
    console.log('Cache: Cleared all memory cache items');
  }
};

/**
 * Get cache statistics
 * @returns Cache statistics
 */
export const getCacheStats = (): {
  size: number;
  keys: string[];
  hitCount: number;
  expiryTimes: Record<string, number>;
  accessCounts: Record<string, number>;
} => {
  const now = Date.now();
  const expiryTimes: Record<string, number> = {};
  const accessCounts: Record<string, number> = {};

  // Calculate expiry times relative to now
  for (const [key, entry] of cache.entries()) {
    expiryTimes[key] = Math.round((entry.expiry - now) / 1000); // seconds until expiry
  }

  // Get access counts
  for (const [key, count] of cacheHits.entries()) {
    accessCounts[key] = count;
  }

  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
    hitCount: cacheHits.size,
    expiryTimes,
    accessCounts
  };
};

/**
 * Wrapper function to get data from cache or fetch it if not cached
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param duration Cache duration in milliseconds
 * @returns Data from cache or fetched
 */

/**
 * Throttle a function call to prevent excessive API requests
 * @param key Unique key for the request
 * @param fetchFn Function to fetch data
 * @param throttleDuration Minimum time between requests in milliseconds
 * @returns Promise with the result of the fetch function
 */
export const throttleRequest = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  throttleDuration: number = DEFAULT_THROTTLE_DURATION
): Promise<T> => {
  // Generate a unique request ID for logging
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Get or create request tracker
  if (!requestTrackers.has(key)) {
    requestTrackers.set(key, {
      lastRequestTime: 0,
      inProgress: false,
      pendingPromise: null
    });
  }

  const tracker = requestTrackers.get(key)!;
  const now = Date.now();
  const timeSinceLastRequest = now - tracker.lastRequestTime;

  // If a request is already in progress, return the pending promise
  if (tracker.inProgress && tracker.pendingPromise) {
    console.log(`Throttle [${requestId}]: Request "${key}" already in progress, reusing promise`);
    return tracker.pendingPromise;
  }

  // If the throttle duration hasn't elapsed, wait before making a new request
  if (timeSinceLastRequest < throttleDuration) {
    const delayTime = throttleDuration - timeSinceLastRequest;
    console.log(`Throttle [${requestId}]: Delaying request "${key}" by ${delayTime}ms`);
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }

  // Mark request as in progress
  tracker.inProgress = true;
  console.log(`Throttle [${requestId}]: Starting request "${key}"`);

  // Set up a timeout to automatically clear stuck requests
  const timeoutId = setTimeout(() => {
    if (tracker.inProgress) {
      console.warn(`Throttle [${requestId}]: Request "${key}" timed out after 30s, resetting tracker`);
      tracker.inProgress = false;
      tracker.pendingPromise = null;
    }
  }, 30000); // 30 second safety timeout

  // Create and store the promise
  try {
    tracker.pendingPromise = fetchFn().then(result => {
      // Update tracker when request completes
      tracker.lastRequestTime = Date.now();
      tracker.inProgress = false;
      tracker.pendingPromise = null;
      clearTimeout(timeoutId);
      console.log(`Throttle [${requestId}]: Request "${key}" completed successfully`);
      return result;
    }).catch(error => {
      // Update tracker on error
      tracker.inProgress = false;
      tracker.pendingPromise = null;
      clearTimeout(timeoutId);
      console.error(`Throttle [${requestId}]: Request "${key}" failed:`, error);
      throw error;
    });

    return await tracker.pendingPromise;
  } catch (error) {
    // Ensure we clean up even if there's an error in the promise chain
    tracker.inProgress = false;
    tracker.pendingPromise = null;
    clearTimeout(timeoutId);
    console.error(`Throttle [${requestId}]: Request "${key}" failed with unhandled error:`, error);
    throw error;
  }
};

/**
 * Get data from cache or fetch it if not cached
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param duration Cache duration in milliseconds
 * @param forceRefresh Whether to force a refresh of the data
 * @returns Data from cache or fetched
 */
export const getOrFetchData = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  duration: number = DEFAULT_CACHE_DURATION,
  forceRefresh: boolean = false
): Promise<T> => {
  // Generate a unique request ID for logging
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Try to get from cache first (unless force refresh is requested)
  if (!forceRefresh) {
    const cachedData = getCacheItem<T>(key);

    if (cachedData !== null) {
      console.log(`Cache [${requestId}]: Hit for "${key}"`);
      return cachedData;
    }
    console.log(`Cache [${requestId}]: Miss for "${key}", fetching data`);
  } else {
    console.log(`Cache [${requestId}]: Forced refresh for "${key}"`);
  }

  try {
    // If not in cache or force refresh, throttle the fetch request
    console.log(`Cache [${requestId}]: Fetching data for "${key}"`);
    const data = await throttleRequest(`fetch_${key}`, fetchFn);

    // Only store in cache if we got valid data
    if (data !== null && data !== undefined) {
      setCacheItem(key, data, duration);
      console.log(`Cache [${requestId}]: Stored data for "${key}" with ${duration/1000}s expiry`);
    } else {
      console.warn(`Cache [${requestId}]: Not caching null/undefined data for "${key}"`);
    }

    return data;
  } catch (error) {
    console.error(`Cache [${requestId}]: Error fetching data for "${key}":`, error);

    // If we have stale data in cache and force refresh failed, return the stale data
    if (forceRefresh) {
      const staleData = getCacheItem<T>(key);
      if (staleData !== null) {
        console.warn(`Cache [${requestId}]: Returning stale data for "${key}" after refresh failure`);
        return staleData;
      }
    }

    // Check if we have any data in localStorage as a last resort
    try {
      const localStorageKey = `cache_${key}`;
      const storedData = localStorage.getItem(localStorageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData.data) {
          console.warn(`Cache [${requestId}]: Returning localStorage data for "${key}" after fetch failure`);
          return parsedData.data as T;
        }
      }
    } catch (localStorageError) {
      if (localStorageError instanceof Error) {
        console.error(`Cache [${requestId}]: Error accessing localStorage: ${localStorageError.message}`);
      } else {
        console.error('Cache: Error accessing localStorage:', localStorageError);
      }
    }

    throw error;
  }
};
