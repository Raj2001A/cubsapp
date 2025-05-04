/**
 * API Service for connecting to the backend
 */
import { retryOperation, isOffline, checkApiAvailability } from '../utils/errorHandling';
import logger from '../utils/logger';
import { getOrFetchData } from '../utils/cacheUtils';
import requestQueueManager, { RequestPriority } from '../utils/requestQueueManager';

// Only keep these imports for config and mock backend
import { API_ENDPOINT, USE_MOCK_BACKEND } from '../config';
import { mockBackendService } from './mockBackendService';

// API base URL from config
const API_BASE_URL = API_ENDPOINT;

// Default headers for API requests
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Timeout for API requests (in milliseconds)
const API_TIMEOUT = 15000; // 15 seconds - reduced from 30 seconds for better user experience

// API concurrency limits
const MAX_CONCURRENT_REQUESTS = 20; // Maximum concurrent requests
const MAX_CONCURRENT_REQUESTS_PER_ENDPOINT = 5; // Maximum concurrent requests per endpoint

// Track concurrent requests
const concurrentRequests = new Map<string, number>();
const totalConcurrentRequests = { count: 0 };

// Track request start times for timeout detection
const requestStartTimes = new Map<string, number>();

// --- Helper Functions and Types ---

export type ApiResponseWithMessage = { message?: string };

