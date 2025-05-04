import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AddEmployeeModal from './components/AddEmployeeModal';
import { companies } from './data/companies';
import EmployeeImportExport from './components/EmployeeImportExport';
import EmployeeImportSection from './components/EmployeeImportSection';
import { useEmployees } from './context/EmployeeContext';
import { Employee } from './types/employees';
import { useUI } from './context/UIContext';
import { OperationType } from './types/ui';
import ResponsiveTable from './components/ui/ResponsiveTable';
import ResponsiveFilters from './components/ui/ResponsiveFilters';
import ResponsiveHeader from './components/ui/ResponsiveHeader';
import Pagination from './components/ui/Pagination';
import { Database, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import ConfirmationModal from './components/ui/ConfirmationModal';

interface EmployeeListProps {}

const EmployeeList: React.FC<EmployeeListProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; employeeId: string; employeeName: string }>({
    isOpen: false,
    employeeId: '',
    employeeName: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Use the employee context instead of local state
  const {
    employees,
    pagination,
    addEmployee,
    deleteEmployee,
    filterEmployeesByCompany,
    searchEmployees,
    importEmployees,
    isLoading,
    setPage,
    setLimit,
    loadPage
  } = useEmployees();

  // Use the UI context for loading states
  const { setLoading } = useUI();

  // Get filtered employees using context functions with pagination
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);

  // Use a ref to track the latest employees without causing re-renders
  const latestEmployeesRef = useRef<Employee[]>(employees);

  // Update the ref when employees change
  useEffect(() => {
    console.log('Employees updated:', employees.length, 'employees');
    latestEmployeesRef.current = employees;

    // Only update filtered employees if we're not actively filtering or searching
    if (employees.length > 0 && !companyFilter && !searchTerm) {
      setFilteredEmployees(employees);
    }
  }, [employees, companyFilter, searchTerm]);

  // Track the last request with a ref to avoid duplicate requests
  const lastRequestRef = useRef<{
    page: number;
    limit: number;
    companyFilter: string;
    searchTerm: string;
    timestamp: number;
  } | null>(null);

  // Track if a request is in progress
  const requestInProgressRef = useRef(false);

  // Track if we have loaded data at least once
  const initialLoadDoneRef = useRef(false);

  // Effect to load employees with pagination, filtering, and search
  useEffect(() => {
    // Skip if we're already loading or a request is in progress
    if (isLoading || requestInProgressRef.current) {
      console.log('Skipping fetch because we are already loading or a request is in progress');
      return;
    }

    // If we already have employees and nothing has changed, don't fetch again
    if (initialLoadDoneRef.current &&
        filteredEmployees.length > 0 &&
        !companyFilter &&
        !searchTerm &&
        pagination.page === 1) {
      console.log('Skipping fetch because we already have employees and nothing has changed');
      return;
    }

    // Check if this is a duplicate request within a short time window
    const now = Date.now();
    const lastRequest = lastRequestRef.current;
    if (lastRequest &&
        lastRequest.page === pagination.page &&
        lastRequest.limit === pagination.limit &&
        lastRequest.companyFilter === companyFilter &&
        lastRequest.searchTerm === searchTerm &&
        now - lastRequest.timestamp < 3000) { // 3000ms duplicate prevention window
      console.log('Skipping duplicate request within 3000ms');
      return;
    }

    // Update the last request ref
    lastRequestRef.current = {
      page: pagination.page,
      limit: pagination.limit,
      companyFilter,
      searchTerm,
      timestamp: now
    };

    // Create a flag to track if the component is still mounted
    let isMounted = true;

    // Create an AbortController to cancel the fetch if needed
    const abortController = new AbortController();

    console.log('Fetching employees with filters:', {
      page: pagination.page,
      limit: pagination.limit,
      companyFilter,
      searchTerm
    });

    // Create a unique request ID for this fetch operation
    const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    console.log(`Starting fetch operation ${requestId}`);

    const fetchEmployees = async () => {
      // Skip if component unmounted
      if (!isMounted) {
        console.log(`Fetch operation ${requestId} aborted: component unmounted`);
        return;
      }

      // Mark request as in progress
      requestInProgressRef.current = true;

      try {
        // Only show loading indicator if the request takes longer than 800ms
        const loadingTimerId = setTimeout(() => {
          if (isMounted) {
            setLoading(OperationType.FETCH_EMPLOYEES, true);
          }
        }, 800);

        let result;

        // First check if we have data in memory cache
        const cacheKey = companyFilter
          ? `employees_company_${companyFilter}_${pagination.page}_${pagination.limit}`
          : searchTerm
            ? `employees_search_${searchTerm}_${pagination.page}_${pagination.limit}`
            : `employees_page_${pagination.page}_${pagination.limit}`;

        // Try to get from localStorage cache first
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            const cacheTimestamp = parsedData.timestamp || 0;

            // Use cache if it's less than 10 minutes old
            if (now - cacheTimestamp < 10 * 60 * 1000) {
              console.log(`Using cached data for ${requestId} from key ${cacheKey}`);
              if (isMounted) {
                setFilteredEmployees(parsedData.employees);
                initialLoadDoneRef.current = true;

                // Clear the loading timer
                clearTimeout(loadingTimerId);
                console.log(`Fetch operation ${requestId} completed from cache`);
                return;
              }
            }
          } catch (cacheError) {
            console.error(`Error parsing cached data for ${requestId}:`, cacheError);
          }
        }

        // If we have a company filter, use that
        if (companyFilter) {
          console.log(`Fetching by company for ${requestId}: ${companyFilter}`);
          result = await filterEmployeesByCompany(companyFilter, pagination.page, pagination.limit);
          // Only update if component is still mounted
          if (isMounted && result && result.employees) {
            // Update filtered employees
            setFilteredEmployees(result.employees);
            initialLoadDoneRef.current = true;

            // Cache the data for future use
            try {
              localStorage.setItem(cacheKey, JSON.stringify({
                employees: result.employees,
                timestamp: Date.now()
              }));
            } catch (cacheError) {
              console.error(`Error caching employee data for ${requestId}:`, cacheError);
            }
          }
        }
        // If we have a search term, use that
        else if (searchTerm) {
          console.log(`Searching for ${requestId}: ${searchTerm}`);
          result = await searchEmployees(searchTerm, pagination.page, pagination.limit);
          // Only update if component is still mounted
          if (isMounted && result && result.employees) {
            // Update filtered employees
            setFilteredEmployees(result.employees);
            initialLoadDoneRef.current = true;

            // Cache the data for future use
            try {
              localStorage.setItem(cacheKey, JSON.stringify({
                employees: result.employees,
                timestamp: Date.now()
              }));
            } catch (cacheError) {
              console.error(`Error caching employee data for ${requestId}:`, cacheError);
            }
          }
        }
        // Otherwise, just load the current page
        else {
          console.log(`Loading page for ${requestId}: ${pagination.page}`);
          await loadPage(pagination.page, pagination.limit);
          // Only update if component is still mounted
          if (isMounted) {
            // Set filtered employees to the current employees from the ref
            // This avoids the circular dependency with employees
            const currentEmployees = latestEmployeesRef.current;
            if (currentEmployees.length > 0) {
              setFilteredEmployees(currentEmployees);
              initialLoadDoneRef.current = true;

              // Cache the data for future use
              try {
                localStorage.setItem(cacheKey, JSON.stringify({
                  employees: currentEmployees,
                  timestamp: Date.now()
                }));
              } catch (cacheError) {
                console.error(`Error caching employee data for ${requestId}:`, cacheError);
              }
            }
          }
        }

        // Clear the loading timer
        clearTimeout(loadingTimerId);
        console.log(`Fetch operation ${requestId} completed successfully`);
      } catch (error) {
        console.error(`Error in fetch operation ${requestId}:`, error);
        // Only update if component is still mounted
        if (isMounted) {
          // Set filtered employees to the current employees on error
          const currentEmployees = latestEmployeesRef.current;
          if (currentEmployees.length > 0) {
            setFilteredEmployees(currentEmployees);
            initialLoadDoneRef.current = true;
          }
        }
      } finally {
        // Only update if component is still mounted
        if (isMounted) {
          setLoading(OperationType.FETCH_EMPLOYEES, false);
          // Mark request as complete
          requestInProgressRef.current = false;
        }
      }
    };

    // Use a debounce to prevent too many requests
    const timeoutId = setTimeout(() => {
      fetchEmployees();
    }, 2000); // Increased debounce time to 2 seconds

    // Clean up the timeout, abort any in-flight requests, and set mounted flag to false
    return () => {
      console.log(`Cleaning up fetch operation ${requestId}`);
      clearTimeout(timeoutId);
      abortController.abort();
      isMounted = false;
    };
  }, [pagination.page, pagination.limit, companyFilter, searchTerm, isLoading, setLoading, filterEmployeesByCompany, searchEmployees, loadPage]);

  // Get status badge color - memoized to prevent unnecessary recalculations
  const getStatusBadgeStyle = useCallback((status: string | undefined) => {
    if (!status) {
      return { backgroundColor: '#f5f5f5', color: '#757575' };
    }

    switch (status) {
      case 'active':
        return { backgroundColor: '#e8f5e9', color: '#388e3c' };
      case 'expiring':
        return { backgroundColor: '#fff8e1', color: '#ffa000' };
      case 'expired':
        return { backgroundColor: '#ffebee', color: '#d32f2f' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#757575' };
    }
  }, []);

  // Define header actions
  const headerActions = [
    {
      label: showImportExport ? 'Hide Import/Export' : 'Database Import/Export',
      onClick: () => {
        setShowImportExport(!showImportExport);
        if (!showImportExport) setShowExcelImport(false);
      },
      primary: false,
      icon: <Database className="h-4 w-4" />
    },
    {
      label: showExcelImport ? 'Hide Excel Import' : 'Import from Excel',
      onClick: () => {
        setShowExcelImport(!showExcelImport);
        if (!showExcelImport) setShowImportExport(false);
      },
      primary: false,
      icon: <FileSpreadsheet className="h-4 w-4" />
    },
    {
      label: 'Add Employee',
      onClick: () => setIsAddModalOpen(true),
      primary: true,
      disabled: isLoading
    }
  ];

  // Define filter options
  const filterOptions = [
    {
      id: 'search',
      label: 'Search',
      type: 'search' as const
    },
    {
      id: 'company',
      label: 'Company',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Companies' },
        ...companies.map(company => ({
          value: company.id,
          label: company.name
        }))
      ]
    }
  ];

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: string) => {
    // Reset to page 1 when filters change
    setPage(1);

    if (filterId === 'search') {
      setSearchTerm(value);
    } else if (filterId === 'company') {
      setCompanyFilter(value);
    }
  };

  return (
    <div className="p-4">
      {/* Responsive Header */}
      <ResponsiveHeader
        title="Employees"
        actions={headerActions}
      />

      {/* Import/Export Section */}
      {showImportExport && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Database Import/Export</h3>
            <button
              onClick={() => setShowImportExport(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <EmployeeImportExport
            onImport={(importedEmployees) => {
              importEmployees(importedEmployees)
                .then(() => {
                  setShowImportExport(false);
                })
                .catch(err => {
                  console.error('Error importing employees:', err);
                });
            }}
            onExport={() => {
              console.log('Exporting all employees:', employees);
            }}
            employeeCount={employees.length}
          />
        </div>
      )}

      {/* Excel Import Section */}
      {showExcelImport && (
        <EmployeeImportSection
          onImportComplete={async (importedEmployees) => {
            try {
              await importEmployees(importedEmployees);
              // Keep the import section open to show results
            } catch (err) {
              console.error('Error importing employees from Excel:', err);
            }
          }}
          onClose={() => setShowExcelImport(false)}
        />
      )}

      {/* Responsive Filters */}
      <ResponsiveFilters
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        filterValues={{
          search: searchTerm,
          company: companyFilter
        }}
      />

      {/* Responsive Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ResponsiveTable
          data={filteredEmployees}
          keyExtractor={(employee) => employee.id?.toString() || employee.employeeId?.toString() || `emp-${employee.email}`}
          columns={[
            {
              id: 'employeeId',
              header: 'ID',
              accessor: (employee: Employee) => <span>{employee.employeeId}</span>,
              minWidth: '80px'
            },
            {
              id: 'name',
              header: 'Name',
              accessor: (employee: Employee) => (
                <div>
                  <div className="font-medium text-gray-900">{employee.name}</div>
                  <div className="text-sm text-gray-500">{employee.email}</div>
                </div>
              ),
              minWidth: '200px'
            },
            {
              id: 'trade',
              header: 'Trade',
              accessor: (employee: Employee) => <span>{employee.trade}</span>,
              minWidth: '120px',
              hideOnMobile: false
            },
            {
              id: 'nationality',
              header: 'Nationality',
              accessor: (employee: Employee) => <span>{employee.nationality}</span>,
              minWidth: '120px',
              hideOnMobile: true
            },
            {
              id: 'company',
              header: 'Company',
              accessor: (employee: Employee) => (
                <span className="truncate max-w-xs block">{employee.companyName}</span>
              ),
              minWidth: '200px',
              hideOnMobile: true
            },
            {
              id: 'joinDate',
              header: 'Join Date',
              accessor: (employee: Employee) => (
                <span>{new Date(employee.joinDate).toLocaleDateString()}</span>
              ),
              minWidth: '120px',
              hideOnMobile: true
            },
            {
              id: 'visaStatus',
              header: 'Visa Status',
              accessor: (employee: Employee) => (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: '500',
                    ...getStatusBadgeStyle(employee.visaStatus)
                  }}
                >
                  {employee.visaStatus ? employee.visaStatus.charAt(0).toUpperCase() + employee.visaStatus.slice(1) : 'Unknown'}
                </span>
              ),
              minWidth: '120px',
              hideOnMobile: false
            },
            {
              id: 'actions',
              header: 'Actions',
              accessor: (employee: Employee) => (
                <div className="flex flex-wrap gap-2 md:flex-nowrap items-center justify-center md:justify-start">
                  <Link
                    to={`/employees/${employee.id}`}
                    className="bg-primary-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary-700 transition-colors inline-flex items-center justify-center gap-1 min-w-[80px]"
                    aria-label={`View details for ${employee.name}`}
                  >
                    <span className="hidden sm:inline">View</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open delete confirmation modal
                      setDeleteConfirmation({
                        isOpen: true,
                        employeeId: employee.id,
                        employeeName: employee.name
                      });
                    }}
                    className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1 min-w-[80px]"
                    aria-label={`Delete ${employee.name}`}
                  >
                    <span className="hidden sm:inline">Delete</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              ),
              minWidth: '100px',
              hideOnMobile: false
            }
          ]}
          emptyMessage={companyFilter ?
            `No employees found in ${companies.find(c => c.id === companyFilter)?.name || 'selected company'}${searchTerm ? ` matching "${searchTerm}"` : ''}.` :
            'No employees found matching your search.'}
          isLoading={isLoading}
        />

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="mb-4 sm:mb-0 text-sm text-gray-700">
              Showing {employees.length > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employees
            </div>

            <div className="flex items-center">
              <select
                className="mr-4 p-2 border border-gray-300 rounded-md text-sm"
                value={pagination.limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                aria-label="Items per page"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>

              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
                showPageNumbers={true}
                showFirstLast={true}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddEmployee={(data) => {
            // Define inline handler to avoid reference error
            setLoading(OperationType.ADD_EMPLOYEE, true);
            addEmployee(data)
              .then(() => {
                setIsAddModalOpen(false);
                // Toast notifications are handled by the context
                // Refresh is handled by the context
              })
              .catch(error => {
                console.error('Failed to add employee:', error);
              })
              .finally(() => {
                setLoading(OperationType.ADD_EMPLOYEE, false);
              });
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && (
        <ConfirmationModal
          isOpen={deleteConfirmation.isOpen}
          onClose={() => setDeleteConfirmation({ isOpen: false, employeeId: '', employeeName: '' })}
          onConfirm={() => {
            // Define inline delete handler
            setIsDeleting(true);
            deleteEmployee(deleteConfirmation.employeeId)
              .then(() => {
                setDeleteConfirmation({ isOpen: false, employeeId: '', employeeName: '' });
                // Refresh list after deletion is handled by the context
              })
              .catch(error => {
                console.error('Failed to delete employee:', error);
              })
              .finally(() => {
                setIsDeleting(false);
              });
          }}
          title="Delete Employee"
          message={`Are you sure you want to delete ${deleteConfirmation.employeeName}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};

export default EmployeeList;
