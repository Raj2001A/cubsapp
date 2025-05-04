/**
 * Connectivity Status Component
 *
 * Displays the current connectivity status of the application
 * Shows API, WebSocket, and database connection status
 * Provides manual refresh option
 */

import React, { useState, useEffect } from 'react';
import connectivityMonitor, { ConnectivityStatus as ConnectivityStatusType } from '../../services/connectivityMonitor';
import { useUI } from '../../context/UIContext';
// import { ErrorSeverity, OperationType } from '../../context/UIContext';

// Status indicator props
interface StatusIndicatorProps {
  connected: boolean;
  label: string;
}

// Status indicator component
const StatusIndicator: React.FC<StatusIndicatorProps> = ({ connected, label }) => {
  return (
    <div className="flex items-center">
      <div className={`h-3 w-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-sm font-medium">{label}: {connected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
};

// Connectivity status component
const ConnectivityStatus: React.FC = () => {
  // Get UI context
  const { showToast } = useUI();

  // Status state
  const [status, setStatus] = useState<ConnectivityStatusType>(connectivityMonitor.getStatus());
  const [expanded, setExpanded] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Subscribe to status changes
  useEffect(() => {
    const unsubscribe = connectivityMonitor.onStatusChange(newStatus => {
      setStatus(newStatus);

      // Show toast for important status changes
      if (!status.online && newStatus.online) {
        showToast?.('Device is back online', 'success');
      } else if (status.online && !newStatus.online) {
        showToast?.('Device is offline', 'warning');
      }

      if (!status.api && newStatus.api) {
        showToast?.('API connection restored', 'success');
      } else if (status.api && !newStatus.api) {
        showToast?.('API connection lost', 'error');
      }

      if (!status.websocket && newStatus.websocket) {
        showToast?.('Real-time updates connected', 'success');
      } else if (status.websocket && !newStatus.websocket) {
        showToast?.('Real-time updates disconnected', 'warning');
      }

      if (!status.database && newStatus.database) {
        showToast?.('Database connection restored', 'success');
      } else if (status.database && !newStatus.database) {
        showToast?.('Database connection lost', 'error');
      }
    });

    return unsubscribe;
  }, [status, showToast]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    connectivityMonitor.refreshConnectivity();

    // Reset refreshing state after 2 seconds
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    setExpanded(prev => !prev);
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleTimeString();
  };

  // Get overall status
  const getOverallStatus = () => {
    if (!status.online) {
      return 'Offline';
    }

    if (!status.api) {
      return 'API Disconnected';
    }

    if (!status.database) {
      return 'Database Disconnected';
    }

    if (!status.websocket) {
      return 'Limited Connectivity';
    }

    return 'Connected';
  };

  // Get overall status class
  const getOverallStatusClass = () => {
    if (!status.online) {
      return 'bg-gray-500';
    }

    if (!status.api || !status.database) {
      return 'bg-red-500';
    }

    if (!status.websocket) {
      return 'bg-yellow-500';
    }

    return 'bg-green-500';
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center">
          <div className={`h-4 w-4 rounded-full mr-3 ${getOverallStatusClass()}`}></div>
          <span className="font-medium">System Status: {getOverallStatus()}</span>
        </div>
        <div className="flex items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="mr-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
            disabled={refreshing}
          >
            <svg
              className={`h-5 w-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <svg
            className={`h-5 w-5 text-gray-500 transform transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 py-3 border-t border-gray-200 space-y-2">
          <StatusIndicator connected={status.online} label="Internet" />
          <StatusIndicator connected={status.api} label="API" />
          <StatusIndicator connected={status.websocket} label="Real-time Updates" />
          <StatusIndicator connected={status.database} label="Database" />

          {/* Backend services */}
          {Object.keys(status.backendServices).length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Backend Services</h4>
              <div className="space-y-1">
                {Object.entries(status.backendServices).map(([id, connected]) => (
                  <StatusIndicator key={id} connected={connected} label={id} />
                ))}
              </div>
            </div>
          )}

          {/* Last checked */}
          <div className="text-xs text-gray-500 mt-2">
            Last checked: {formatDate(status.lastChecked)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectivityStatus;