const handleResponse = async <T = any>(response: Response): Promise<T & ApiResponseWithMessage> => {
  logger.debug('[handleResponse] Incoming response:', {
    url: response?.url,
    status: response?.status,
    ok: response?.ok,
    headers: response?.headers,
    response
  });
  if (!response || typeof response !== 'object' || !('headers' in response) || !response.headers || typeof (response as any).headers.get !== 'function') {
    logger.error('[handleResponse] Invalid response object received', { response });
    throw new Error('Invalid response object received');
  }
  const contentType = response.headers.get('content-type');
  if (!response.ok && response.status === 500) {
    try {
      const errorData = await response.json();
      const errorMessage = errorData.message || `Server Error: ${response.statusText}`;
      if (errorData.error && typeof errorData.error === 'string' && (errorData.error.includes('database') || errorData.error.includes('connection'))) {
        const dbError = new Error('Database connection error: ' + errorMessage);
        (dbError as any).status = response.status;
        (dbError as any).data = errorData;
        (dbError as any).isDatabaseError = true;
        throw dbError;
      }
      const serverError = new Error('Server error: ' + errorMessage);
      (serverError as any).status = response.status;
      (serverError as any).data = errorData;
      throw serverError;
    } catch (jsonError) {
      const genericError = new Error(`Server error (possibly database connection issue): ${response.statusText}`);
      (genericError as any).status = response.status;
      (genericError as any).isDatabaseError = true;
      throw genericError;
    }
  }
  if (contentType && contentType.includes('application/json')) {
    try {
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.message || `Error ${response.status}: ${response.statusText}`;
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).data = data;
        throw error;
      }
      if (data === undefined || data === null) {
        return {} as T & ApiResponseWithMessage;
      }
      if (typeof data !== 'object') {
        return { data } as unknown as T & ApiResponseWithMessage;
      }
      if (Array.isArray(data)) {
        return { data } as unknown as T & ApiResponseWithMessage;
      }
      return data;
    } catch (jsonError) {
      if (response.ok) {
        return {} as T & ApiResponseWithMessage;
      } else {
        const error = new Error(`Error ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }
    }
  } else {
    if (!response.ok) {
      const error = new Error(`Error ${response.status}: ${response.statusText}`);
      (error as any).status = response.status;
      throw error;
    }
    return (response as unknown) as T & ApiResponseWithMessage;
  }
};

const safeHandleResponse = async <T = any>(response: Response | undefined): Promise<T & ApiResponseWithMessage> => {
  if (!response || typeof response !== 'object' || !('headers' in response) || !response.headers || typeof (response as any).headers.get !== 'function') {
    logger.error('[safeHandleResponse] No valid response object received', { response });
    throw new Error('No valid response from server');
  }
  try {
    logger.debug('[safeHandleResponse] Passing response to handleResponse:', response);
    return await handleResponse<T>(response);
  } catch (err: any) {
    if (response) {
      logger.error('[safeHandleResponse] Error handling response', {
        error: err,
        url: response.url,
        status: response.status
      });
    } else {
      logger.error('[safeHandleResponse] Error handling response', {
        error: err
      });
    }
    throw err;
  }
};

// --- fetchWithTimeout: full implementation ---
const fetchWithTimeout = async <T = any>(url: string, options: RequestInit = {}, priority: RequestPriority = RequestPriority.NORMAL): Promise<T> => {
  logger.info('[fetchWithTimeout] Request started', { url, options, priority });
  if (isOffline()) {
    logger.warn('Offline mode detected, cannot make API request');
    throw new Error('You are currently offline. Please check your internet connection and try again.');
  }

  // Create a request key based on the URL and method
  const requestKey = `${options.method || 'GET'}_${url}`;
  // Generate a unique request ID for tracking
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  logger.debug(`[fetchWithTimeout] url=${url}, options=`, options);

  // Extract endpoint for circuit breaker
  const urlObj = new URL(url.startsWith('http') ? url : `http://localhost${url}`);
  const endpoint = urlObj.pathname;
  // Track request start time
  requestStartTimes.set(requestId, Date.now());

  // Check if we've reached the maximum number of concurrent requests
  const currentTotal = totalConcurrentRequests.count;
  const currentEndpoint = concurrentRequests.get(endpoint) || 0;
  if (currentTotal >= MAX_CONCURRENT_REQUESTS || currentEndpoint >= MAX_CONCURRENT_REQUESTS_PER_ENDPOINT) {
    logger.warn('Max concurrent requests reached, queuing request', { endpoint, currentTotal, currentEndpoint });
  }

  // Increment concurrent request counts
  totalConcurrentRequests.count++;
  concurrentRequests.set(endpoint, (concurrentRequests.get(endpoint) || 0) + 1);

  // Determine if this is a critical request that should bypass the queue
  const isCritical = priority === RequestPriority.HIGH && (
    url.includes('/health') ||
    url.includes('/status') ||
    url.includes('/auth')
  );

  // Helper to decrement counts
  const decrementConcurrentRequests = () => {
    if (totalConcurrentRequests.count > 0) totalConcurrentRequests.count--;
    const curr = concurrentRequests.get(endpoint) || 0;
    if (curr > 0) concurrentRequests.set(endpoint, curr - 1);
    else concurrentRequests.delete(endpoint);
    requestStartTimes.delete(requestId);
  };

  // For critical requests, bypass the queue and use direct fetch
  if (isCritical) {
    logger.debug(`Critical request bypassing queue: ${options.method || 'GET'} ${url}`);
    const controller = new AbortController();
    const { signal } = controller;
    const mergedOptions = { ...options, signal };
    const timeoutId = setTimeout(() => {
      controller.abort();
      logger.warn(`Critical request timeout for ${url}`, { timeout: API_TIMEOUT });
    }, API_TIMEOUT);
    try {
      const response = await fetch(url, mergedOptions);
      clearTimeout(timeoutId);
      if (!response || typeof response !== 'object' || !('headers' in response) || !response.headers || typeof (response as any).headers.get !== 'function') {
        logger.error('[fetchWithTimeout] Invalid response object received', { response });
        throw new Error('[fetchWithTimeout] Invalid response object received');
      }
      logger.debug('[fetchWithTimeout] Response received', { url, status: response && 'status' in response ? response.status : undefined });
      if (!response.ok) {
        logger.warn(`[fetchWithTimeout] API request returned status ${response.status}`, { url });
      }
      // Always return the raw Response object, never call response.json() here
      return response as unknown as T;
    } catch (error: unknown) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error(`Critical request timeout after ${API_TIMEOUT / 1000} seconds`);
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
      throw error;
    } finally {
      decrementConcurrentRequests();
    }
  }

  // For normal requests, use the request queue manager
  try {
    return await requestQueueManager.enqueue({
      url,
      method: options.method || 'GET',
      priority,
      timeout: API_TIMEOUT,
      tags: [endpoint, requestKey],
      execute: async () => {
        const controller = new AbortController();
        const { signal } = controller;
        const mergedOptions = { ...options, signal };
        logger.debug(`Executing API request: ${options.method || 'GET'} ${url}`);
        const timeoutId = setTimeout(() => {
          controller.abort();
          logger.warn(`Request timeout for ${url}`, { timeout: API_TIMEOUT });
        }, API_TIMEOUT);
        try {
          const response = await fetch(url, mergedOptions);
          clearTimeout(timeoutId);
          if (!response || typeof response !== 'object' || !('headers' in response) || !response.headers || typeof (response as any).headers.get !== 'function') {
            logger.error('[fetchWithTimeout] Invalid response object received', { response });
            throw new Error('[fetchWithTimeout] Invalid response object received');
          }
          logger.debug('[fetchWithTimeout] Response received', { url, status: response && 'status' in response ? response.status : undefined });
          if (!response.ok) {
            logger.warn(`[fetchWithTimeout] API request returned status ${response.status}`, { url });
          }
          // Always return the raw Response object, never call response.json() here
          return response as unknown as T;
        } catch (error: unknown) {
          clearTimeout(timeoutId);
          if (error instanceof Error && error.name === 'AbortError') {
            const timeoutError = new Error(`Request timeout after ${API_TIMEOUT / 1000} seconds`);
            timeoutError.name = 'TimeoutError';
            throw timeoutError;
          }
          throw error;
        } finally {
          decrementConcurrentRequests();
        }
      },
    });
  } catch (error: unknown) {
    throw error;
  } finally {
    decrementConcurrentRequests();
  }
};

/**
 * Checks if the API is available before making requests.
 * Only checks outside development mode, and caches the result for a short interval.
 */
const ensureApiAvailable = async (): Promise<void> => {
  // Skip API availability check in development
  // (Vite/React: import.meta.env.DEV is only available with ES modules and Vite)
  // Use process.env.NODE_ENV for compatibility with TS/Node
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    return;
  }
  const now = Date.now();
  const API_CHECK_INTERVAL = 300000; // 5 minutes
  let isApiAvailable = true;
  let lastApiCheck = 0;
  let apiCheckInProgress = false;
  let apiCheckPromise: Promise<boolean> | null = null;

  if (!isApiAvailable || now - lastApiCheck > API_CHECK_INTERVAL) {
    if (apiCheckInProgress && apiCheckPromise) {
      const result = await apiCheckPromise;
      if (!result) {
        throw new Error('API is currently unavailable. Please try again later.');
      }
      return;
    }
    apiCheckInProgress = true;
    try {
      apiCheckPromise = checkApiAvailability(API_BASE_URL);
      isApiAvailable = await apiCheckPromise;
      lastApiCheck = now;
      if (!isApiAvailable) {
        throw new Error('API is currently unavailable. Please try again later.');
      }
    } finally {
      apiCheckInProgress = false;
      apiCheckPromise = null;
    }
  }
};

