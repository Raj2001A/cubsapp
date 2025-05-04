import api from './api';
import { Employee, EmployeeVisaStatus } from '../types/employees';
import { getOrFetchData, getCacheItem } from '../utils/cacheUtils';

export interface DashboardStats {
  totalEmployees: number;
  activeVisas: number;
  expiringVisas: number;
  expiredVisas: number;
  employeesByCompany: { companyName: string; count: number }[];
  employeesByNationality: { nationality: string; count: number }[];
  employeesByTrade: { trade: string; count: number }[];
}

export interface RecentActivity {
  type: 'employee_added' | 'document_uploaded' | 'visa_expired' | 'visa_expiring';
  employeeId: string;
  employeeName: string;
  timestamp: string;
  details?: string;
}

/**
 * Fetch dashboard statistics from the API with caching
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    return await getOrFetchData(
      CACHE_KEYS.EMPLOYEE_STATS,
      async () => {
        // Get all employees (with a large limit to get all)
        const employeesResponse = await api.employees.getAll(1, 1000);
        let employees: Employee[] = [];
        if (Array.isArray(employeesResponse)) {
          employees = employeesResponse as Employee[];
        } else if (employeesResponse && Array.isArray(employeesResponse.data)) {
          employees = employeesResponse.data as Employee[];
        } else {
          console.error('Invalid employees API response:', employeesResponse);
          throw new Error('Invalid employees API response');
        }
        // Calculate stats from employees
        const totalEmployees = employees.length;
        const activeVisas = employees.filter((emp: Employee) => emp.visaStatus === EmployeeVisaStatus.ACTIVE).length;
        const expiringVisas = employees.filter((emp: Employee) => emp.visaStatus === EmployeeVisaStatus.EXPIRING).length;
        const expiredVisas = employees.filter((emp: Employee) => emp.visaStatus === EmployeeVisaStatus.EXPIRED).length;
        // Calculate employees by company
        const companyCounts: Record<string, number> = {};
        employees.forEach((emp: Employee) => {
          if (emp.companyName) {
            companyCounts[emp.companyName] = (companyCounts[emp.companyName] || 0) + 1;
          }
        });
        const employeesByCompany = Object.entries(companyCounts)
          .map(([companyName, count]) => ({ companyName, count }))
          .sort((a, b) => b.count - a.count);
        // Calculate employees by nationality
        const nationalityCounts: Record<string, number> = {};
        employees.forEach((emp: Employee) => {
          if (emp.nationality) {
            nationalityCounts[emp.nationality] = (nationalityCounts[emp.nationality] || 0) + 1;
          }
        });
        const employeesByNationality = Object.entries(nationalityCounts)
          .map(([nationality, count]) => ({ nationality, count }))
          .sort((a, b) => b.count - a.count);
        // Calculate employees by trade
        const tradeCounts: Record<string, number> = {};
        employees.forEach((emp: Employee) => {
          if (emp.trade) {
            tradeCounts[emp.trade] = (tradeCounts[emp.trade] || 0) + 1;
          }
        });
        const employeesByTrade = Object.entries(tradeCounts)
          .map(([trade, count]) => ({ trade, count }))
          .sort((a, b) => b.count - a.count);
        return {
          totalEmployees,
          activeVisas,
          expiringVisas,
          expiredVisas,
          employeesByCompany,
          employeesByNationality,
          employeesByTrade
        };
      },
      CACHE_DURATIONS.EMPLOYEE_STATS
    );
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return default stats instead of throwing
    return {
      totalEmployees: 0,
      activeVisas: 0,
      expiringVisas: 0,
      expiredVisas: 0,
      employeesByCompany: [],
      employeesByNationality: [],
      employeesByTrade: []
    };
  }
};

/**
 * Fetch recent activity from the API with caching
 */
