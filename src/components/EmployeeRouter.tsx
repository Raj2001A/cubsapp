import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import EmployeeDetailsPage from '../EmployeeDetailsPage';
import { useUI } from '../context/UIContext';
import { ErrorSeverity } from '../types/ui';

/**
 * Router component that validates the employee ID parameter before rendering the details page
 * This helps prevent API calls with undefined IDs which cause errors
 */
const EmployeeRouter: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addError } = useUI();
  
  // If ID is missing or invalid, show error and redirect
  if (!id) {
    // Add error notification
    setTimeout(() => {
      addError(
        'Invalid employee ID: Missing or undefined ID parameter', 
        ErrorSeverity.WARNING,
        undefined,
        'Please select an employee from the list to view details'
      );
    }, 0);
    
    // Redirect to employee list
    return <Navigate to="/employees" replace />;
  }
  
  // ID is valid, render the details page
  return <EmployeeDetailsPage />;
};

export default EmployeeRouter;
