/**
 * Real-time Dashboard Component
 * 
 * Displays real-time updates for employee statistics, document status,
 * and other important metrics using WebSocket for live updates.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { useUI } from '../../context/UIContext';
import { ErrorSeverity } from '../../context/UIContext';
import { OperationType } from '../../types/ui';
import { getExpiringVisas } from '../../services/dashboardService';
import LoadingSpinner from '../ui/LoadingSpinner';
import logger from '../../utils/logger';

// Dashboard statistics interface
interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  expiringVisas: number;
  totalDocuments: number;
  lastUpdated: string;
}

// Real-time Dashboard component
const RealTimeDashboard: React.FC = () => {
  // Get WebSocket context
  const { isConnected, subscribe, addMessageHandler, sendWithResponse } = useWebSocket();
  
  // Get UI context
  const { setLoading, addError } = useUI();
  
  // Dashboard state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [expiringVisas, setExpiringVisas] = useState<any[]>([]);
  const [isLoadingVisas, setIsLoadingVisas] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  
  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    if (!isConnected) return;
    
    setIsLoadingStats(true);
    
    try {
      // Request dashboard stats via WebSocket
      const response = await sendWithResponse({
        type: 'dashboard',
        action: 'get_stats',
      });
      
      if (response.type === 'dashboard' && response.action === 'stats' && response.data) {
        const data = response.data as Partial<DashboardStats>;
        setStats({
          totalEmployees: data.totalEmployees ?? 0,
          activeEmployees: data.activeEmployees ?? 0,
          expiringVisas: data.expiringVisas ?? 0,
          totalDocuments: data.totalDocuments ?? 0,
          lastUpdated: new Date().toISOString()
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      logger.error('Error fetching dashboard stats', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      addError(
        'Dashboard Error',
        ErrorSeverity.WARNING,
        OperationType.FETCH_DASHBOARD_DATA,
        'Failed to fetch dashboard statistics. Please try again later.'
      );
    } finally {
      setIsLoadingStats(false);
    }
  }, [isConnected, sendWithResponse, addError]);
  
  // Fetch expiring visas
  const fetchExpiringVisas = useCallback(async () => {
    setIsLoadingVisas(true);
    setLoading(OperationType.GENERAL, true);
    
    try {
      const employees = await getExpiringVisas(10);
      setExpiringVisas(employees || []);
    } catch (error) {
      logger.error('Error fetching expiring visas', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      addError(
        'Visa Data Error',
        ErrorSeverity.WARNING,
        OperationType.GENERAL,
        'Failed to fetch expiring visa data. Please try again later.'
      );
    } finally {
      setIsLoadingVisas(false);
      setLoading(OperationType.GENERAL, false);
    }
  }, [setLoading, addError]);
  
  // Refresh dashboard data
  const refreshDashboard = useCallback(() => {
    fetchDashboardStats();
    fetchExpiringVisas();
  }, [fetchDashboardStats, fetchExpiringVisas]);
  
  // Subscribe to dashboard channel when connected
  useEffect(() => {
    if (isConnected) {
      subscribe('dashboard').then(success => {
        if (success) {
          logger.debug('Subscribed to dashboard channel');
          refreshDashboard();
        }
      });
    }
  }, [isConnected, subscribe, refreshDashboard]);
  
  // Set up database change handler
  useEffect(() => {
    const removeHandler = addMessageHandler('database_change', (message: any) => {
      if (message.data && typeof message.data.table === 'string') {
        logger.debug('Database change notification received', {
          table: message.data.table,
          action: message.data.action
        });
        
        // Refresh dashboard when relevant data changes
        if (['employees', 'documents'].includes(message.data.table)) {
          // Use a small delay to allow multiple changes to batch
          setTimeout(() => {
            setRefreshKey(prev => prev + 1);
          }, 500);
        }
      }
    });
    
    return removeHandler;
  }, [addMessageHandler]);
  
  // Refresh dashboard when refresh key changes
  useEffect(() => {
    refreshDashboard();
  }, [refreshKey, refreshDashboard]);
  
  // Set up periodic refresh (every 5 minutes)
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshDashboard();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [refreshDashboard]);
  
  // Handle manual refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get status class based on days until expiry
  const getExpiryStatusClass = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return 'bg-red-100 text-red-800';
    if (days < 14) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Real-time Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Refresh
        </button>
      </div>
      
      {/* Connection status */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center">
          <div className={`h-3 w-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
          </span>
        </div>
        {stats && (
          <div className="text-xs text-gray-500 mt-1">
            Last updated: {formatDate(stats.lastUpdated)}
          </div>
        )}
      </div>
      
      {/* Dashboard statistics */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Employee Statistics</h2>
          
          {isLoadingStats ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-500 text-2xl font-bold">{stats.totalEmployees}</div>
                <div className="text-sm text-gray-600">Total Employees</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-500 text-2xl font-bold">{stats.activeEmployees}</div>
                <div className="text-sm text-gray-600">Active Employees</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-yellow-500 text-2xl font-bold">{stats.expiringVisas}</div>
                <div className="text-sm text-gray-600">Expiring Visas</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-500 text-2xl font-bold">{stats.totalDocuments}</div>
                <div className="text-sm text-gray-600">Total Documents</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No statistics available. Please check your connection.
            </div>
          )}
        </div>
      </div>
      
      {/* Expiring visas */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Expiring Visas</h2>
          
          {isLoadingVisas ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : expiringVisas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visa Expiry
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days Remaining
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiringVisas.map((visa) => (
                    <tr key={visa.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-800 font-medium">
                                {visa.name ? visa.name[0].toUpperCase() : 'E'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{visa.name}</div>
                            <div className="text-sm text-gray-500">{visa.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(visa.visa_expiry_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getExpiryStatusClass(visa.visa_expiry_date)}`}>
                          {getDaysUntilExpiry(visa.visa_expiry_date) < 0 ? 'Expired' : 'Expiring Soon'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getDaysUntilExpiry(visa.visa_expiry_date)} days
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No expiring visas found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;