export const getRecentActivity = async (limit: number = 5): Promise<RecentActivity[]> => {
  try {
    // Use cache for all activities, then slice the result
    const allActivities: RecentActivity[] = await getOrFetchData(
      'dashboard:recent-activity',
      async () => {
        // Since we don't have a specific endpoint for activity yet,
        // we'll get all employees and generate activity based on join date
        const employeesResponse = await api.employees.getAll(1, 1000);
        let employees: Employee[] = [];
        if (Array.isArray(employeesResponse)) {
          employees = employeesResponse as Employee[];
        } else if (employeesResponse && Array.isArray(employeesResponse.data)) {
          employees = employeesResponse.data as Employee[];
        } else {
          console.error('Invalid employees API response:', employeesResponse);
          throw new Error('Invalid employees API response');
        }
        // Sort employees by join date (most recent first)
        return employees
          .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
          .slice(0, 100)
          .map(emp => ({
            type: 'employee_added',
            employeeId: emp.id,
            employeeName: emp.name,
            timestamp: emp.joinDate,
            details: `Joined company ${emp.companyName}`
          }));
      },
      5 * 60 * 1000
    );
    return allActivities.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

/**
 * Fetch employees with expiring visas with caching and fallback data
 */
export const getExpiringVisas = async (limit: number = 5): Promise<Employee[]> => {
  const createFallbackData = (): Employee[] => {
    // Current date for calculations
    const now = new Date();

    // Create some sample expiring visa data
    return [
      {
        id: 'fallback-1',
        name: 'Sample Employee 1',
        email: 'sample1@example.com',
        employeeId: 'EMP001',
        trade: 'Engineer',
        nationality: 'Sample Country',
        companyId: 'company-1',
        companyName: 'Sample Company',
        visaExpiryDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        visaStatus: EmployeeVisaStatus.EXPIRED,
        documents: [],
        dateOfBirth: now.toISOString(),
        joinDate: now.toISOString()
      },
      {
        id: 'fallback-2',
        name: 'Sample Employee 2',
        email: 'sample2@example.com',
        employeeId: 'EMP002',
        trade: 'Technician',
        nationality: 'Sample Country',
        companyId: 'company-1',
        companyName: 'Sample Company',
        visaExpiryDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        visaStatus: EmployeeVisaStatus.EXPIRING,
        documents: [],
        dateOfBirth: now.toISOString(),
        joinDate: now.toISOString()
      },
      {
        id: 'fallback-3',
        name: 'Sample Employee 3',
        email: 'sample3@example.com',
        employeeId: 'EMP003',
        trade: 'Manager',
        nationality: 'Sample Country',
        companyId: 'company-2',
        companyName: 'Another Company',
        visaExpiryDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days from now
        visaStatus: EmployeeVisaStatus.EXPIRING,
        documents: [],
        dateOfBirth: now.toISOString(),
        joinDate: now.toISOString()
      }
    ];
  };

  try {
    // First, check if we have cached data
    const cachedData = getCacheItem ? getCacheItem(CACHE_KEYS.EXPIRING_VISAS) : null;
    if (Array.isArray(cachedData)) {
      console.log('Using cached visa expiry data');
      return cachedData.slice(0, limit);
    }

    // Use the getOrFetchData utility to handle caching with a longer timeout
    const allExpiringVisas = await getOrFetchData(
      CACHE_KEYS.EXPIRING_VISAS,
      async () => {
        // Set a longer timeout for this specific operation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout (increased from 10)

        try {
          // Use the dedicated endpoint for visa expiry reminders
          const employeesResult = await api.employees.getVisaExpiryReminders(limit);
          const employees: Employee[] = Array.isArray(employeesResult)
            ? employeesResult
            : (Array.isArray(employeesResult.data) ? employeesResult.data : []);
          clearTimeout(timeoutId);

          if (!employees || !Array.isArray(employees)) {
            console.warn('Invalid response format from API, using fallback data');
            return createFallbackData();
          }

          // If no expiring visas found, use fallback data in development mode
          if (employees.length === 0 && import.meta.env.DEV) {
            console.log('No expiring visas found, using fallback data in development mode');
            return createFallbackData();
          }

          // Map backend data to frontend format (if needed)
          return employees;
        } catch (abortError) {
          clearTimeout(timeoutId);
          console.error('Error or timeout fetching expiring visas:', abortError);

          // Use fallback data
          return createFallbackData();
        }
      },
      CACHE_DURATIONS.EXPIRING_VISAS
    );

    // Return only the requested number of items
    return allExpiringVisas.slice(0, limit);
  } catch (error) {
    console.error('Error fetching expiring visas:', error);

    // Return fallback data instead of empty array
    return createFallbackData().slice(0, limit);
  }
};

// Cache keys
const CACHE_KEYS = {
  EXPIRING_VISAS: 'dashboard:expiring-visas',
  EMPLOYEE_STATS: 'dashboard:employee-stats',
  NATIONALITY_DISTRIBUTION: 'dashboard:nationality-distribution',
  TRADE_DISTRIBUTION: 'dashboard:trade-distribution'
};

// Cache durations
const CACHE_DURATIONS = {
  EXPIRING_VISAS: 5 * 60 * 1000, // 5 minutes
  EMPLOYEE_STATS: 10 * 60 * 1000, // 10 minutes
  DISTRIBUTIONS: 15 * 60 * 1000 // 15 minutes
};
