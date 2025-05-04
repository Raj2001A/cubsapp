import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PrivateRouteProps {
  children?: React.ReactNode;
  requiredRole?: 'admin' | 'employee';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Simple loading indicator
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if required
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h3>Access Denied</h3>
        <p>You don't have permission to access this page.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: '10px', padding: '8px 16px', background: '#4CAF50', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Go back home
        </a>
      </div>
    );
  }

  // Return children or outlet for nested routes
  return <>{children || <Outlet />}</>;
};

export default PrivateRoute;