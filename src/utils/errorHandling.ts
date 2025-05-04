/**
 * Utility functions for error handling throughout the application
 */
// Removed unused OperationType, ErrorSeverity imports

// Network error detection
export const isNetworkError = (error: any): boolean => {
  return (
    error.message === 'Failed to fetch' ||
    error.message === 'Network request failed' ||
    error.message.includes('network') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('ETIMEDOUT') ||
    error.message.includes('ENOTFOUND')
  );
};

// Authentication error detection
export const isAuthError = (error: any): boolean => {
  return (
    error.message.includes('401') ||
    error.message.includes('403') ||
    error.message.includes('unauthorized') ||
    error.message.includes('forbidden') ||
    error.message.includes('authentication') ||
    error.message.includes('token')
  );
};

// Server error detection
export const isServerError = (error: any): boolean => {
  return (
    error.message.includes('500') ||
    error.message.includes('502') ||
    error.message.includes('503') ||
    error.message.includes('504') ||
    error.message.includes('internal server error')
  );
};

// Format error for display
export const formatErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return 'Network error: Unable to connect to the server. Please check your internet connection and try again.';
  }

  if (isAuthError(error)) {
    return 'Authentication error: Your session may have expired. Please log in again.';
  }

  if (isServerError(error)) {
    return 'Server error: The server encountered an error. Please try again later.';
  }

  // Return the original error message if it's not a known type
  return error.message || 'An unknown error occurred';
};

// Get error severity based on error type
export const getErrorSeverity = (error: any): any => {
  if (isNetworkError(error)) {
    return 'WARNING';
  }

  if (isAuthError(error)) {
    return 'WARNING';
  }

  if (isServerError(error)) {
    return 'ERROR';
  }

  // Default to ERROR for unknown error types
  return 'ERROR';
};

// Retry mechanism for API calls
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry auth errors or client errors (4xx)
      if (
        isAuthError(error) ||
        (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string' && (error as any).message.match(/4\d\d/))
      ) {
        throw error;
      }

      // Wait before retrying
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
};

// Create a standardized error handler for API calls
export const createErrorHandler = (
  addError: (message: string, severity: any, operation?: any, details?: string) => void,
  setLoading: (operation: any, isLoading: boolean) => void,
  operation: any,
  customMessage?: string
) => {
  return (error: any) => {
    const formattedMessage = customMessage || formatErrorMessage(error);
    const severity = getErrorSeverity(error);

    addError(
      formattedMessage,
      severity,
      operation,
      error instanceof Error ? error.stack || error.message : String(error)
    );

    // Ensure loading state is cleared
    setLoading(operation, false);

    // Log the error for debugging
    console.error(`Error in operation ${operation}:`, error);

    // Return the error for further handling
    return error;
  };
};

// Offline detection
export const isOffline = (): boolean => {
  return !navigator.onLine;
};

// Check if the API is available
export const checkApiAvailability = async (apiUrl: string): Promise<boolean> => {
  try {
    // First try the root endpoint
    console.log('Checking backend availability...');
    const rootResponse = await fetch(apiUrl, {
      method: 'GET',
      // Disable cache to ensure we're getting a fresh response
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    console.log('Root endpoint response:', rootResponse.status, rootResponse.ok);

    if (!rootResponse.ok) {
      return false;
    }

    // Then check the employees endpoint
    const employeesUrl = `${apiUrl}/api/employees`;
    console.log('Checking API availability at:', employeesUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(employeesUrl, {
        method: 'GET',
        signal: controller.signal,
        // Disable cache to ensure we're getting a fresh response
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      clearTimeout(timeoutId);
      console.log('Employees endpoint response:', response.status, response.ok);
      return response.ok;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      // If we get an abort error, the API might still be available but just slow
      // In this case, we'll trust the root endpoint check
      if (
        typeof fetchError === 'object' && fetchError !== null && 'name' in fetchError && (fetchError as any).name === 'AbortError'
      ) {
        console.warn('API employees endpoint check timed out, but root endpoint is available');
        return true;
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('API availability check failed:', error);
    return false;
  }
};
