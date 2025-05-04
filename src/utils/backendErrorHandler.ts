/**
 * Backend Error Handler
 * 
 * Provides utilities for handling backend errors and implementing circuit breaker pattern
 */

import { logger } from './logger';

// Circuit breaker configuration
const FAILURE_THRESHOLD = 5; // Number of failures before opening circuit
const RESET_TIMEOUT = 30000; // 30 seconds before trying again
const ERROR_TIMEOUT = 5000; // 5 seconds before considering an endpoint failed

// Circuit breaker state
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  openUntil: number;
  isOpen: boolean;
}

// Global circuit breaker
let globalCircuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  openUntil: 0,
  isOpen: false
};

// Per-endpoint circuit breakers
const endpointCircuitBreakers = new Map<string, CircuitBreakerState>();

/**
 * Check if the global circuit breaker is open
 */
export const isCircuitBreakerOpen = (): boolean => {
  // If circuit is open but reset timeout has passed, close it
  if (globalCircuitBreaker.isOpen && Date.now() > globalCircuitBreaker.openUntil) {
    logger.info('Global circuit breaker reset after timeout');
    resetGlobalCircuitBreaker();
    return false;
  }
  
  return globalCircuitBreaker.isOpen;
};

/**
 * Check if a specific endpoint is blocked
 */
export const isEndpointBlocked = (endpoint: string): boolean => {
  const circuitBreaker = endpointCircuitBreakers.get(endpoint);
  
  if (!circuitBreaker) {
    return false;
  }
  
  // If circuit is open but reset timeout has passed, close it
  if (circuitBreaker.isOpen && Date.now() > circuitBreaker.openUntil) {
    logger.info(`Endpoint circuit breaker reset for ${endpoint}`);
    resetEndpointCircuitBreaker(endpoint);
    return false;
  }
  
  return circuitBreaker.isOpen;
};

/**
 * Record a successful API call
 */
export const recordSuccess = (endpoint: string): void => {
  // Reset failure count for the endpoint
  if (endpointCircuitBreakers.has(endpoint)) {
    const circuitBreaker = endpointCircuitBreakers.get(endpoint)!;
    circuitBreaker.failures = 0;
    circuitBreaker.isOpen = false;
  }
  
  // Reduce global failure count (but don't go below 0)
  globalCircuitBreaker.failures = Math.max(0, globalCircuitBreaker.failures - 1);
  
  // If we've had enough successes, close the global circuit breaker
  if (globalCircuitBreaker.failures === 0) {
    globalCircuitBreaker.isOpen = false;
  }
};

/**
 * Record a failed API call
 */
export const recordFailure = (endpoint: string): void => {
  // Get or create circuit breaker for the endpoint
  let circuitBreaker = endpointCircuitBreakers.get(endpoint);
  
  if (!circuitBreaker) {
    circuitBreaker = {
      failures: 0,
      lastFailure: 0,
      openUntil: 0,
      isOpen: false
    };
    endpointCircuitBreakers.set(endpoint, circuitBreaker);
  }
  
  const now = Date.now();
  
  // If this is a new failure (not within ERROR_TIMEOUT of the last one)
  if (now - circuitBreaker.lastFailure > ERROR_TIMEOUT) {
    circuitBreaker.failures++;
    circuitBreaker.lastFailure = now;
    
    // If we've reached the threshold, open the circuit breaker
    if (circuitBreaker.failures >= FAILURE_THRESHOLD) {
      circuitBreaker.isOpen = true;
      circuitBreaker.openUntil = now + RESET_TIMEOUT;
      logger.warn(`Circuit breaker opened for endpoint ${endpoint} after ${circuitBreaker.failures} failures`);
    }
    
    // Also increment the global failure count
    globalCircuitBreaker.failures++;
    globalCircuitBreaker.lastFailure = now;
    
    // If we've reached the global threshold, open the global circuit breaker
    if (globalCircuitBreaker.failures >= FAILURE_THRESHOLD * 2) {
      globalCircuitBreaker.isOpen = true;
      globalCircuitBreaker.openUntil = now + RESET_TIMEOUT;
      logger.warn(`Global circuit breaker opened after ${globalCircuitBreaker.failures} failures`);
    }
  }
};

/**
 * Reset the global circuit breaker
 */
export const resetGlobalCircuitBreaker = (): void => {
  globalCircuitBreaker = {
    failures: 0,
    lastFailure: 0,
    openUntil: 0,
    isOpen: false
  };
  
  logger.info('Global circuit breaker reset');
};

/**
 * Reset a specific endpoint circuit breaker
 */
export const resetEndpointCircuitBreaker = (endpoint: string): void => {
  endpointCircuitBreakers.set(endpoint, {
    failures: 0,
    lastFailure: 0,
    openUntil: 0,
    isOpen: false
  });
  
  logger.info(`Circuit breaker reset for endpoint ${endpoint}`);
};

/**
 * Calculate exponential backoff delay
 */
export const calculateBackoff = (attempt: number, baseDelay: number): number => {
  // Add some jitter to prevent all clients from retrying at the same time
  const jitter = Math.random() * 100;
  return Math.min(baseDelay * Math.pow(2, attempt) + jitter, 30000); // Cap at 30 seconds
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
    } catch (error: any) {
      lastError = error;
      
      // Don't retry client errors (4xx)
      if (error.status && error.status >= 400 && error.status < 500) {
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

/**
 * Get circuit breaker status for all endpoints
 */
export const getCircuitBreakerStatus = (): {
  global: CircuitBreakerState,
  endpoints: Record<string, CircuitBreakerState>
} => {
  const endpoints: Record<string, CircuitBreakerState> = {};
  
  for (const [endpoint, state] of endpointCircuitBreakers.entries()) {
    endpoints[endpoint] = { ...state };
  }
  
  return {
    global: { ...globalCircuitBreaker },
    endpoints
  };
};