// --- Real API Implementation ---
const realApi = {
  health: {
    check: async (): Promise<{ status: string } & ApiResponseWithMessage> => {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: defaultHeaders,
          cache: 'no-store'
        }, RequestPriority.HIGH);
        return safeHandleResponse<{ status: string }>(response);
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.error('Health check failed', { error: errMsg });
        return {
          status: 'error',
          message: 'Health check failed',
          error: errMsg
        } as { status: string } & ApiResponseWithMessage;
      }
    },
    getStatus: async (): Promise<{ status: string; uptime: number } & ApiResponseWithMessage> => {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/status`, {
          method: 'GET',
          headers: defaultHeaders,
          cache: 'no-store'
        }, RequestPriority.HIGH);
        return safeHandleResponse<{ status: string; uptime: number }>(response);
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.error('Status check failed', { error: errMsg });
        return {
          status: 'error',
          uptime: 0,
          message: 'Status check failed',
          error: errMsg,
          services: {
            api: false,
            database: false,
            websocket: false
          }
        } as { status: string; uptime: number } & ApiResponseWithMessage;
      }
    }
  },
  backend: {
    getStatus: async (): Promise<{ status: string; backends?: any[]; message?: string } & ApiResponseWithMessage> => {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/backend/status`, {
          method: 'GET',
          headers: defaultHeaders,
        });
        return safeHandleResponse(response);
      } catch (error) {
        return {
          status: 'offline',
          backends: [],
          message: 'Backend unreachable',
        };
      }
    },
    checkDatabaseConnection: async (): Promise<{ connected: boolean } & ApiResponseWithMessage> => {
      try {
        const response = await fetchWithTimeout(`${API_BASE_URL}/employees?limit=1`, {
          method: 'GET',
          headers: defaultHeaders,
          cache: 'no-store'
        });
        try {
          await safeHandleResponse<any>(response);
        } catch (error) {
          console.error('Error parsing database connection response:', error);
          return {
            connected: false,
            message: 'Database connection failed: Error parsing response'
          };
        }
        return {
          connected: true,
          message: 'Database connection successful'
        };
      } catch (error) {
        console.error('Database connection check failed:', error);
        return {
          connected: false,
          message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
        };
      }
    },
    switchBackend: async (backendId: string): Promise<{ success: boolean } & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/backend/switch/${backendId}`, {
          method: 'POST',
          headers: defaultHeaders,
        });
        return safeHandleResponse<{ success: boolean }>(response);
      });
    },
    setStrategy: async (strategy: string): Promise<{ success: boolean } & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/backend/strategy`, {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify({ strategy }),
        });
        return safeHandleResponse<{ success: boolean }>(response);
      });
    },
    toggleBackend: async (backendId: string, enabled: boolean): Promise<{ success: boolean } & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/backend/toggle/${backendId}`, {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify({ enabled }),
        });
        return safeHandleResponse<{ success: boolean }>(response);
      });
    }
  },
  employees: {
    getVisaExpiryReminders: async (limit: number = 10): Promise<{ success: boolean; count: number; data: any[] }> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/employees?_limit=${limit}`, {
          method: 'GET',
          headers: defaultHeaders,
        });
        const data = await safeHandleResponse<any[]>(response);
        const filtered = data.filter(emp => emp.visa_expiry_date);
        return {
          success: true,
          count: filtered.length,
          data: filtered
        };
      });
    },
    getAll: async (page?: number, limit?: number): Promise<any> => {
      const safePage = typeof page === 'number' && page > 0 ? page : 1;
      const safeLimit = typeof limit === 'number' && limit > 0 ? limit : 1000;
      const cacheKey = `employees_${safePage}_${safeLimit}`;
      return getOrFetchData(
        cacheKey,
        async () => {
          return retryOperation(async () => {
            await ensureApiAvailable();
            const response = await fetchWithTimeout(`${API_BASE_URL}/employees?page=${safePage}&limit=${safeLimit}`, {
              method: 'GET',
              headers: defaultHeaders,
            });
            const responseData = await safeHandleResponse<any>(response);
            if (!responseData || (typeof responseData === 'object' && !Array.isArray(responseData) && !responseData.data)) {
              console.error('Invalid API response format:', responseData);
              throw new Error('Invalid API response format');
            }
            if (Array.isArray(responseData)) {
              return { data: responseData };
            }
            return responseData;
          });
        },
        300000
      );
    },
    getById: async (id: string): Promise<{ data: any } & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/employees/${id}`, {
          method: 'GET',
          headers: defaultHeaders,
        });
        const data = await safeHandleResponse<any>(response);
        return {
          success: true,
          data
        } as { data: any } & ApiResponseWithMessage;
      });
    },
    create: async (employeeData: any): Promise<any & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/employees`, {
          method: 'POST',
          headers: defaultHeaders,
          body: JSON.stringify(employeeData),
        });
        return safeHandleResponse<any>(response);
      });
    },
    update: async (id: string, employeeData: any): Promise<any & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/employees/${id}`, {
          method: 'PUT',
          headers: defaultHeaders,
          body: JSON.stringify(employeeData),
        });
        return safeHandleResponse<any>(response);
      });
    },
    delete: async (id: string): Promise<{ success: boolean } & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/employees/${id}`, {
          method: 'DELETE',
          headers: defaultHeaders,
        });
        return safeHandleResponse<{ success: boolean }>(response);
      });
    },
    search: async (query: string, page?: number, limit?: number): Promise<any> => {
      const cacheKey = `employees_search_${query}_${page}_${limit}`;
      return getOrFetchData(
        cacheKey,
        async () => {
          return retryOperation(async () => {
            await ensureApiAvailable();
            const response = await fetchWithTimeout(`${API_BASE_URL}/employees/search/${query}?page=${page}&limit=${limit}`, {
              method: 'GET',
              headers: defaultHeaders,
            });
            const responseData = await safeHandleResponse<any>(response);
            if (!responseData || (Array.isArray(responseData) && responseData.length === 0) || (typeof responseData === 'object' && !Array.isArray(responseData) && !('data' in responseData))) {
              console.error('Invalid API response format:', responseData);
              throw new Error('Invalid API response format');
            }
            if (Array.isArray(responseData)) {
              return { data: responseData };
            }
            return responseData;
          });
        },
        300000
      );
    },
    getByCompany: async (companyId: string, page?: number, limit?: number): Promise<any> => {
      const cacheKey = `employees_company_${companyId}_${page}_${limit}`;
      return getOrFetchData(
        cacheKey,
        async () => {
          return retryOperation(async () => {
            await ensureApiAvailable();
            const response = await fetchWithTimeout(`${API_BASE_URL}/employees/company/${companyId}?page=${page}&limit=${limit}`, {
              method: 'GET',
              headers: defaultHeaders,
            });
            const responseData = await safeHandleResponse<any>(response);
            if (!responseData || (Array.isArray(responseData) && responseData.length === 0) || (typeof responseData === 'object' && !Array.isArray(responseData) && !('data' in responseData))) {
              console.error('Invalid API response format:', responseData);
              throw new Error('Invalid API response format');
            }
            if (Array.isArray(responseData)) {
              return { data: responseData };
            }
            return responseData;
          });
        },
        300000
      );
    }
  },
  companies: {
    getAll: async (): Promise<{ success: boolean; count: number; data: any[] } & ApiResponseWithMessage> => {
      const cacheKey = 'companies_all';
      return getOrFetchData(
        cacheKey,
        async () => {
          const response = await fetchWithTimeout(`${API_BASE_URL}/companies`, {
            method: 'GET',
            headers: defaultHeaders,
          });
          const data = await safeHandleResponse<any[]>(response);
          return {
            success: true,
            count: data.length,
            data
          } as { success: boolean; count: number; data: any[] } & ApiResponseWithMessage;
        },
        600000
      );
    },
    getById: async (id: string): Promise<{ success: boolean; data: any } & ApiResponseWithMessage> => {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'GET',
        headers: defaultHeaders,
      });
      const data = await safeHandleResponse<any>(response);
      return {
        success: true,
        data
      } as { success: boolean; data: any } & ApiResponseWithMessage;
    },
    create: async (companyData: any): Promise<any & ApiResponseWithMessage> => {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(companyData),
      });
      return safeHandleResponse<any>(response);
    },
    update: async (id: string, companyData: any): Promise<any & ApiResponseWithMessage> => {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(companyData),
      });
      return safeHandleResponse<any>(response);
    },
    delete: async (id: string): Promise<{ success: boolean } & ApiResponseWithMessage> => {
      const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
        method: 'DELETE',
        headers: defaultHeaders,
      });
      return safeHandleResponse<{ success: boolean }>(response);
    },
    getWithEmployeeCount: async (): Promise<{ success: boolean; data: any[] } & ApiResponseWithMessage> => {
      const response = await fetch(`${API_BASE_URL}/companies/stats/employee-count`, {
        method: 'GET',
        headers: defaultHeaders,
      });
      const data = await safeHandleResponse<any[]>(response);
      return {
        success: true,
        data,
      } as { success: boolean; data: any[] } & ApiResponseWithMessage;
    }
  },
  import: {
    importEmployees: async (formData: FormData): Promise<{ success: boolean; imported: number } & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/import/employees`, {
          method: 'POST',
          body: formData,
        });
        return safeHandleResponse<{ success: boolean; imported: number }>(response);
      });
    },
    getTemplate: async (): Promise<Response & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/import/template`, {
          method: 'GET',
        });
        return response;
      });
    },
    exportEmployees: async (format: string = 'csv'): Promise<{ success: boolean; data: string } & ApiResponseWithMessage> => {
      return retryOperation(async () => {
        await ensureApiAvailable();
        const response = await fetchWithTimeout(`${API_BASE_URL}/export/employees?format=${format}`, {
          method: 'GET',
          headers: defaultHeaders,
        });
        const data = await safeHandleResponse<{ data: string }>(response);
        if (!data || typeof data.data !== 'string') {
          throw new Error('Invalid export response received');
        }
        return { ...data, success: true };
      });
    }
  }
};

// --- Toggle Logic ---
const api = USE_MOCK_BACKEND ? mockBackendService : realApi;

export { fetchWithTimeout, safeHandleResponse };
export { api };
export default api;
