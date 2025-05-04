import { fetchWithTimeout, safeHandleResponse } from '../api';
import { getAuthToken } from '../authService';
import { handleApiError, logError, AppError } from '../../utils/errorUtils';
import { Employee } from '../../types/employees';

/**
 * API service for employee operations
 */

/**
 * Get all employees
 * @returns List of employees
 */
const getAll = async (): Promise<{ data: Employee[] }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout('/api/employees', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await safeHandleResponse<Employee[]>(response);
    
    return { data };
  } catch (error) {
    logError(error, 'Failed to get employees');
    throw handleApiError(error);
  }
};

/**
 * Get employee by ID
 * @param id Employee ID
 * @returns Employee data
 */
const getById = async (id: string): Promise<{ data: Employee }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout(`/api/employees/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await safeHandleResponse<Employee>(response);
    
    return { data };
  } catch (error) {
    logError(error, `Failed to get employee with ID ${id}`);
    throw handleApiError(error);
  }
};

/**
 * Create a new employee
 * @param employee Employee data
 * @returns Created employee
 */
const create = async (employee: Partial<Employee>): Promise<Employee> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout('/api/employees', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    
    return await safeHandleResponse<Employee>(response);
  } catch (error) {
    logError(error, 'Failed to create employee');
    throw handleApiError(error);
  }
};

/**
 * Update an employee
 * @param id Employee ID
 * @param employee Employee data
 * @returns Updated employee
 */
const update = async (id: string, employee: Partial<Employee>): Promise<Employee> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    
    return await safeHandleResponse<Employee>(response);
  } catch (error) {
    logError(error, `Failed to update employee with ID ${id}`);
    throw handleApiError(error);
  }
};

/**
 * Remove an employee
 * @param id Employee ID
 * @returns Response data
 */
const remove = async (id: string): Promise<{ success: boolean }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout(`/api/employees/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    return await safeHandleResponse<{ success: boolean }>(response);
  } catch (error) {
    logError(error, `Failed to remove employee with ID ${id}`);
    throw handleApiError(error);
  }
};

/**
 * Get employees by company ID
 * @param companyId Company ID
 * @returns List of employees
 */
const getByCompanyId = async (companyId: string): Promise<{ data: Employee[] }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout(`/api/employees/company/${companyId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await safeHandleResponse<Employee[]>(response);
    
    return { data };
  } catch (error) {
    logError(error, `Failed to get employees for company ${companyId}`);
    throw handleApiError(error);
  }
};

/**
 * Get employees by trade
 * @param trade Trade
 * @returns List of employees
 */
const getByTrade = async (trade: string): Promise<{ data: Employee[] }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout(`/api/employees/trade/${encodeURIComponent(trade)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await safeHandleResponse<Employee[]>(response);
    
    return { data };
  } catch (error) {
    logError(error, `Failed to get employees with trade ${trade}`);
    throw handleApiError(error);
  }
};

/**
 * Get employees by nationality
 * @param nationality Nationality
 * @returns List of employees
 */
const getByNationality = async (nationality: string): Promise<{ data: Employee[] }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout(`/api/employees/nationality/${encodeURIComponent(nationality)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await safeHandleResponse<Employee[]>(response);
    
    return { data };
  } catch (error) {
    logError(error, `Failed to get employees with nationality ${nationality}`);
    throw handleApiError(error);
  }
};

/**
 * Search employees
 * @param query Search query
 * @returns List of employees
 */
const search = async (query: string): Promise<{ data: Employee[] }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout(`/api/employees/search?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await safeHandleResponse<Employee[]>(response);
    
    return { data };
  } catch (error) {
    logError(error, `Failed to search employees with query ${query}`);
    throw handleApiError(error);
  }
};

/**
 * Get employees with expiring visas
 * @param days Number of days to check for expiry
 * @returns List of employees with expiring visas
 */
const getExpiringVisas = async (days: number = 30): Promise<{ data: Employee[] }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout(`/api/employees/expiring-visas?days=${days}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await safeHandleResponse<Employee[]>(response);
    
    return { data };
  } catch (error) {
    logError(error, `Failed to get employees with expiring visas within ${days} days`);
    throw handleApiError(error);
  }
};

/**
 * Import employees from a file
 * @param formData FormData containing the file
 * @returns Imported employees
 */
const importEmployees = async (formData: FormData): Promise<{ data: Employee[] }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout('/api/employees/import', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    
    const data = await safeHandleResponse<Employee[]>(response);
    
    return { data };
  } catch (error) {
    logError(error, 'Failed to import employees');
    throw handleApiError(error);
  }
};

/**
 * Export employees to a file
 * @param format Export format (csv, excel, pdf)
 * @returns Exported data
 */
const exportEmployees = async (format: 'csv' | 'excel' | 'pdf' = 'csv'): Promise<Blob> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new AppError('Authentication required', { status: 401 });
    }
    
    const response = await fetchWithTimeout(`/api/employees/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': format === 'csv' ? 'text/csv' : format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf'
      }
    });
    
    return await safeHandleResponse<Blob>(response);
  } catch (error) {
    logError(error, 'Failed to export employees');
    throw handleApiError(error);
  }
};

export const employeeApi = {
  getAll,
  getById,
  create,
  update,
  remove,
  getByCompanyId,
  getByTrade,
  getByNationality,
  search,
  getExpiringVisas,
  importEmployees,
  exportEmployees
};

export default employeeApi;
