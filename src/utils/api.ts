import axios from 'axios';

// Get base URL from environment variables with fallback
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

// Create axios instance with better defaults
export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout to prevent hanging requests
  timeoutErrorMessage: 'Request timed out. Server may be unavailable.'
});

// Log the API URL being used
console.log(`API configured with base URL: ${apiBaseUrl}`);

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config);
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log all API errors
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Add additional error handling based on status
    if (error.response) {
      // Server responded with an error status
      switch (error.response.status) {
        case 401:
          // Handle unauthorized access
          localStorage.removeItem('token');
          // Only redirect to login if we're not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.warn('Access forbidden. You may not have permission for this action.');
          break;
        case 404:
          // Not found
          console.warn(`Resource not found: ${error.config?.url}`);
          break;
        case 500:
          // Server error - log more details
          console.error('Server error:', error.response.data);
          break;
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      
      // Check if it's a timeout
      if (error.code === 'ECONNABORTED') {
        console.warn('Request timed out. Server may be unavailable.');
      }
    }
    
    // Check if we have network issues
    if (error.message === 'Network Error') {
      console.warn('Network error. API server may be unavailable.');
      
      // Dispatch a custom event that components can listen for
      const networkErrorEvent = new CustomEvent('api-network-error', { 
        detail: { url: error.config?.url }
      });
      window.dispatchEvent(networkErrorEvent);
    }
    
    return Promise.reject(error);
  }
);

// Add utility for checking API health
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health', { timeout: 5000 });
    return {
      status: response.status === 200 ? 'online' : 'degraded',
      details: response.data
    };
  } catch (error) {
    console.error('API health check failed:', error);
    return {
      status: 'offline',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
