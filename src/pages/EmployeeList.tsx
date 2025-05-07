import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee } from '../types/employees';
import { Trash2, Eye, Search, Loader2, UserPlus, RefreshCw, Filter, X } from 'lucide-react';
import { apiService } from '../services/apiService';
import { useToast } from '@/components/ui/use-toast';

interface EmployeeListProps {
  onViewEmployee?: (employeeId: string) => void;
  companyFilter?: string;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ 
  onViewEmployee,
  companyFilter
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const tableRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const [tableActualWidth, setTableActualWidth] = useState<string>('100%');
  
  // Local state for direct API interaction
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Add filter states
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedTrade, setSelectedTrade] = useState<string>('');
  const [selectedNationality, setSelectedNationality] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Get unique values for filters
  const uniqueCompanies = useMemo(() => 
    Array.from(new Set(employees.map(emp => emp.company))).filter(Boolean).sort(),
    [employees]
  );

  const uniqueTrades = useMemo(() => 
    Array.from(new Set(employees.map(emp => emp.trade))).filter(Boolean).sort(),
    [employees]
  );

  const uniqueNationalities = useMemo(() => 
    Array.from(new Set(employees.map(emp => emp.nationality))).filter(Boolean).sort(),
    [employees]
  );

  // Add this at the beginning of the component, before other useEffects
  // Load permanent records on component mount
  useEffect(() => {
    // First try to get data from the permanent records
    try {
      const permanentRecordsJson = localStorage.getItem('permanentEmployeeRecords');
      if (permanentRecordsJson) {
        const permanentRecords = JSON.parse(permanentRecordsJson);
        console.log('Found permanent employee records:', permanentRecords);
        
        // Check if we have any permanent records
        if (permanentRecords && Object.keys(permanentRecords).length > 0) {
          // We'll collect all permanent employee data
          const permanentEmployeeData: Employee[] = [];
          
          // Loop through each permanent record ID
          Object.keys(permanentRecords).forEach(empId => {
            // Try to load the full employee record
            try {
              const fullRecordJson = localStorage.getItem(`permanent_employee_${empId}`);
              if (fullRecordJson) {
                const fullRecord = JSON.parse(fullRecordJson);
                if (fullRecord && fullRecord.isPermanent) {
                  permanentEmployeeData.push(fullRecord);
                }
              }
            } catch (e) {
              console.error(`Error loading permanent record for employee ${empId}:`, e);
            }
          });
          
          // If we found any permanent records, merge them with current data
          if (permanentEmployeeData.length > 0) {
            console.log(`Found ${permanentEmployeeData.length} permanent employee records`);
            
            // If we already have employees loaded, merge them
            if (employees.length > 0) {
              const updatedEmployees = [...employees];
              
              // Update each permanent record in our existing list
              permanentEmployeeData.forEach(permRecord => {
                const index = updatedEmployees.findIndex(emp => 
                  emp.id === permRecord.id || emp.employeeId === permRecord.id);
                
                if (index >= 0) {
                  updatedEmployees[index] = {
                    ...updatedEmployees[index],
                    ...permRecord
                  };
                } else {
                  // This is a new record, add it
                  updatedEmployees.push(permRecord);
                }
              });
              
              setEmployees(updatedEmployees);
              setFilteredEmployees(updatedEmployees);
            } else {
              // No existing data, just use the permanent records
              setEmployees(permanentEmployeeData);
              setFilteredEmployees(permanentEmployeeData);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error loading permanent employee records:', e);
    }
  }, []);

  // Modify the fetchEmployees function to include proper error handling and avoid multiple API calls
  const fetchEmployees = useCallback(async () => {
    // Prevent excessive retries
    if (retryCount >= maxRetries) {
      setError('Maximum retry attempts reached. Please try again later.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    // FIRST: Try to load from localStorage as a fast initial response
    try {
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees) {
        const parsedEmployees = JSON.parse(storedEmployees);
        console.log('Using initial employees from localStorage:', parsedEmployees.length);
        setEmployees(parsedEmployees);
        setFilteredEmployees(parsedEmployees);
        
        // Still keep loading true as we're fetching fresh data
      }
    } catch (localError) {
      console.error('Error loading initial employees from localStorage:', localError);
    }
    
    // SECOND: Load permanent records
    try {
      const permanentEmployeeData: Employee[] = [];
      
      // Get all keys from localStorage that start with 'permanent_employee_'
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('permanent_employee_')) {
          try {
            const permanentRecord = JSON.parse(localStorage.getItem(key) || '{}');
            if (permanentRecord && permanentRecord.isPermanent) {
              permanentEmployeeData.push(permanentRecord);
            }
          } catch (e) {
            console.error(`Error parsing permanent employee record ${key}:`, e);
          }
        }
      }
      
      if (permanentEmployeeData.length > 0) {
        console.log(`Found ${permanentEmployeeData.length} permanent employee records to apply`);
        
        // Update current employees with permanent records
        setEmployees(prevEmployees => {
          const updatedEmployees = [...prevEmployees];
          
          // Update each permanent record in our existing list
          permanentEmployeeData.forEach(permRecord => {
            const index = updatedEmployees.findIndex(emp => 
              emp.id === permRecord.id || emp.employeeId === permRecord.id);
            
            if (index >= 0) {
              updatedEmployees[index] = {
                ...updatedEmployees[index],
                ...permRecord
              };
            } else {
              // This is a new record, add it
              updatedEmployees.push(permRecord);
            }
          });
          
          // Also update filtered employees
          setFilteredEmployees(updatedEmployees);
          
          return updatedEmployees;
        });
      }
    } catch (e) {
      console.error('Error applying permanent employee records:', e);
    }
    
    // THIRD: Try the API with timeout
    try {
      console.log('Fetching employees from API...');
      
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out')), 5000);
      });
      
      // Race the API request against the timeout
      const response = await Promise.race([
        apiService.get('/employees'),
        timeoutPromise
      ]) as any;
      
      console.log('API Response:', response);
      
      if (!response || !response.data) {
        throw new Error('No data received from server');
      }

      // Handle both array and object response formats
      const employeeData = Array.isArray(response.data) ? response.data : 
        (response.data.data || response.data.employees || []);

      if (!Array.isArray(employeeData)) {
        throw new Error('Invalid response format: expected array of employees');
      }

      const mappedEmployees = employeeData.map((emp: any) => ({
        id: emp.employee_id || emp.id,
        employeeId: emp.employee_id || emp.id,
        name: emp.name || '',
        trade: emp.trade || '',
        nationality: emp.nationality || '',
        phone: emp.mobile_number || emp.phone || '',
        email: emp.email_id || emp.email || '',
        company: emp.company_name || emp.company || '',
        position: emp.position || emp.trade || '',
        joinDate: emp.join_date || emp.joinDate || '',
        lastUpdated: new Date().toISOString()
      }));

      console.log('Mapped employees:', mappedEmployees);

      // Save to localStorage for future use
      localStorage.setItem('employees', JSON.stringify(mappedEmployees));
      localStorage.setItem('employeesLastUpdated', new Date().toISOString());
      
      // Merge with permanent records
      const permanentRecordsJson = localStorage.getItem('permanentEmployeeRecords');
      if (permanentRecordsJson) {
        try {
          const permanentRecords = JSON.parse(permanentRecordsJson);
          const permanentIds = Object.keys(permanentRecords);
          
          if (permanentIds.length > 0) {
            // First find any employees in our new data that are marked as permanent
            const updatedMappedEmployees = mappedEmployees.map(emp => {
              const empId = emp.id || emp.employeeId;
              if (permanentIds.includes(empId)) {
                // This is a permanent record, load the full data
                const fullRecordJson = localStorage.getItem(`permanent_employee_${empId}`);
                if (fullRecordJson) {
                  const fullRecord = JSON.parse(fullRecordJson);
                  if (fullRecord && fullRecord.isPermanent) {
                    // Merge but keep the newer timestamp
                    return {
                      ...fullRecord,
                      lastUpdated: emp.lastUpdated || fullRecord.lastUpdated
                    };
                  }
                }
              }
              return emp;
            });
            
            setEmployees(updatedMappedEmployees);
            setFilteredEmployees(updatedMappedEmployees);
          } else {
            setEmployees(mappedEmployees);
            setFilteredEmployees(mappedEmployees);
          }
        } catch (e) {
          console.error('Error processing permanent records during API fetch:', e);
          setEmployees(mappedEmployees);
          setFilteredEmployees(mappedEmployees);
        }
      } else {
        setEmployees(mappedEmployees);
        setFilteredEmployees(mappedEmployees);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees:', error);

      // Only show error if we don't have cached data
      if (employees.length === 0) {
        setError(error instanceof Error ? error.message : 'Failed to load employees');
        
        // Try to load mock data if available
        const mockData = localStorage.getItem('mockEmployees');
        if (mockData) {
          try {
            const parsedMock = JSON.parse(mockData);
            setEmployees(parsedMock);
            setFilteredEmployees(parsedMock);
          } catch (e) {
            console.error('Error parsing mock data:', e);
          }
        }
        
        // Increment retry count for next attempt
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
        }
      }
      
      setLoading(false);
    }
  }, [retryCount, maxRetries]);

  // Add this effect to handle efficient polling with a reasonable interval
  useEffect(() => {
    // Clear any existing polling
    let pollingInterval: number | undefined;
    let mounted = true;

    // Set up polling with page and limit variables
    const setupPolling = (page: number, limit: number) => {
      console.log(`Setting up polling with page: ${page} limit: ${limit}`);
      
      // Function to check for updates
      const checkForUpdates = async () => {
        if (!mounted) return;
        
        try {
          // Check if we need to refresh based on last update time
          const lastUpdate = localStorage.getItem('employeesLastUpdated');
          const now = new Date().toISOString();
          
          // Only refresh if it's been more than 5 minutes since last update
          if (!lastUpdate || new Date(now).getTime() - new Date(lastUpdate).getTime() > 5 * 60 * 1000) {
            console.log('Refreshing employee data from API...');
            setRefreshTrigger(prev => prev + 1);
          }
        } catch (e) {
          console.error('Error during polling:', e);
        }
      };
      
      // Initial check
      checkForUpdates();
      
      // Set up interval for polling - every 2 minutes is reasonable
      pollingInterval = window.setInterval(checkForUpdates, 2 * 60 * 1000);
    };
    
    // Start polling with current page/limit
    setupPolling(currentPage, itemsPerPage);
    
    // Clean up
    return () => {
      mounted = false;
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [currentPage, itemsPerPage]);

  // Add a single dependency to refresh data
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees, refreshTrigger]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmployeeIds(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedEmployeeIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedEmployeeIds.length} selected employees?`)) return;
    
    setBulkDeleteLoading(true);
    try {
      let successCount = 0;
      let failCount = 0;
      
      for (const id of selectedEmployeeIds) {
        try {
          const response = await apiService.delete(`/employees/${id}`);
          if (response.status === 200) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }
      
      // Refresh employee list after bulk delete
      setRefreshTrigger(prev => prev + 1);
      setSelectedEmployeeIds([]);
      
      if (failCount === 0) {
        toast({
          title: 'Success',
          description: `${successCount} employees deleted successfully`,
          variant: 'default'
        });
      } else {
        toast({
          title: 'Warning',
          description: `Deleted ${successCount} employees, failed to delete ${failCount}`,
          variant: 'destructive'
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete employees',
        variant: 'destructive'
      });
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Update filter effect
  useEffect(() => {
    let filtered = [...employees];

    // Apply company filter
    if (selectedCompany) {
      filtered = filtered.filter(emp => emp.company === selectedCompany);
    }

    // Apply trade filter
    if (selectedTrade) {
      filtered = filtered.filter(emp => emp.trade === selectedTrade);
    }

    // Apply nationality filter
    if (selectedNationality) {
      filtered = filtered.filter(emp => emp.nationality === selectedNationality);
    }

    // Apply search query
    if (searchQuery) {
          const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp => 
        emp.name?.toLowerCase().includes(query) ||
        emp.employeeId?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query) ||
        emp.phone?.toLowerCase().includes(query)
      );
    }

          setFilteredEmployees(filtered);
  }, [employees, selectedCompany, selectedTrade, selectedNationality, searchQuery]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSelectedCompany('');
    setSelectedTrade('');
    setSelectedNationality('');
    setSearchQuery('');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // The search effect will run automatically when searchQuery changes
    setTimeout(() => setIsSearching(false), 500);
  };

  // Delete employee functionality
  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!window.confirm(`Are you sure you want to delete employee '${name}'?`)) return;
    
    setLoading(true);
    try {
      const response = await apiService.delete(`/employees/${id}`);
      if (response.status === 200) {
        // Remove the deleted employee from local state
        setEmployees(prev => prev.filter(emp => emp.id !== id));
        setFilteredEmployees(prev => prev.filter(emp => emp.id !== id));
        toast({
          title: 'Success',
          description: 'Employee deleted successfully',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete employee',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'Error deleting employee',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (employee: Employee) => {
    // Store the selected employee in localStorage for direct access
    localStorage.setItem('selectedEmployee', JSON.stringify(employee));
    navigate(`/employee/${employee.id}`);
  };

  const handleEditEmployee = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/employee-edit/${id}`);
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return dateString;
    }
  };

  // Handle scroll synchronization
  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleTopScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (tableRef.current) {
      tableRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchEmployees();
  }, [fetchEmployees]);

  // Effect to update tableActualWidth for the top scrollbar
  useEffect(() => {
    if (tableRef.current && tableRef.current.firstElementChild) {
      // Use the scrollWidth of the direct child of tableRef (which should be the div wrapping the table)
      const currentTableContentWidth = tableRef.current.firstElementChild.scrollWidth;
      setTableActualWidth(`${currentTableContentWidth}px`);
    }
  }, [filteredEmployees, loading]); // Re-calculate when employees/loading changes

  // Add this useEffect after your other useEffect hooks to calculate table width
  useEffect(() => {
    // Calculate table width after the component is mounted and when data changes
    if (tableRef.current) {
      const calculateTableWidth = () => {
        // Get the actual width of the table element
        const width = tableRef.current?.scrollWidth;
        if (width) {
          // Set the table actual width for the top scrollbar to match
          setTableActualWidth(`${width}px`);
        }
      };
      
      // Run once immediately
      calculateTableWidth();
      
      // Also run after a short delay to account for any layout shifts
      const timeoutId = setTimeout(calculateTableWidth, 100);
      
      // Clean up timeout on unmount
      return () => clearTimeout(timeoutId);
    }
  }, [employees, filteredEmployees, showFilters]);

  // Add an event listener for employee updates
  useEffect(() => {
    const handleEmployeeUpdate = (event: CustomEvent) => {
      console.log('Employee updated event received:', event.detail);
      
      // Update local employee list
      if (event.detail && event.detail.id && event.detail.data) {
        const { id, data } = event.detail;
        
        // First, check if this employee is in our current list
        const employeeIndex = employees.findIndex(emp => 
          emp.id === id || emp.employeeId === id
        );
        
        if (employeeIndex >= 0) {
          // Update the employee in place
          setEmployees(prev => {
            const updated = [...prev];
            updated[employeeIndex] = {
              ...updated[employeeIndex],
              ...data
            };
            return updated;
          });
          
          // Also update filtered employees
          setFilteredEmployees(prev => {
            const filteredIndex = prev.findIndex(emp => 
              emp.id === id || emp.employeeId === id
            );
            
            if (filteredIndex >= 0) {
              const updated = [...prev];
              updated[filteredIndex] = {
                ...updated[filteredIndex],
                ...data
              };
              return updated;
            }
            return prev;
          });
        } else {
          // The employee might not be in our current list, refresh to be safe
          setRefreshTrigger(prev => prev + 1);
        }
      }
    };
    
    // Add event listener
    window.addEventListener('employee-updated', handleEmployeeUpdate as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('employee-updated', handleEmployeeUpdate as EventListener);
    };
  }, [employees]);

  // Check for lastEmployeeUpdate timestamp in localStorage
  useEffect(() => {
    const checkForUpdates = () => {
      try {
        const lastUpdate = localStorage.getItem('lastEmployeeUpdate');
        if (lastUpdate) {
          const timestamp = localStorage.getItem('_lastEmployeeListUpdate');
          
          // If we don't have a timestamp or our timestamp is older than the last update
          if (!timestamp || new Date(lastUpdate) > new Date(timestamp)) {
            console.log('Detected employee updates in localStorage, refreshing...');
            setRefreshTrigger(prev => prev + 1);
            localStorage.setItem('_lastEmployeeListUpdate', new Date().toISOString());
          }
        }
      } catch (e) {
        console.error('Error checking for updates:', e);
      }
    };
    
    // Check immediately on mount
    checkForUpdates();
    
    // Set up interval to periodically check
    const intervalId = setInterval(checkForUpdates, 10000); // Every 10 seconds
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Refresh on mount
  useEffect(() => {
    // Update timestamp when list is manually refreshed
    localStorage.setItem('_lastEmployeeListUpdate', new Date().toISOString());
  }, [refreshTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading employees...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Error Loading Employees</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          {retryCount < maxRetries && (
            <button
              onClick={handleRetry}
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <Loader2 className="w-5 h-5 mr-2" />
              Retry ({maxRetries - retryCount} attempts left)
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex flex-col gap-4">
            {/* Search and Actions Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <form onSubmit={handleSearch} className="flex w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                  className="input mr-2 flex-grow min-w-[200px]"
              aria-label="Search employees"
            />
            <button
              type="submit"
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center"
              disabled={isSearching}
              aria-label="Search"
            >
              {isSearching ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
          </form>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
                <button 
                  className="btn bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded flex items-center justify-center" 
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Toggle Filters"
                >
                  <Filter className="h-5 w-5 mr-1" />
                  <span className="hidden sm:inline">Filters</span>
                </button>

            <button 
              className="btn bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center justify-center" 
              onClick={() => navigate('/employee-add')}
              aria-label="Add Employee"
            >
              <UserPlus className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Add Employee</span>
            </button>
            
            <button 
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded flex items-center justify-center" 
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              disabled={loading}
              aria-label="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            {selectedEmployeeIds.length > 0 && (
              <button 
                className="btn bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded flex items-center justify-center" 
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoading}
                aria-label="Delete Selected"
              >
                {bulkDeleteLoading ? 
                  <Loader2 className="animate-spin h-5 w-5 mr-1" /> : 
                  <Trash2 className="h-5 w-5 mr-1" />
                }
                <span className="hidden sm:inline">Delete Selected ({selectedEmployeeIds.length})</span>
              </button>
            )}
          </div>
        </div>
        
            {/* Filters Row */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">All Companies</option>
                    {uniqueCompanies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trade</label>
                  <select
                    value={selectedTrade}
                    onChange={(e) => setSelectedTrade(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">All Trades</option>
                    {uniqueTrades.map(trade => (
                      <option key={trade} value={trade}>{trade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                  <select
                    value={selectedNationality}
                    onChange={(e) => setSelectedNationality(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">All Nationalities</option>
                    {uniqueNationalities.map(nationality => (
                      <option key={nationality} value={nationality}>{nationality}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center justify-center"
                  >
                    <X className="h-5 w-5 mr-2" />
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table Section */}
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow mb-6">
          {/* Top scrollbar that syncs with table */}
          <div className="overflow-x-auto border-b border-gray-200">
            <div 
              ref={topScrollRef}
              onScroll={handleTopScroll} 
              className="pb-2 pt-2 px-4 max-w-full"
              style={{ overflowX: 'auto' }}
            >
              <div style={{ width: tableActualWidth, height: '1px' }}></div>
            </div>
          </div>
          
          {/* Table container with ref */}
          <div 
            ref={tableRef}
            onScroll={handleTableScroll}
            className="overflow-x-auto max-h-[70vh] overflow-y-auto px-4"
          >
            <table className="w-full text-left text-gray-700" style={{ display: 'inline-block', minWidth: '100%' }}>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[50px]">
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={handleSelectAll}
                      aria-label="Select all employees"
                      tabIndex={0}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[100px]">Emp. ID</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[150px]">Name</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[120px]">Trade</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[120px]">Nationality</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[120px]">Date of Birth</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[120px]">Mobile No.</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[150px]">Email ID</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[150px]">Company</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewDetails(employee)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap w-[50px]">
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(employee.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectOne(employee.id);
                        }}
                        aria-label={`Select ${employee.name}`}
                        tabIndex={0}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap w-[100px]">{employee.employeeId || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900 w-[150px]">{employee.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap w-[120px]">{employee.trade || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap w-[120px]">{employee.nationality}</td>
                    <td className="px-4 py-3 whitespace-nowrap w-[120px]">{formatDate(employee.dateOfBirth)}</td>
                    <td className="px-4 py-3 whitespace-nowrap w-[120px]">{employee.phone || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap w-[150px]">{employee.email || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap w-[150px]">{employee.company || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right w-[120px]">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(employee);
                        }} 
                        className="text-blue-600 hover:text-blue-900 mr-4" 
                        title="View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.setItem('selectedEmployee', JSON.stringify(employee));
                          navigate(`/employee-edit/${employee.id}`);
                        }} 
                        className="text-yellow-600 hover:text-yellow-900 mr-4 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500" 
                        title="Edit" 
                        aria-label={`Edit ${employee.name}`} 
                        tabIndex={0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414L13 17H9v-4z" />
                        </svg>
                      </button>
                      <button 
                        onClick={(e) => handleDelete(employee.id, employee.name || 'employee', e)}
                        className="text-red-600 hover:text-red-900 focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                        title="Delete" 
                        aria-label={`Delete ${employee.name}`}
                        tabIndex={0}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
