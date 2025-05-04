import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { OperationType } from '../types/ui';
import { toastService, ToastType, ToastMessage } from '../services/toastService';

// Define error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Define the error message structure
export interface ErrorMessage {
  id: string;
  message: string;
  severity: ErrorSeverity;
  operation?: OperationType;
  timestamp: Date;
  details?: string;
  dismissed?: boolean;
}

// Define the UI context state
interface UIContextState {
  // Loading states
  isLoading: boolean;
  loadingOperations: OperationType[];
  setLoading: (operation: OperationType, isLoading: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;

  // Error handling
  errors: ErrorMessage[];
  addError: (message: string, severity: ErrorSeverity, operation?: OperationType, details?: string) => void;
  dismissError: (id: string) => void;
  clearErrors: () => void;

  // Toast notifications
  toasts: ToastMessage[];
  showToast: (
    message: string, 
    type?: ToastType, 
    duration?: number, 
    persistent?: boolean
  ) => string;
  dismissToast: (id: string) => void;
}

// Create the context
const UIContext = createContext<UIContextState | undefined>(undefined);

// Provider props
interface UIProviderProps {
  children: ReactNode;
}

// Create the provider component
export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOperations, setLoadingOperations] = useState<OperationType[]>([]);

  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Set loading state for a specific operation
  const setLoading = useCallback((operation: OperationType, loading: boolean) => {
    if (loading) {
      if (!loadingOperations.includes(operation)) {
        setLoadingOperations(prev => [...prev, operation]);
      }
    } else {
      setLoadingOperations(prev => prev.filter(op => op !== operation));
    }
  }, []);

  // Add error message
  const addError = useCallback((message: string, severity: ErrorSeverity = ErrorSeverity.ERROR, operation?: OperationType, details?: string) => {
    const error: ErrorMessage = {
      id: crypto.randomUUID(),
      message,
      severity,
      operation,
      timestamp: new Date(),
      details
    };
    setErrors(prev => [...prev, error]);

    // Show toast notification
    showToast(message, severity === ErrorSeverity.ERROR ? 'error' : 'warning');
  }, []);

  // Dismiss error by ID
  const dismissError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  // Show toast notification
  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    duration: number = 5000, 
    persistent: boolean = false
  ): string => {
    const id = crypto.randomUUID();
    const toast: ToastMessage = {
      id,
      message,
      type,
      duration,
      persistent,
      timestamp: new Date()
    };
    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  // Dismiss toast by ID
  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Update isLoading based on loadingOperations
  useEffect(() => {
    setIsLoading(loadingOperations.length > 0);
  }, [loadingOperations]);

  const value: UIContextState = useMemo(() => ({
    isLoading,
    loadingOperations,
    setLoading,
    setIsLoading,
    errors,
    addError,
    dismissError,
    clearErrors,
    toasts,
    showToast,
    dismissToast
  }), [isLoading, loadingOperations, errors, toasts]);

  return (
    <UIContext.Provider value={value}>
      {children}

      {/* Toast container */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {toasts.map(toast => (
            <div
              key={toast.id}
              style={{
                padding: '12px 16px',
                borderRadius: '4px',
                backgroundColor:
                  toast.type === 'success' ? '#d4edda' :
                  toast.type === 'error' ? '#f8d7da' :
                  toast.type === 'warning' ? '#fff3cd' : '#d1ecf1',
                color:
                  toast.type === 'success' ? '#155724' :
                  toast.type === 'error' ? '#721c24' :
                  toast.type === 'warning' ? '#856404' : '#0c5460',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                minWidth: '250px',
                maxWidth: '400px'
              }}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </UIContext.Provider>
  );
};

// Custom hook to use the UI context
export const useUI = (): UIContextState => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
