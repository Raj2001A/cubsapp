import React from 'react';
import App from './App';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { ToastProvider } from './components/ui/use-toast';
import { EmployeeProvider } from './context/EmployeeContext';
import { DocumentProvider } from './context/DocumentContext';
import RenderBreaker from './utils/RenderBreaker';

const AppWithContext: React.FC = () => {
  return (
    <RenderBreaker maxRenders={100}>
      <UIProvider>
        <AuthProvider>
          <AppProvider>
            <EmployeeProvider isAuthenticated={true}>
              {/* Pass empty documents array to DocumentProvider to break circular dependency */}
              <DocumentProvider>
                <ToastProvider>
                  <App />
                </ToastProvider>
              </DocumentProvider>
            </EmployeeProvider>
          </AppProvider>
        </AuthProvider>
      </UIProvider>
    </RenderBreaker>
  );
};

export default AppWithContext;
