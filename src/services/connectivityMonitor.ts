/**
 * Connectivity Monitor Service
 * 
 * Monitors and reports on the connectivity status of various services:
 * - API connectivity
 * - WebSocket connectivity
 * - Database connectivity
 * - Backend service health
 * 
 * Provides real-time status updates and recovery mechanisms
 */

import { BehaviorSubject, Subject, interval, fromEvent, merge } from 'rxjs';
import { debounceTime, filter, map, startWith, takeUntil } from 'rxjs/operators';
import api from './api';
import websocketClient, { ConnectionStatus } from './websocketService';
import logger from '../utils/logger';
import { isAuthenticated as getIsAuthenticated } from './authService';

// Connectivity status interface
export interface ConnectivityStatus {
  api: boolean;
  websocket: boolean;
  database: boolean;
  backendServices: {
    [key: string]: boolean;
  };
  online: boolean;
  lastChecked: Date;
}

// Connectivity monitor class
class ConnectivityMonitor {
  // Status subjects
  private statusSubject = new BehaviorSubject<ConnectivityStatus>({
    api: false,
    websocket: false,
    database: false,
    backendServices: {},
    online: navigator.onLine,
    lastChecked: new Date()
  });

  // Refresh trigger subject
  private refreshTrigger = new Subject<void>();

  // Destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Check intervals (in milliseconds)
  private apiCheckInterval = 30000; // 30 seconds
  private websocketCheckInterval = 30000; // 30 seconds
  private databaseCheckInterval = 60000; // 1 minute
  private backendCheckInterval = 120000; // 2 minutes

  // Retry counts
  private apiRetryCount = 0;
  private websocketRetryCount = 0;
  private databaseRetryCount = 0;

  // Max retry attempts
  private maxRetryAttempts = 5;

  // Recovery in progress flags
  private apiRecoveryInProgress = false;
  private websocketRecoveryInProgress = false;
  private databaseRecoveryInProgress = false;

  constructor() {
    // Initialize online status listener
    this.initOnlineStatusListener();

    // Initialize periodic checks
    this.initPeriodicChecks();

    // Log initial status
    logger.info('Connectivity monitor initialized');
  }

