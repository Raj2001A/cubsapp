import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { api } from '../utils/api';
import * as apiRetry from '../utils/apiRetry';
import { useToast } from '../components/ui/use-toast';
import { ToastItem } from '../components/ui/use-toast';

export type ApiErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ApiErrorDetail {
  message: string;
  code?: string;
  field?: string;
  severity: ApiErrorSeverity;
  timestamp: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  status: number;
  message: string;
  details?: ApiErrorDetail[];
  timestamp: string;
  path?: string;
  requestId?: string;
  validationErrors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T | null;
  error?: boolean;
  status: number;
  message?: string;
  timestamp: string;
  requestId?: string;
  validationErrors?: Record<string, string[]>;
}

// Custom error logger
const logApiError = (error: AxiosError, endpoint: string): void => {
  const status = error.response?.status;
  const errorData = error.response?.data as ApiErrorResponse | undefined;
  
  // Create a structured log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    endpoint,
    status,
    message: error.message,
    details: errorData,
    stack: error.stack,
  };
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('[API Error]', logEntry);
  }
  
  // TODO: In production, you might want to send this to a logging service
  // sendToLoggingService(logEntry);
};

// Error notification content generator - returns values instead of showing toast directly
const generateErrorNotification = (error: AxiosError, endpoint: string): { title: string, description: string, variant: 'default' | 'destructive' } => {
  const status = error.response?.status || 0;
  const errorData = error.response?.data as ApiErrorResponse | undefined;
  
  // Default message
  let title = 'An error occurred while communicating with the server';
  let description = 'Please try again later';
  
  // Customize based on status code
  if (status === 400) {
    title = 'Invalid request';
    description = errorData?.message || 'Please check your input and try again';
  } else if (status === 401) {
    title = 'Authentication required';
    description = 'Please log in to continue';
  } else if (status === 403) {
    title = 'Access denied';
    description = 'You don\'t have permission to perform this action';
  } else if (status === 404) {
    title = 'Resource not found';
    description = `The requested ${endpoint.split('/').pop()} could not be found`;
  } else if (status === 429) {
    title = 'Too many requests';
    description = 'Please wait a moment before trying again';
  } else if (status >= 500) {
    title = 'Server error';
    description = 'Our servers are currently experiencing issues';
  }
  
  return {
    title,
    description,
    variant: status >= 500 ? 'destructive' : 'default',
  };
};

// Type for request handlers
type RequestHandler<T> = () => Promise<AxiosResponse<T>>;

// Enhanced API service with retries, error handling, and reporting
export const apiService = {
  /**
   * Execute a GET request with retry logic and error handling
   */
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const handler: RequestHandler<T> = () => api.get(url, config);
    
    try {
      const response = await apiRetry.executeWithRetry(
        handler, 
        url,
        3, // max retries
        1000 // initial delay
      );

      return {
        data: response.data,
        status: response.status,
        timestamp: new Date().toISOString(),
        requestId: response.headers['x-request-id']
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logApiError(axiosError, url);
      const notification = generateErrorNotification(axiosError, url);
      
      // Use toast for user feedback
      const { toast } = useToast();
      const toastItem: Omit<ToastItem, 'id'> = {
        title: notification.title,
        description: notification.description,
        variant: notification.variant,
        message: notification.description
      };
      toast(toastItem);

      // Return a structured error response
      return {
        error: true,
        data: null,
        message: notification.description,
        status: axiosError.response?.status || 500,
        timestamp: new Date().toISOString(),
        requestId: axiosError.response?.headers['x-request-id']
      } as ApiResponse<T>;
    }
  },
  
  /**
   * Execute a POST request with retry logic and error handling
   */
  post: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const handler: RequestHandler<T> = () => api.post(url, data, config);
    
    try {
      const response = await apiRetry.executeWithRetry(
        handler, 
        url,
        2, // fewer retries for mutations
        1000
      );

      return {
        data: response.data,
        status: response.status,
        timestamp: new Date().toISOString(),
        requestId: response.headers['x-request-id']
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logApiError(axiosError, url);
      const notification = generateErrorNotification(axiosError, url);
      
      // Use toast for user feedback
      const { toast } = useToast();
      const toastItem: Omit<ToastItem, 'id'> = {
        title: notification.title,
        description: notification.description,
        variant: notification.variant,
        message: notification.description
      };
      toast(toastItem);

      // Return a structured error response
      return {
        error: true,
        message: notification.description,
        status: axiosError.response?.status || 500,
        timestamp: new Date().toISOString(),
        requestId: axiosError.response?.headers['x-request-id']
      } as ApiResponse<T>;
    }
  },
  
  /**
   * Execute a PUT request with retry logic and error handling
   */
  put: async <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const handler: RequestHandler<T> = () => api.put(url, data, config);
    
    try {
      const response = await apiRetry.executeWithRetry(
        handler, 
        url,
        2, // fewer retries for mutations
        1000
      );

      return {
        data: response.data,
        status: response.status,
        timestamp: new Date().toISOString(),
        requestId: response.headers['x-request-id']
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logApiError(axiosError, url);
      const notification = generateErrorNotification(axiosError, url);
      
      // Use toast for user feedback
      const { toast } = useToast();
      const toastItem: Omit<ToastItem, 'id'> = {
        title: notification.title,
        description: notification.description,
        variant: notification.variant,
        message: notification.description
      };
      toast(toastItem);

      // Return a structured error response
      return {
        error: true,
        message: notification.description,
        status: axiosError.response?.status || 500,
        timestamp: new Date().toISOString(),
        requestId: axiosError.response?.headers['x-request-id']
      } as ApiResponse<T>;
    }
  },
  
  /**
   * Execute a DELETE request with retry logic and error handling
   */
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> => {
    const handler: RequestHandler<T> = () => api.delete(url, config);
    
    try {
      const response = await apiRetry.executeWithRetry(
        handler, 
        url,
        1, // minimal retries for delete operations
        1000
      );

      return {
        data: response.data,
        status: response.status,
        timestamp: new Date().toISOString(),
        requestId: response.headers['x-request-id']
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logApiError(axiosError, url);
      const notification = generateErrorNotification(axiosError, url);
      
      // Use toast for user feedback
      const { toast } = useToast();
      const toastItem: Omit<ToastItem, 'id'> = {
        title: notification.title,
        description: notification.description,
        variant: notification.variant,
        message: notification.description
      };
      toast(toastItem);

      // Return a structured error response
      return {
        error: true,
        data: null,
        message: notification.description,
        status: axiosError.response?.status || 500,
        timestamp: new Date().toISOString(),
        requestId: axiosError.response?.headers['x-request-id']
      } as ApiResponse<T>;
    }
  },
  
  /**
   * Check health of backend API with circuit breaker
   */
  checkHealth: async (): Promise<ApiResponse<{ status: 'healthy' | 'unhealthy' }>> => {
    try {
      const response = await api.get('/health', {
        timeout: 3000,
        params: { _t: Date.now() }
      });

      return {
        data: { status: 'healthy' },
        status: response.status,
        timestamp: new Date().toISOString(),
        requestId: response.headers['x-request-id']
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      logApiError(axiosError, '/health');
      
      return {
        error: true,
        data: { status: 'unhealthy' },
        status: axiosError.response?.status || 500,
        message: 'Backend service is not responding',
        timestamp: new Date().toISOString(),
        requestId: axiosError.response?.headers['x-request-id']
      };
    }
  },

  /**
   * Reset circuit breaker for all endpoints
   */
  resetCircuitBreaker: (): void => {
    apiRetry.resetCircuitBreaker();
  }
};
