import React, { useState, useEffect } from 'react';
import { useUI } from '../../context/UIContext';
import LoadingSpinner from './LoadingSpinner';
import { OperationType } from '../../types/ui';

const GlobalLoadingIndicator: React.FC = () => {
  const { isLoading, loadingOperations } = useUI();
  const [showLoading, setShowLoading] = useState(false);

  // Add a small delay before showing the loading indicator to prevent flashing
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      // Only show loading indicator if the operation takes longer than 300ms
      timer = setTimeout(() => {
        setShowLoading(true);
      }, 300);
    } else {
      setShowLoading(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isLoading]);

  if (!showLoading) {
    return null;
  }

  // Get a message based on the current loading operations
  const getMessage = (): string => {
    if (loadingOperations.length === 0) {
      return 'Loading...';
    }

    const operation = loadingOperations[0];

    // Convert operation type to a user-friendly message
    switch (operation) {
      case OperationType.FETCH_EMPLOYEES:
        return 'Loading employees...';
      case OperationType.FETCH_DOCUMENTS:
        return 'Loading documents...';
      case OperationType.ADD_EMPLOYEE:
        return 'Adding employee...';
      case OperationType.UPDATE_EMPLOYEE:
        return 'Updating employee...';
      case OperationType.DELETE_EMPLOYEE:
        return 'Deleting employee...';
      case OperationType.ADD_DOCUMENT:
        return 'Adding document...';
      case OperationType.UPDATE_DOCUMENT:
        return 'Updating document...';
      case OperationType.DELETE_DOCUMENT:
        return 'Deleting document...';
      case OperationType.IMPORT_DATA:
        return 'Importing data...';
      case 'export_data':
        return 'Exporting data...';
      case OperationType.AUTHENTICATION:
        return 'Authenticating...';
      default:
        return 'Loading...';
    }
  };

  return <LoadingSpinner fullScreen message={getMessage()} />;
};

export default GlobalLoadingIndicator;
