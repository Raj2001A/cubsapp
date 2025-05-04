import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { EmployeeVisaStatus } from '../../types/employees';
import { useIsAdmin } from '../../context/AuthContext';
import { useEmployees } from '../../context/EmployeeContext';
import { useUI } from '../../context/UIContext';
import SmartSearchBar from '../ui/SmartSearchBar';
import api from '../../services/api';

const EmployeeList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [smartResults, setSmartResults] = useState<any[] | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | EmployeeVisaStatus | string>('all');
  const { employees, loadPage } = useEmployees();
  const { isLoading } = useUI();
  const isAdmin = useIsAdmin();

  // Fetch employees from the backend with throttling
  useEffect(() => {
    // Create a throttled function to load employees
    let isLoading = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const throttledLoadPage = () => {
      // If already loading, schedule another load after completion
      if (isLoading) {
        return;
      }

      // Set loading flag
      isLoading = true;

      // Load the first page of employees
      loadPage(1, 1000)
        .then(() => {
          // Reset loading flag after completion
          isLoading = false;
        })
        .catch(() => {
          // Reset loading flag on error
          isLoading = false;
        });
    };

    // Initial load with a small delay
    timeoutId = setTimeout(throttledLoadPage, 500);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Smart search: use API for fuzzy search, fallback to local filter
  useEffect(() => {
    let cancelled = false;
    const doSearch = async () => {
      if (!searchTerm.trim()) {
        setSmartResults(null);
        return;
      }
      try {
        const results = await api.employees.search(searchTerm);
        if (!cancelled) setSmartResults(results);
      } catch {
        setSmartResults(null);
      }
    };
    doSearch();
    return () => { cancelled = true; };
  }, [searchTerm]);

  const filteredEmployees = (smartResults || employees || []).filter(employee => {
    const matchesStatus =
      filterStatus === 'all' ||
      (typeof employee.visaStatus === 'string'
        ? employee.visaStatus === filterStatus
        : employee.visaStatus === filterStatus);
    return matchesStatus;
  });

  const getStatusBadgeClass = (status: EmployeeVisaStatus | string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Employees</h1>
        {isAdmin && (
          <Link
            to="/employees/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Employee
          </Link>
        )}
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <SmartSearchBar
                onSearch={setSearchTerm}
                placeholder="Smart search employees..."
              />
            </div>
            <div className="sm:w-48">
              <label htmlFor="status" className="sr-only">
                Filter by status
              </label>
              <select
                id="status"
                name="status"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | EmployeeVisaStatus | string)}
              >
                <option value="all">All Status</option>
                <option value={EmployeeVisaStatus.ACTIVE}>Active</option>
                <option value={EmployeeVisaStatus.EXPIRING}>Expiring Soon</option>
                <option value={EmployeeVisaStatus.EXPIRED}>Expired</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visa Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-800 font-medium">
                              {employee.name[0].toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(employee.visaStatus)}`}>
                        {typeof employee.visaStatus === 'string'
                          ? employee.visaStatus.charAt(0).toUpperCase() + employee.visaStatus.slice(1)
                          : employee.visaStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(employee.visaExpiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/employees/${employee.id}`}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeList;