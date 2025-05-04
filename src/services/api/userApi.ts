import { getAuthToken } from '../authService';
import { handleApiError, logError, AppError } from '../../utils/errorUtils';
import { User } from '../../types/user';
import { fetchWithTimeout, safeHandleResponse } from '../api';

/**
 * API service for user management
 */
const userApi = {
  /**
   * Link a Firebase user to an employee record
   * @param uid Firebase user ID
   * @param employeeId Employee ID
   * @returns Response data
   */
  linkEmployeeToUser: async (uid: string, employeeId: string): Promise<{ success: boolean }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new AppError('Authentication required', { status: 401 });
      }
      
      const response = await fetchWithTimeout('/api/auth/link-employee', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid, employeeId })
      });
      
      return await safeHandleResponse(response);
    } catch (error) {
      logError(error, 'Failed to link employee to user');
      throw handleApiError(error);
    }
  },
  
  /**
   * Set a user's role
   * @param uid Firebase user ID
   * @param role User role
   * @returns Response data
   */
  setUserRole: async (uid: string, role: 'Administrator' | 'employee'): Promise<{ success: boolean }> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new AppError('Authentication required', { status: 401 });
      }
      
      const response = await fetchWithTimeout('/api/auth/set-role', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid, role })
      });
      
      return await safeHandleResponse(response);
    } catch (error) {
      logError(error, 'Failed to set user role');
      throw handleApiError(error);
    }
  },
  
  /**
   * Get all users (admin only)
   * @returns List of users
   */
  getAllUsers: async (): Promise<User[]> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new AppError('Authentication required', { status: 401 });
      }
      
      const response = await fetchWithTimeout('/api/auth/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await safeHandleResponse(response);
      return data.data.users;
    } catch (error) {
      logError(error, 'Failed to get users');
      throw handleApiError(error);
    }
  },
  
  /**
   * Get current user profile
   * @returns User profile
   */
  getCurrentUser: async (): Promise<User> => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new AppError('Authentication required', { status: 401 });
      }
      
      const response = await fetchWithTimeout('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await safeHandleResponse(response);
      return data.data.user;
    } catch (error) {
      logError(error, 'Failed to get current user');
      throw handleApiError(error);
    }
  }
};

export default userApi;
