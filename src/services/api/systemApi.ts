import { getAuthToken } from '../authService';
import { handleApiError, logError, AppError } from '../../utils/errorUtils';
import { fetchWithTimeout, safeHandleResponse } from '../api';

/**
 * API service for system operations
 */
const systemApi = {
  /**
   * Create a system backup
   * @returns Backup data
   */
  createBackup: async (): Promise<{ backupUrl: string }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new AppError('Authentication required', { status: 401 });
      }
      
      const response = await fetchWithTimeout('/api/system/backup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return await safeHandleResponse(response);
    } catch (error) {
      logError(error, 'Failed to create backup');
      throw handleApiError(error);
    }
  },
  
  /**
   * Restore a system backup
   * @param formData FormData containing the backup file
   * @returns Response data
   */
  restoreBackup: async (formData: FormData): Promise<{ success: boolean }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new AppError('Authentication required', { status: 401 });
      }
      
      const response = await fetchWithTimeout('/api/system/restore', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return await safeHandleResponse(response);
    } catch (error) {
      logError(error, 'Failed to restore backup');
      throw handleApiError(error);
    }
  },
  
  /**
   * Get system health status
   * @returns System health status
   */
  getHealthStatus: async (): Promise<{ status: string; details?: any }> => {
    try {
      const response = await fetchWithTimeout('/api/system/health', {
        method: 'GET'
      });
      
      return await safeHandleResponse(response);
    } catch (error) {
      logError(error, 'Failed to get system health');
      throw handleApiError(error);
    }
  },
  
  /**
   * Clear system cache
   * @returns Response data
   */
  clearCache: async (): Promise<{ success: boolean }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new AppError('Authentication required', { status: 401 });
      }
      
      const response = await fetchWithTimeout('/api/system/clear-cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return await safeHandleResponse(response);
    } catch (error) {
      logError(error, 'Failed to clear cache');
      throw handleApiError(error);
    }
  }
};

export default systemApi;
