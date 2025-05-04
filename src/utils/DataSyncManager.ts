/**
 * DataSyncManager - Handles offline data synchronization
 * 
 * This utility provides functionality to:
 * 1. Queue operations when offline
 * 2. Sync queued operations when back online
 * 3. Provide offline data access
 */

// Types for pending operations
type OperationType = 'create' | 'update' | 'delete';
type EntityType = 'employee' | 'document' | 'company';

interface PendingOperation {
  id: string;
  type: OperationType;
  entityType: EntityType;
  data: any;
  timestamp: number;
  retryCount: number;
}

// Local storage keys
const PENDING_OPERATIONS_KEY = 'emp_mgmt_pending_operations';
const OFFLINE_DATA_KEY = 'emp_mgmt_offline_data';

// Maximum retry attempts
const MAX_RETRY_COUNT = 3;

/**
 * Queue an operation to be performed when back online
 */
export const queueOperation = (
  type: OperationType,
  entityType: EntityType,
  data: any
): string => {
  // Generate a unique ID for the operation
  const id = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create the pending operation
  const operation: PendingOperation = {
    id,
    type,
    entityType,
    data,
    timestamp: Date.now(),
    retryCount: 0
  };
  
  // Get existing pending operations
  const pendingOperations = getPendingOperations();
  
  // Add the new operation
  pendingOperations.push(operation);
  
  // Save the updated list
  localStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(pendingOperations));
  
  return id;
};

/**
 * Get all pending operations
 */
export const getPendingOperations = (): PendingOperation[] => {
  const storedOperations = localStorage.getItem(PENDING_OPERATIONS_KEY);
  return storedOperations ? JSON.parse(storedOperations) : [];
};

/**
 * Remove a pending operation
 */
export const removePendingOperation = (id: string): void => {
  const pendingOperations = getPendingOperations();
  const updatedOperations = pendingOperations.filter(op => op.id !== id);
  localStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(updatedOperations));
};

/**
 * Update a pending operation's retry count
 */
export const updateOperationRetryCount = (id: string): boolean => {
  const pendingOperations = getPendingOperations();
  const operation = pendingOperations.find(op => op.id === id);
  
  if (!operation) {
    return false;
  }
  
  // Increment retry count
  operation.retryCount += 1;
  
  // Check if max retries reached
  if (operation.retryCount >= MAX_RETRY_COUNT) {
    // Remove the operation if max retries reached
    removePendingOperation(id);
    return false;
  }
  
  // Update the operation
  const updatedOperations = pendingOperations.map(op => 
    op.id === id ? operation : op
  );
  
  localStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(updatedOperations));
  return true;
};

/**
 * Save data for offline access
 */
export const saveOfflineData = (entityType: EntityType, data: any[]): void => {
  // Get existing offline data
  const offlineData = getOfflineData();
  
  // Update the data for the entity type
  offlineData[entityType] = data;
  
  // Save the updated data
  localStorage.setItem(OFFLINE_DATA_KEY, JSON.stringify(offlineData));
};

/**
 * Get offline data
 */
export const getOfflineData = (): Record<EntityType, any[]> => {
  const storedData = localStorage.getItem(OFFLINE_DATA_KEY);
  return storedData ? JSON.parse(storedData) : {
    employee: [],
    document: [],
    company: []
  };
};

/**
 * Get offline data for a specific entity type
 */
export const getOfflineDataByType = (entityType: EntityType): any[] => {
  const offlineData = getOfflineData();
  return offlineData[entityType] || [];
};

/**
 * Clear all offline data
 */
export const clearOfflineData = (): void => {
  localStorage.removeItem(OFFLINE_DATA_KEY);
};

/**
 * Clear all pending operations
 */
export const clearPendingOperations = (): void => {
  localStorage.removeItem(PENDING_OPERATIONS_KEY);
};

/**
 * Check if there are pending operations
 */
export const hasPendingOperations = (): boolean => {
  return getPendingOperations().length > 0;
};

/**
 * Get the count of pending operations
 */
export const getPendingOperationsCount = (): number => {
  return getPendingOperations().length;
};

/**
 * Apply optimistic updates to offline data
 */
export const applyOptimisticUpdate = (
  entityType: EntityType,
  operation: OperationType,
  data: any
): void => {
  const offlineData = getOfflineDataByType(entityType);
  let updatedData: any[] = [];
  
  switch (operation) {
    case 'create':
      // Add the new entity to the offline data
      updatedData = [...offlineData, data];
      break;
      
    case 'update':
      // Update the entity in the offline data
      updatedData = offlineData.map(entity => 
        entity.id === data.id ? { ...entity, ...data } : entity
      );
      break;
      
    case 'delete':
      // Remove the entity from the offline data
      updatedData = offlineData.filter(entity => entity.id !== data.id);
      break;
  }
  
  // Save the updated offline data
  saveOfflineData(entityType, updatedData);
};