  // Initialize online status listener
  private initOnlineStatusListener(): void {
    // Listen for online/offline events
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).pipe(
      startWith(navigator.onLine),
      takeUntil(this.destroy$)
    ).subscribe(online => {
      // Update status
      const currentStatus = this.statusSubject.value;
      this.statusSubject.next({
        ...currentStatus,
        online,
        lastChecked: new Date()
      });

      // Log status change
      logger.info(`Device ${online ? 'online' : 'offline'}`);

      // Trigger immediate check if we're back online
      if (online) {
        this.refreshTrigger.next();
      }
    });
  }

  // Initialize periodic checks
  private initPeriodicChecks(): void {
    // Set up periodic API checks
    interval(this.apiCheckInterval).pipe(
      startWith(0), // Check immediately on startup
      takeUntil(this.destroy$),
      // Only check if we're online
      filter(() => navigator.onLine)
    ).subscribe(() => {
      this.checkApiConnectivity();
    });

    // Set up periodic WebSocket checks
    interval(this.websocketCheckInterval).pipe(
      startWith(0), // Check immediately on startup
      takeUntil(this.destroy$),
      // Only check if we're online
      filter(() => navigator.onLine)
    ).subscribe(() => {
      this.checkWebSocketConnectivity();
    });

    // Set up periodic database checks
    interval(this.databaseCheckInterval).pipe(
      startWith(0), // Check immediately on startup
      takeUntil(this.destroy$),
      // Only check if we're online and API is connected
      filter(() => navigator.onLine && this.statusSubject.value.api)
    ).subscribe(() => {
      this.checkDatabaseConnectivity();
    });

    // Set up periodic backend service checks
    interval(this.backendCheckInterval).pipe(
      startWith(0), // Check immediately on startup
      takeUntil(this.destroy$),
      // Only check if we're online and API is connected
      filter(() => navigator.onLine && this.statusSubject.value.api)
    ).subscribe(() => {
      this.checkBackendServices();
    });

    // Set up refresh trigger
    this.refreshTrigger.pipe(
      debounceTime(1000), // Debounce to prevent multiple rapid checks
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.checkAllConnectivity();
    });
  }

  // Check API connectivity
  private async checkApiConnectivity(): Promise<void> {
    if (this.apiRecoveryInProgress) return;

    // Only check API health if authenticated
    if (!getIsAuthenticated()) {
      const currentStatus = this.statusSubject.value;
      this.statusSubject.next({
        ...currentStatus,
        api: false,
        lastChecked: new Date()
      });
      return;
    }

    try {
      // Check API health
      const response = await api.health.check();
      const isConnected = response.status === 'ok';

      // Update status
      const currentStatus = this.statusSubject.value;
      if (currentStatus.api !== isConnected) {
        this.statusSubject.next({
          ...currentStatus,
          api: isConnected,
          lastChecked: new Date()
        });

        // Log status change
        logger.info(`API connectivity: ${isConnected ? 'connected' : 'disconnected'}`);

        // Reset retry count on success
        if (isConnected) {
          this.apiRetryCount = 0;
        }
      }
    } catch (error) {
      // Update status to disconnected
      const currentStatus = this.statusSubject.value;
      if (currentStatus.api) {
        this.statusSubject.next({
          ...currentStatus,
          api: false,
          lastChecked: new Date()
        });

        // Log error
        logger.error('API connectivity check failed', {
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Attempt recovery if we're still online
      if (navigator.onLine) {
        this.attemptApiRecovery();
      }
    }
  }

  // Check WebSocket connectivity
  private async checkWebSocketConnectivity(): Promise<void> {
    if (this.websocketRecoveryInProgress) return;

    // Only check WebSocket health if authenticated
    if (!getIsAuthenticated()) {
      const currentStatus = this.statusSubject.value;
      this.statusSubject.next({
        ...currentStatus,
        websocket: false,
        lastChecked: new Date()
      });
      return;
    }

    // Get current WebSocket status
    const wsStatus = websocketClient.getStatus();
    const isConnected = wsStatus === ConnectionStatus.CONNECTED;

    // Update status
    const currentStatus = this.statusSubject.value;
    if (currentStatus.websocket !== isConnected) {
      this.statusSubject.next({
        ...currentStatus,
        websocket: isConnected,
        lastChecked: new Date()
      });

      // Log status change
      logger.info(`WebSocket connectivity: ${isConnected ? 'connected' : 'disconnected'}`);

      // Reset retry count on success
      if (isConnected) {
        this.websocketRetryCount = 0;
      }
    }

    // Attempt recovery if disconnected and we're still online
    if (!isConnected && navigator.onLine) {
      this.attemptWebSocketRecovery();
    }
  }

  // Check database connectivity
  private async checkDatabaseConnectivity(): Promise<void> {
    if (this.databaseRecoveryInProgress) return;

    try {
      // Check database connection
      const response = await api.backend.checkDatabaseConnection();
      const isConnected = response.connected;

      // Update status
      const currentStatus = this.statusSubject.value;
      if (currentStatus.database !== isConnected) {
        this.statusSubject.next({
          ...currentStatus,
          database: isConnected,
          lastChecked: new Date()
        });

        // Log status change
        logger.info(`Database connectivity: ${isConnected ? 'connected' : 'disconnected'}`);

        // Reset retry count on success
        if (isConnected) {
          this.databaseRetryCount = 0;
        }
      }
    } catch (error) {
      // Update status to disconnected
      const currentStatus = this.statusSubject.value;
      if (currentStatus.database) {
        this.statusSubject.next({
          ...currentStatus,
          database: false,
          lastChecked: new Date()
        });

        // Log error
        logger.error('Database connectivity check failed', {
          error: error instanceof Error ? error.message : String(error)
        });
      }

      // Attempt recovery if we're still online and API is connected
      if (navigator.onLine && this.statusSubject.value.api) {
        this.attemptDatabaseRecovery();
      }
    }
  }

  // Check backend services
  private async checkBackendServices(): Promise<void> {
    try {
      // Get backend status
      const response = await api.backend.getStatus();
      
      // Extract backend statuses
      const backendServices: { [key: string]: boolean } = {};
      if (response.backends && Array.isArray(response.backends)) {
        response.backends.forEach((backend: { id: string; status: string }) => {
          backendServices[backend.id] = backend.status === 'online';
        });
      }

      // Update status
      const currentStatus = this.statusSubject.value;
      this.statusSubject.next({
        ...currentStatus,
        backendServices,
        lastChecked: new Date()
      });

      // Log status
      logger.info('Backend services status updated', { backendServices });
    } catch (error) {
      // Log error
      logger.error('Backend services check failed', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // Check all connectivity
  public checkAllConnectivity(): void {
    // Only check if we're online
    if (navigator.onLine) {
      this.checkApiConnectivity();
      this.checkWebSocketConnectivity();
      this.checkDatabaseConnectivity();
      this.checkBackendServices();
    }
  }

  // Attempt API recovery
  private async attemptApiRecovery(): Promise<void> {
    // Check if we've exceeded max retry attempts
    if (this.apiRetryCount >= this.maxRetryAttempts) {
      logger.warn(`API recovery failed after ${this.maxRetryAttempts} attempts`);
      this.apiRetryCount = 0;
      return;
    }

    // Increment retry count
    this.apiRetryCount++;

    // Set recovery in progress flag
    this.apiRecoveryInProgress = true;

    try {
      logger.info(`Attempting API recovery (attempt ${this.apiRetryCount}/${this.maxRetryAttempts})`);

      // Wait with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, this.apiRetryCount - 1), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Check API health
      const response = await api.health.check();
      const isConnected = response.status === 'ok';

      // Update status
      const currentStatus = this.statusSubject.value;
      this.statusSubject.next({
        ...currentStatus,
        api: isConnected,
        lastChecked: new Date()
      });

      // Log status
      if (isConnected) {
        logger.info('API recovery successful');
        this.apiRetryCount = 0;
      } else {
        logger.warn('API still disconnected after recovery attempt');
        // Schedule another recovery attempt
        setTimeout(() => {
          this.attemptApiRecovery();
        }, 5000);
      }
    } catch (error) {
      logger.error('API recovery attempt failed', {
        error: error instanceof Error ? error.message : String(error),
        attempt: this.apiRetryCount
      });

      // Schedule another recovery attempt
      setTimeout(() => {
        this.attemptApiRecovery();
      }, 5000);
    } finally {
      // Clear recovery in progress flag
      this.apiRecoveryInProgress = false;
    }
  }

  // Attempt WebSocket recovery
  private async attemptWebSocketRecovery(): Promise<void> {
    // Check if we've exceeded max retry attempts
    if (this.websocketRetryCount >= this.maxRetryAttempts) {
      logger.warn(`WebSocket recovery failed after ${this.maxRetryAttempts} attempts`);
      this.websocketRetryCount = 0;
      return;
    }

    // Increment retry count
    this.websocketRetryCount++;

    // Set recovery in progress flag
    this.websocketRecoveryInProgress = true;

    try {
      logger.info(`Attempting WebSocket recovery (attempt ${this.websocketRetryCount}/${this.maxRetryAttempts})`);

      // Wait with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, this.websocketRetryCount - 1), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Attempt to connect
      const success = await websocketClient.connect();

      // Update status
      const currentStatus = this.statusSubject.value;
      this.statusSubject.next({
        ...currentStatus,
        websocket: success,
        lastChecked: new Date()
      });

      // Log status
      if (success) {
        logger.info('WebSocket recovery successful');
        this.websocketRetryCount = 0;
      } else {
        logger.warn('WebSocket still disconnected after recovery attempt');
        // Schedule another recovery attempt
        setTimeout(() => {
          this.attemptWebSocketRecovery();
        }, 5000);
      }
    } catch (error) {
      logger.error('WebSocket recovery attempt failed', {
        error: error instanceof Error ? error.message : String(error),
        attempt: this.websocketRetryCount
      });

      // Schedule another recovery attempt
      setTimeout(() => {
        this.attemptWebSocketRecovery();
      }, 5000);
    } finally {
      // Clear recovery in progress flag
      this.websocketRecoveryInProgress = false;
    }
  }

  // Attempt database recovery
  private async attemptDatabaseRecovery(): Promise<void> {
    // Check if we've exceeded max retry attempts
    if (this.databaseRetryCount >= this.maxRetryAttempts) {
      logger.warn(`Database recovery failed after ${this.maxRetryAttempts} attempts`);
      this.databaseRetryCount = 0;
      return;
    }

    // Increment retry count
    this.databaseRetryCount++;

    // Set recovery in progress flag
    this.databaseRecoveryInProgress = true;

    try {
      logger.info(`Attempting database recovery (attempt ${this.databaseRetryCount}/${this.maxRetryAttempts})`);

      // Wait with exponential backoff
      const delay = Math.min(1000 * Math.pow(2, this.databaseRetryCount - 1), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Check database connection
      const response = await api.backend.checkDatabaseConnection();
      const isConnected = response.connected;

      // Update status
      const currentStatus = this.statusSubject.value;
      this.statusSubject.next({
        ...currentStatus,
        database: isConnected,
        lastChecked: new Date()
      });

      // Log status
      if (isConnected) {
        logger.info('Database recovery successful');
        this.databaseRetryCount = 0;
      } else {
        logger.warn('Database still disconnected after recovery attempt');
        // Schedule another recovery attempt
        setTimeout(() => {
          this.attemptDatabaseRecovery();
        }, 5000);
      }
    } catch (error) {
      logger.error('Database recovery attempt failed', {
        error: error instanceof Error ? error.message : String(error),
        attempt: this.databaseRetryCount
      });

      // Schedule another recovery attempt
      setTimeout(() => {
        this.attemptDatabaseRecovery();
      }, 5000);
    } finally {
      // Clear recovery in progress flag
      this.databaseRecoveryInProgress = false;
    }
  }

  // Get current connectivity status
  public getStatus(): ConnectivityStatus {
    return this.statusSubject.value;
  }

  // Subscribe to status changes
  public onStatusChange(callback: (status: ConnectivityStatus) => void): () => void {
    const subscription = this.statusSubject.subscribe(callback);
    return () => subscription.unsubscribe();
  }

  // Force refresh all connectivity checks
  public refreshConnectivity(): void {
    this.refreshTrigger.next();
  }

  // Dispose of resources
  public dispose(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Create singleton instance
const connectivityMonitor = new ConnectivityMonitor();

export default connectivityMonitor;
