import React, { ReactNode } from 'react';
import { EmployeeProvider } from './EmployeeContext';
import { DocumentProvider } from './DocumentContext';
// UIProvider is now used only in AppWithContext.tsx
import { useAuth } from './AuthContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';

interface AppProviderProps {
  children: ReactNode;
}

// Combined provider that wraps all context providers
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Get authentication state from AuthContext
  const { isAuthenticated } = useAuth();
  return (
    <ErrorBoundary>
      {/* UIProvider removed - already exists in AppWithContext.tsx */}
      <EmployeeProvider isAuthenticated={isAuthenticated}>
        <DocumentProvider isAuthenticated={isAuthenticated}>
          {children}
        </DocumentProvider>
      </EmployeeProvider>
    </ErrorBoundary>
  );
};
