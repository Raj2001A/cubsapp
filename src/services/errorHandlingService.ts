/**
 * Error Handling Service
 * 
 * This service provides centralized error handling for the application.
 * It includes:
 * - Error logging
 * - Error categorization
 * - User-friendly error messages
 * - Error recovery strategies
 */

import { isNetworkError, isAuthError, isServerError } from '../utils/errorHandling';
import { hasPendingOperations, getPendingOperationsCount } from '../utils/DataSyncManager';

// Error categories
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  UNKNOWN = 'unknown'
}

// Error with additional metadata
export interface EnhancedError extends Error {
  category?: ErrorCategory;
  status?: number;
  timestamp?: Date;
  operationType?: any;
  recoverable?: boolean;
  recoveryStrategy?: string;
  originalError?: any;
}

/**
 * Categorize an error
 */
export const categorizeError = (error: any): ErrorCategory => {
  // Check for network errors
  if (isNetworkError(error)) {
    return ErrorCategory.NETWORK;
  }
  
  // Check for authentication errors
  if (isAuthError(error)) {
    return ErrorCategory.AUTHENTICATION;
  }
  
  // Check for server errors
  if (isServerError(error)) {
    return ErrorCategory.SERVER;
  }
  
  // Check for status code
  if (error.status) {
    if (error.status === 401 || error.status === 403) {
      return ErrorCategory.AUTHORIZATION;
    }
    
    if (error.status >= 400 && error.status < 500) {
      return ErrorCategory.VALIDATION;
    }
    
    if (error.status >= 500) {
      return ErrorCategory.SERVER;
    }
  }
  
  // Default to unknown
  return ErrorCategory.UNKNOWN;
};

/**
 * Enhance an error with additional metadata
 */
export const enhanceError = (error: any, operationType?: any): EnhancedError => {
  const category = categorizeError(error);
  const status = error.status || (category === ErrorCategory.NETWORK ? 0 : undefined);
  
  const enhancedError: EnhancedError = new Error(error.message || 'An unknown error occurred');
  enhancedError.name = error.name || 'Error';
  enhancedError.stack = error.stack;
  enhancedError.category = category;
  enhancedError.status = status;
  enhancedError.timestamp = new Date();
  enhancedError.operationType = operationType;
  enhancedError.originalError = error;
  
  // Determine if the error is recoverable
  enhancedError.recoverable = (
    category === ErrorCategory.NETWORK ||
    category === ErrorCategory.SERVER ||
    (category === ErrorCategory.AUTHENTICATION && operationType !== 'AUTHENTICATION')
  );
  
  // Suggest recovery strategy
  if (enhancedError.recoverable) {
    switch (category) {
      case ErrorCategory.NETWORK:
        enhancedError.recoveryStrategy = 'Check your internet connection and try again.';
        break;
      case ErrorCategory.AUTHENTICATION:
        enhancedError.recoveryStrategy = 'Please log in again to continue.';
        break;
      case ErrorCategory.SERVER:
        enhancedError.recoveryStrategy = 'Please try again later.';
        break;
      default:
        enhancedError.recoveryStrategy = 'Please try again.';
    }
  }
  
  return enhancedError;
};

/**
 * Get a user-friendly error message
 */
export const getUserFriendlyMessage = (error: EnhancedError): string => {
  // If we have pending operations, add that to the message
  const pendingOpsCount = getPendingOperationsCount();
  const pendingOpsSuffix = pendingOpsCount > 0 
    ? ` (${pendingOpsCount} operation${pendingOpsCount > 1 ? 's' : ''} pending synchronization)`
    : '';
  
  switch (error.category) {
    case ErrorCategory.NETWORK:
      return `Network error: Unable to connect to the server${pendingOpsSuffix}. Please check your internet connection.`;
    
    case ErrorCategory.AUTHENTICATION:
      return 'Authentication error: Your session has expired. Please log in again.';
    
    case ErrorCategory.AUTHORIZATION:
      return 'Authorization error: You do not have permission to perform this action.';
    
    case ErrorCategory.VALIDATION:
      return `Validation error: ${error.message || 'The submitted data is invalid.'}`;
    
    case ErrorCategory.SERVER:
      return `Server error: The server encountered an issue${pendingOpsSuffix}. Please try again later.`;
    
    case ErrorCategory.CLIENT:
      return `Application error: ${error.message || 'An unexpected error occurred.'}`;
    
    default:
      return error.message || 'An unknown error occurred. Please try again.';
  }
};

/**
 * Get error severity based on error category
 */
export const getErrorSeverityFromCategory = (category: ErrorCategory): any => {
  switch (category) {
    case ErrorCategory.NETWORK:
      return hasPendingOperations() ? 'WARNING' : 'ERROR';
    
    case ErrorCategory.AUTHENTICATION:
    case ErrorCategory.AUTHORIZATION:
      return 'WARNING';
    
    case ErrorCategory.VALIDATION:
      return 'INFO';
    
    case ErrorCategory.SERVER:
      return 'ERROR';
    
    case ErrorCategory.CLIENT:
      return 'ERROR';
    
    default:
      return 'ERROR';
  }
};

/**
 * Log an error to the console with additional context
 */
export const logError = (error: EnhancedError): void => {
  const timestamp = error.timestamp?.toISOString() || new Date().toISOString();
  const category = error.category || 'unknown';
  const operation = error.operationType || 'unknown';
  
  console.group(`[ERROR] ${timestamp} - ${category} - ${operation}`);
  console.error('Message:', error.message);
  console.error('Stack:', error.stack);
  console.error('Original error:', error.originalError);
  console.groupEnd();
};

/**
 * Handle an error with the UI context
 */
export const handleErrorWithUI = (
  error: any,
  addError: (message: string, severity: any, operation?: any, details?: string) => void,
  setLoading: (operation: any, isLoading: boolean) => void,
  operationType?: any
): EnhancedError => {
  // Enhance the error with metadata
  const enhancedError = enhanceError(error, operationType);
  
  // Log the error
  logError(enhancedError);
  
  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(enhancedError);
  
  // Get severity
  const severity = getErrorSeverityFromCategory(enhancedError.category || ErrorCategory.UNKNOWN);
  
  // Add error to UI context
  addError(
    userMessage,
    severity,
    operationType,
    enhancedError.stack || enhancedError.message
  );
  
  // Clear loading state if operation type is provided
  if (operationType) {
    setLoading(operationType, false);
  }
  
  return enhancedError;
};
