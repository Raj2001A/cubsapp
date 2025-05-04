/**
 * Backend Health Service
 * 
 * Monitors the health of backend services and provides status information
 */

import { api } from './api';
import logger from '../utils/logger';
import { resetGlobalCircuitBreaker, resetEndpointCircuitBreaker } from '../utils/backendErrorHandler';

// Health check interval in milliseconds
const HEALTH_CHECK_INTERVAL = 60000; // 1 minute

// Backend status types
export enum BackendStatus {
  ONLINE = 'online',
  DEGRADED = 'degraded',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown'
}

// Backend type
export interface Backend {
  id: string;
  name: string;
  type: string;
  status: BackendStatus;
  lastChecked: number;
  error?: string;
}

// Backend health service state
interface BackendHealthState {
  backends: Backend[];
  overallStatus: BackendStatus;
  lastChecked: number;
  isChecking: boolean;
}

// Initial state
const state: BackendHealthState = {
  backends: [],
  overallStatus: BackendStatus.UNKNOWN,
  lastChecked: 0,
  isChecking: false
};

// Subscribers to health updates
const subscribers: ((state: BackendHealthState) => void)[] = [];

/**
 * Subscribe to backend health updates
 * @param callback Function to call when health state changes
 * @returns Unsubscribe function
 */
export const subscribeToHealthUpdates = (callback: (state: BackendHealthState) => void): () => void => {
  subscribers.push(callback);
  
  // Immediately notify with current state
  callback({ ...state });
  
  // Return unsubscribe function
  return () => {
    const index = subscribers.indexOf(callback);
    if (index !== -1) {
      subscribers.splice(index, 1);
    }
  };
};

/**
 * Notify all subscribers of health state changes
 */
const notifySubscribers = () => {
  // Create a copy of the state to prevent modification
  const stateCopy = { ...state };
  
  // Notify all subscribers
  subscribers.forEach(callback => {
    try {
      callback(stateCopy);
    } catch (error) {
      logger.error('Error in health update subscriber', { error });
    }
  });
};

/**
 * Check backend health
 * @param force Force a check even if one was done recently
 * @returns Promise that resolves when check is complete
 */
export const checkBackendHealth = async (force: boolean = false): Promise<BackendHealthState> => {
  const now = Date.now();
  
  // Skip if a check is already in progress
  if (state.isChecking) {
    logger.debug('Health check already in progress, skipping');
    return { ...state };
  }
  
  // Skip if a check was done recently and not forced
  if (!force && now - state.lastChecked < HEALTH_CHECK_INTERVAL) {
    logger.debug('Health check done recently, skipping');
    return { ...state };
  }
  
  // Mark as checking
  state.isChecking = true;
  
  try {
    logger.info('Checking backend health');
    
    // Get backend status from API
    const response = await api.backend.getStatus();
    
    // Update state with new backend information
    if (response && response.backends) {
      state.backends = response.backends.map((backend: any) => ({
        id: backend.id,
        name: backend.name,
        type: backend.type,
        status: backend.status,
        lastChecked: now,
        error: backend.error
      }));
      
      // Determine overall status
      if (state.backends.some(b => b.status === BackendStatus.ONLINE)) {
        state.overallStatus = BackendStatus.ONLINE;
      } else if (state.backends.some(b => b.status === BackendStatus.DEGRADED)) {
        state.overallStatus = BackendStatus.DEGRADED;
      } else if (state.backends.every(b => b.status === BackendStatus.OFFLINE)) {
        state.overallStatus = BackendStatus.OFFLINE;
      } else {
        state.overallStatus = BackendStatus.UNKNOWN;
      }
      
      // If we have at least one online backend, reset circuit breakers
      if (state.overallStatus === BackendStatus.ONLINE) {
        resetGlobalCircuitBreaker();
        
        // Reset circuit breakers for endpoints related to online backends
        state.backends.forEach(backend => {
          if (backend.status === BackendStatus.ONLINE) {
            resetEndpointCircuitBreaker(`/api/${backend.id}`);
          }
        });
      }
    } else {
      // If we couldn't get backend status, mark as unknown
      state.overallStatus = BackendStatus.UNKNOWN;
    }
    
    // Update last checked timestamp
    state.lastChecked = now;
    
    // Notify subscribers
    notifySubscribers();
    
    return { ...state };
  } catch (error) {
    logger.error('Error checking backend health', { error });
    
    // Mark as offline if we couldn't connect
    state.overallStatus = BackendStatus.OFFLINE;
    
    // Update last checked timestamp
    state.lastChecked = now;
    
    // Notify subscribers
    notifySubscribers();
    
    return { ...state };
  } finally {
    // Mark as not checking
    state.isChecking = false;
  }
};

/**
 * Start periodic health checks
 * @returns Function to stop health checks
 */
export const startHealthChecks = (): () => void => {
  // Disable health checks completely for now - fix for infinite loop issues
  // Return a no-op function since we're not starting any checks
  return () => { /* no-op cleanup function */ };
};

/**
 * Get current backend health state
 * @returns Current health state
 */
export const getBackendHealth = (): BackendHealthState => {
  return { ...state };
};

/**
 * Force a backend health check
 * @returns Promise that resolves when check is complete
 */
export const forceHealthCheck = (): Promise<BackendHealthState> => {
  return checkBackendHealth(true);
};

// Export default object
export default {
  checkBackendHealth,
  startHealthChecks,
  getBackendHealth,
  forceHealthCheck,
  subscribeToHealthUpdates
};
