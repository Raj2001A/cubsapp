import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class AppError extends Error {
  code?: string;
  status?: number;
  details?: any;
  isOperational: boolean;

  constructor(message: string, options: { code?: string; status?: number; details?: any; isOperational?: boolean } = {}) {
    super(message);
    this.name = 'AppError';
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
    this.isOperational = options.isOperational !== undefined ? options.isOperational : true;

    // This is necessary for extending Error in TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const handleApiError = (error: unknown): AppError => {
  // If it's already an AppError, return it
  if (error instanceof AppError) {
    return error;
  }

  // Handle Axios errors
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // Network error
    if (!axiosError.response) {
      return new AppError(
        'Network error. Please check your internet connection.',
        { code: 'NETWORK_ERROR', status: 0, isOperational: true }
      );
    }

    // Server responded with an error
    const status = axiosError.response.status;
    const data = axiosError.response.data;

    // Handle specific status codes
    switch (status) {
      case 400:
        return new AppError(
          data?.message || 'Bad request. Please check your input.',
          { code: 'BAD_REQUEST', status, details: data?.details, isOperational: true }
        );
      case 401:
        return new AppError(
          'Authentication required. Please log in again.',
          { code: 'UNAUTHORIZED', status, isOperational: true }
        );
      case 403:
        return new AppError(
          'You do not have permission to perform this action.',
          { code: 'FORBIDDEN', status, isOperational: true }
        );
      case 404:
        return new AppError(
          data?.message || 'The requested resource was not found.',
          { code: 'NOT_FOUND', status, isOperational: true }
        );
      case 409:
        return new AppError(
          data?.message || 'Conflict with the current state of the resource.',
          { code: 'CONFLICT', status, details: data?.details, isOperational: true }
        );
      case 422:
        return new AppError(
          data?.message || 'Validation error. Please check your input.',
          { code: 'VALIDATION_ERROR', status, details: data?.details, isOperational: true }
        );
      case 429:
        return new AppError(
          'Too many requests. Please try again later.',
          { code: 'RATE_LIMIT', status, isOperational: true }
        );
      case 500:
        return new AppError(
          'Server error. Please try again later or contact support.',
          { code: 'SERVER_ERROR', status, isOperational: false }
        );
      default:
        return new AppError(
          data?.message || 'An unexpected error occurred.',
          { code: 'UNKNOWN_ERROR', status, details: data?.details, isOperational: false }
        );
    }
  }

  // Handle other types of errors
  if (error instanceof Error) {
    return new AppError(error.message, { isOperational: false });
  }

  // Handle unknown errors
  return new AppError('An unknown error occurred.', { isOperational: false });
};

export const isOperationalError = (error: unknown): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

export const logError = (error: unknown, context?: string): void => {
  const appError = handleApiError(error);

  // Log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${context || 'Error'}]`, appError);
    if (appError.details) {
      console.error('Details:', appError.details);
    }
  }

  // In a real app, you would send this to an error tracking service
  // like Sentry, LogRocket, etc.
  // errorTrackingService.captureError(appError, { context });
};