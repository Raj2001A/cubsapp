import React, { useState, useCallback, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/Toaster';
import { User } from '@/types/user';
import { useAuth } from '@/context/AuthContext';

// Import all route components (default imports)
import AppContent from '@/components/AppContent';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import EmployeePortal from '@/pages/EmployeePortal';
import SmartEmployeeManagement from '@/pages/SmartEmployeeManagement';
import DocumentList from '@/pages/DocumentList';
import NotificationManagement from '@/pages/NotificationManagement';
import Settings from '@/pages/Settings';
import TestApiConnection from '@/pages/TestApiConnection';
import ErrorBoundary from '@/components/ErrorBoundary';
import FallbackErrorPage from '@/components/FallbackErrorPage';
import { EmployeeList } from '@/pages/EmployeeList';
import { EmployeeDetails } from '@/pages/EmployeeDetails';

// Lazy load components
const EmployeeAdd = React.lazy(() => import('./pages/EmployeeAdd'));
const EmployeeEdit = React.lazy(() => import('./pages/EmployeeEdit'));
const EmployeeDelete = React.lazy(() => import('./pages/EmployeeDelete'));

// Query client
const queryClient = new QueryClient();

// Create a fallback user for guest access
const fallbackUser: User = {
  id: 'guest',
  name: 'Guest User',
  email: 'guest@example.com',
  role: 'employee' as const
};

const AppRoutes = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Get authentication state from the AuthContext instead of managing it locally
  const { isAuthenticated, user } = useAuth();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <Dashboard user={user || fallbackUser} onViewEmployee={() => {}} />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <Dashboard user={user || fallbackUser} onViewEmployee={() => {}} />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employees"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <EmployeeList 
                onViewEmployee={(id) => {
                  window.location.href = `/employee/${id}`;
                }} 
              />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employee/:id"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <EmployeeDetails employeeId="placeholder" />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employee-add"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <Suspense fallback={<div>Loading...</div>}>
                <EmployeeAdd />
              </Suspense>
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employee-delete/:id"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <Suspense fallback={<div>Loading...</div>}>
                <EmployeeDelete />
              </Suspense>
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employee-edit/:id"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <Suspense fallback={<div>Loading...</div>}>
                <EmployeeEdit />
              </Suspense>
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employee-portal"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <EmployeePortal user={user || fallbackUser} />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/smart-employee-management"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <SmartEmployeeManagement user={user || fallbackUser} />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/documents"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <DocumentList />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/notifications"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <NotificationManagement />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <Settings />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/test-api"
        element={
          isAuthenticated ? (
            <AppContent
              isAuthenticated={isAuthenticated}
              user={user || fallbackUser}
              onToggleSidebar={toggleSidebar}
            >
              <TestApiConnection />
            </AppContent>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="*"
        element={
          <FallbackErrorPage error={new Error('Page not found')} />
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">
            <div className="animate-pulse text-primary text-xl">Loading CUBS HR Portal...</div>
          </div>}>
            <AppRoutes />
          </Suspense>
        </ErrorBoundary>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
