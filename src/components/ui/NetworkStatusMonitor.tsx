import React, { useEffect, useState } from 'react';
import { useUI } from '../../context/UIContext';
import { ErrorSeverity, OperationType } from '../../types/ui';
import ConnectivityStatus from './ConnectivityStatus';
import connectivityMonitor from '../../services/connectivityMonitor';

const NetworkStatusMonitor: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { addError, showToast } = useUI();

  useEffect(() => {
    // Skip if UI context is not ready
    if (!addError || !showToast) return;

    // Function to handle online status change
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Your internet connection has been restored.', 'success');
    };

    // Function to handle offline status change
    const handleOffline = () => {
      setIsOnline(false);
      addError(
        'You are currently offline',
        ErrorSeverity.WARNING,
        OperationType.GENERAL,
        'Your internet connection has been lost. Some features may not work properly until your connection is restored.'
      );
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [addError, showToast]);

  // Initialize connectivity monitor on mount
  useEffect(() => {
    // Refresh connectivity status
    connectivityMonitor.refreshConnectivity();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '300px',
        zIndex: 9999,
      }}
    >
      <ConnectivityStatus />

      {/* Show offline indicator when offline */}
      {!isOnline && (
        <div
          style={{
            marginTop: '10px',
            backgroundColor: '#fff3cd',
            color: '#856404',
            padding: '10px 15px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="1" x2="23" y2="23"></line>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
            <line x1="12" y1="20" x2="12.01" y2="20"></line>
          </svg>
          <span>You are offline. Some features may not be available.</span>
        </div>
      )}
    </div>
  );
};

export default NetworkStatusMonitor;
