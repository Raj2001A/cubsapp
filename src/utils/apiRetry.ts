/**
 * API Retry Utility
 * 
 * This utility provides functions to handle API retries with exponential backoff
 * and circuit breaking to prevent overwhelming the server when it's down.
 */

// Circuit breaker state
interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  endpoints: Record<string, {
    failureCount: number;
    lastFailureTime: number;
    isBlocked: boolean;
  }>;
}

// Default circuit breaker configuration
const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_RESET_TIMEOUT = 30000; // 30 seconds
const DEFAULT_ENDPOINT_FAILURE_THRESHOLD = 3;
const DEFAULT_ENDPOINT_RESET_TIMEOUT = 10000; // 10 seconds

// Initialize circuit breaker state
let circuitBreaker: CircuitBreakerState = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  endpoints: {}
};

/**
 * Reset the circuit breaker
 */
export const resetCircuitBreaker = (): void => {
  circuitBreaker = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    endpoints: {}
  };
};

/**
 * Check if the circuit breaker is open (blocking all requests)
 */
export const isCircuitBreakerOpen = (): boolean => {
  // If the circuit breaker is open, check if it's time to try again
  if (circuitBreaker.isOpen) {
    const now = Date.now();
    if (now - circuitBreaker.lastFailureTime > DEFAULT_RESET_TIMEOUT) {
      // Reset the circuit breaker to half-open state
      circuitBreaker.isOpen = false;
      circuitBreaker.failureCount = Math.floor(circuitBreaker.failureCount / 2);
      return false;
    }
    return true;
  }
  return false;
};

/**
 * Check if a specific endpoint is blocked
 */
export const isEndpointBlocked = (endpoint: string): boolean => {
  if (!circuitBreaker.endpoints[endpoint]) {
    return false;
  }

  const endpointState = circuitBreaker.endpoints[endpoint];
  
  if (endpointState.isBlocked) {
    const now = Date.now();
    if (now - endpointState.lastFailureTime > DEFAULT_ENDPOINT_RESET_TIMEOUT) {
      // Reset the endpoint to unblocked state
      endpointState.isBlocked = false;
      endpointState.failureCount = Math.floor(endpointState.failureCount / 2);
      return false;
    }
    return true;
  }
  
  return false;
};

/**
 * Record a successful API call
 */
export const recordSuccess = (endpoint: string): void => {
  // Reset failure count for the endpoint
  if (circuitBreaker.endpoints[endpoint]) {
    circuitBreaker.endpoints[endpoint].failureCount = 0;
    circuitBreaker.endpoints[endpoint].isBlocked = false;
  }
  
  // Reduce overall failure count
  circuitBreaker.failureCount = Math.max(0, circuitBreaker.failureCount - 1);
  
  // If failure count is low enough, close the circuit breaker
  if (circuitBreaker.failureCount < DEFAULT_FAILURE_THRESHOLD / 2) {
    circuitBreaker.isOpen = false;
  }
};

/**
 * Record a failed API call
 */
export const recordFailure = (endpoint: string): void => {
  const now = Date.now();
  
  // Update endpoint state
  if (!circuitBreaker.endpoints[endpoint]) {
    circuitBreaker.endpoints[endpoint] = {
      failureCount: 0,
      lastFailureTime: 0,
      isBlocked: false
    };
  }
  
  const endpointState = circuitBreaker.endpoints[endpoint];
  endpointState.failureCount++;
  endpointState.lastFailureTime = now;
  
  // Block the endpoint if it has failed too many times
  if (endpointState.failureCount >= DEFAULT_ENDPOINT_FAILURE_THRESHOLD) {
    endpointState.isBlocked = true;
  }
  
  // Update overall circuit breaker state
  circuitBreaker.failureCount++;
  circuitBreaker.lastFailureTime = now;
  
  // Open the circuit breaker if there have been too many failures
  if (circuitBreaker.failureCount >= DEFAULT_FAILURE_THRESHOLD) {
    circuitBreaker.isOpen = true;
  }
};

/**
 * Calculate exponential backoff delay
 */
export const calculateBackoff = (attempt: number, baseDelay: number = 1000): number => {
  // Add some jitter to prevent all retries happening at the same time
  const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
  return Math.min(baseDelay * Math.pow(2, attempt) * jitter, 30000); // Cap at 30 seconds
};

/**
 * Execute an API call with retry logic and circuit breaking
 */
export const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  endpoint: string,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  // Check if the circuit breaker is open
  if (isCircuitBreakerOpen()) {
    throw new Error('Service is currently unavailable. Please try again later.');
  }
  
  // Check if the specific endpoint is blocked
  if (isEndpointBlocked(endpoint)) {
    throw new Error(`The requested endpoint (${endpoint}) is temporarily unavailable. Please try again later.`);
  }
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Execute the operation
      const result = await operation();
      
      // Record success
      recordSuccess(endpoint);
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry client errors (4xx)
      if (typeof error === 'object' && error !== null && 'status' in error && typeof (error as any).status === 'number' && (error as any).status >= 400 && (error as any).status < 500) {
        throw error;
      }
      
      // Record failure
      recordFailure(endpoint);
      
      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      const delay = calculateBackoff(attempt, baseDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};
