import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Employee } from '../types/employees';
import { apiService } from '../services/apiService';
import { getEmployeeByIdByApi } from '../services/employeeService';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Edit, Trash2, FileText } from 'lucide-react';
import { b2Service } from '../services/b2Service';

// Fallback employee data when API fails
const createFallbackEmployee = (id: string): Employee => ({
  id,
  employeeId: id,
  name: "Employee Data Unavailable",
  trade: "Unknown",
  nationality: "Unknown",
  dateOfBirth: null,
  phone: null,
  homePhoneNumber: null,
  email: null,
  company: "Unknown",
  companyId: "0",
  companyName: "Unknown",
  position: "Unknown",
  joinDate: new Date().toISOString(),
  visaStatus: "UNKNOWN"
});

// Replace atob usage with a browser-safe alternative that also handles errors gracefully
const safeAtob = (base64Data: string): string => {
  try {
    return window.atob(base64Data);
  } catch (e) {
    // Fallback implementation if atob fails or isn't available
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;
    
    // Remove non-base64 chars
    const input = base64Data.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    
    while (i < input.length) {
      const enc1 = chars.indexOf(input.charAt(i++));
      const enc2 = chars.indexOf(input.charAt(i++));
      const enc3 = chars.indexOf(input.charAt(i++));
      const enc4 = chars.indexOf(input.charAt(i++));
      
      const chr1 = (enc1 << 2) | (enc2 >> 4);
      const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      const chr3 = ((enc3 & 3) << 6) | enc4;
      
      output = output + String.fromCharCode(chr1);
      
      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    
    return output;
  }
};

export const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [useFallback, setUseFallback] = useState(false);

  const fetchEmployeeDetails = useCallback(async () => {
    if (!id) {
      setError('Employee ID is required');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First check localStorage cache
      try {
        const cachedEmployee = localStorage.getItem(`employee_${id}`);
        if (cachedEmployee) {
          console.log('Using cached employee data from localStorage');
          const parsed = JSON.parse(cachedEmployee);
          setEmployee(parsed);
          setUseFallback(false);
          // Don't return here - still try to get fresh data, but at least UI can show something
        }
      } catch (cacheError) {
        console.warn('Error reading from localStorage cache:', cacheError);
      }

      // Try to get from B2 
      let b2Success = false;
      try {
        const fileName = `employees/${id}.json`;
        const employeeData = await b2Service.downloadFile(fileName);
        
        if (employeeData) {
          try {
            // Parse the base64 data
            const decodedData = safeAtob(employeeData);
            const parsed = JSON.parse(decodedData);
            
            if (parsed && parsed.id) {
              console.log('Retrieved employee data from B2');
              setEmployee(parsed);
              setUseFallback(false);
              
              // Cache in localStorage for future use
              localStorage.setItem(`employee_${id}`, JSON.stringify(parsed));
              
              b2Success = true;
              // Continue to try API to get most up-to-date data
            }
          } catch (parseError) {
            console.warn('Error parsing B2 employee data:', parseError);
          }
        }
      } catch (b2Error) {
        console.warn('Failed to retrieve employee data from B2:', b2Error);
      }

      // Fallback to API
      try {
        const response = await apiService.get(`/employees/${id}`);
        if (response && response.data) {
          const mappedEmployee = {
            id: response.data.employee_id || response.data.id || id,
            employeeId: response.data.employee_id || response.data.employeeId || id,
            name: response.data.name || '',
            trade: response.data.trade || '',
            nationality: response.data.nationality || '',
            dateOfBirth: response.data.date_of_birth || response.data.dateOfBirth || '',
            phone: response.data.mobile_number || response.data.phone || '',
            homePhoneNumber: response.data.home_phone_number || response.data.homePhoneNumber || '',
            email: response.data.email_id || response.data.email || '',
            company: response.data.company_name || response.data.company || '',
            companyId: response.data.company_id?.toString() || response.data.companyId?.toString() || '',
            companyName: response.data.company_name || response.data.companyName || '',
            position: response.data.trade || response.data.position || '',
            joinDate: response.data.join_date || response.data.joinDate || '',
            visaStatus: response.data.visa_status || response.data.visaStatus || 'UNKNOWN',
            visaExpiryDate: response.data.visa_expiry_date || response.data.visaExpiryDate || '',
            lastUpdated: new Date().toISOString(),
            apiSynced: true
          };

          // Cache in localStorage and update UI
          localStorage.setItem(`employee_${id}`, JSON.stringify(mappedEmployee));
          setEmployee(mappedEmployee);
          setUseFallback(false);

          // Try to save to B2 for future use (but don't wait for it)
          try {
            const fileName = `employees/${id}.json`;
            b2Service.uploadFile(fileName, JSON.stringify(mappedEmployee))
              .catch(saveError => console.warn('Could not save employee data to B2:', saveError));
          } catch (saveError) {
            console.warn('Error trying to save employee data to B2:', saveError);
          }
        } else {
          throw new Error('No data received from server');
        }
      } catch (apiError) {
        console.error('API Error fetching employee details:', apiError);
        
        // If we already have data from B2 or localStorage, don't show error
        if (!employee && !b2Success) {
          // If we have an ID, create a fallback
          if (id && (retryCount >= maxRetries || useFallback)) {
            console.log('Using fallback employee data');
            setEmployee(createFallbackEmployee(id));
            setUseFallback(true);
          } else {
            // Otherwise show error
            throw apiError;
          }
        }
      }
    } catch (error) {
      console.error('Error in employee details flow:', error);
      
      // Try one final fallback - createFallbackEmployee
      if (id && retryCount >= maxRetries) {
        console.log('Using fallback employee data after all methods failed');
        setEmployee(createFallbackEmployee(id));
        setUseFallback(true);
      } else {
        setError(error instanceof Error ? error.message : 'Failed to load employee details');
        
        // Increment retry count for next attempt
        if (retryCount < maxRetries) {
          setRetryCount(prev => prev + 1);
        } else {
          setUseFallback(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [id, retryCount, maxRetries, useFallback]);

  // Fix for infinite renders - only fetch on mount or when id/retryCount changes
  useEffect(() => {
    if (id) {
      fetchEmployeeDetails();
    }
  }, [id, retryCount, fetchEmployeeDetails]);
  
  // Add check for updates from localStorage - fix interval to prevent memory leaks
  useEffect(() => {
    if (!id) return;
    
    // Function to check for updated employee data
    const checkForUpdates = () => {
      try {
        // Check for direct employee updates
        const specificKey = `employee_${id}`;
        const updatedEmployee = localStorage.getItem(specificKey);
        
        if (updatedEmployee && employee) {
          try {
            const parsedUpdated = JSON.parse(updatedEmployee);
            const lastUpdateTime = parsedUpdated.lastUpdated;
            const currentDataTimestamp = (employee as any).lastUpdated;
            
            // Only update if the cached version is newer
            if (lastUpdateTime && (!currentDataTimestamp || new Date(lastUpdateTime) > new Date(currentDataTimestamp))) {
              console.log('Found updated employee data in localStorage');
              setEmployee(parsedUpdated);
            }
          } catch (e) {
            console.error('Error parsing updated employee:', e);
          }
        }
        
        // Also check the generic lastEmployeeUpdate flag
        const lastUpdate = localStorage.getItem('lastEmployeeUpdate');
        if (lastUpdate && employee) {
          const currentDataTimestamp = (employee as any).lastUpdated;
          
          // If our current data is older than the last update, refresh
          if (!currentDataTimestamp || new Date(lastUpdate) > new Date(currentDataTimestamp)) {
            console.log('Global employee update detected, refreshing...');
            // Instead of calling fetchEmployeeDetails directly, trigger through retryCount
            setRetryCount(prev => prev + 1);
          }
        }
      } catch (e) {
        console.error('Error checking for employee updates:', e);
      }
    };
    
    // Check immediately
    checkForUpdates();
    
    // And set up an interval to periodically check
    const intervalId = setInterval(checkForUpdates, 10000); // Check every 10 seconds instead of 5
    
    return () => clearInterval(intervalId);
  // Dependency only on id and employee to avoid unnecessary interval resets
  }, [id, employee]);
  
  // Listen for employee-updated events
  useEffect(() => {
    if (!id) return;
    
    const handleEmployeeUpdate = (event: CustomEvent) => {
      if (event.detail && event.detail.id === id) {
        console.log('Employee update event received:', event.detail);
        setEmployee(event.detail);
      }
    };
    
    // Add event listener
    window.addEventListener('employee-updated', handleEmployeeUpdate as EventListener);
    
    // Clean up
    return () => {
      window.removeEventListener('employee-updated', handleEmployeeUpdate as EventListener);
    };
  }, [id]);

  // Avoid infinite render by preventing the useCallback from recreating on every render
  const memoizedHandleRetry = useCallback(() => {
    setRetryCount(0);
  }, []);

  const handleDelete = async () => {
    if (!employee || !window.confirm(`Are you sure you want to delete ${employee.name}?`)) return;

    try {
      // Delete from B2
      const fileName = `employees/${employee.id}.json`;
      await b2Service.deleteFile(fileName, employee.id);

      // Try to delete from API
      try {
        await apiService.delete(`/employees/${employee.id}`);
      } catch (apiError) {
        console.warn('API delete failed, but removed from B2:', apiError);
      }

      toast({
        title: 'Success',
        description: 'Employee deleted successfully',
        variant: 'default'
      });
      navigate('/employees');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete employee',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = () => {
    if (!employee?.id) {
      toast({
        title: "Error",
        description: "Cannot edit: Employee ID is missing",
        variant: "destructive"
      });
      return;
    }

    navigate(`/employee-edit/${employee.id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Loading employee details...</span>
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Employee Not Found</h1>
          <p className="text-gray-600 mb-4">{error || "The employee you're looking for doesn't exist or has been removed."}</p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/employees')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Employees
            </button>
            {retryCount < maxRetries && (
          <button 
                onClick={memoizedHandleRetry}
                className="btn bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center"
          >
                <Loader2 className="w-5 h-5 mr-2" />
                Retry ({maxRetries - retryCount} attempts left)
          </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
      <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => navigate('/employees')}
              className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Employees
            </button>
            <div className="flex gap-2">
              {!useFallback && (
                <>
          <button
            onClick={handleEdit}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
          >
                    <Edit className="w-5 h-5 mr-2" />
            Edit
          </button>
          <button
            onClick={() => navigate(`/employee-documents/${employee.id}`)}
            className="btn bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center"
          >
            <FileText className="w-5 h-5 mr-2" />
            Documents
          </button>
          <button
                    onClick={handleDelete}
                    className="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete
                  </button>
                </>
              )}
              {useFallback && (
                <button
                  onClick={memoizedHandleRetry}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center"
                >
                  <Loader2 className="w-5 h-5 mr-2" />
                  Retry loading
          </button>
              )}
        </div>
      </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">{employee?.name}</h1>
          <p className="text-gray-600">Employee ID: {employee?.employeeId}</p>
          {useFallback && (
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-md">
              <p className="text-yellow-800 text-sm">
                ⚠️ Using placeholder data. The server is currently unavailable.
              </p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-4">
            <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-gray-900">{employee?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <p className="mt-1 text-gray-900">
                    {employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : '-'}
              </p>
            </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nationality</label>
                  <p className="mt-1 text-gray-900">{employee?.nationality}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Visa Status</label>
                  <p className="mt-1 text-gray-900">{employee?.visaStatus}</p>
          </div>
        </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{employee?.email || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <p className="mt-1 text-gray-900">{employee?.phone || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Home Phone</label>
                  <p className="mt-1 text-gray-900">{employee?.homePhoneNumber || '-'}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <p className="mt-1 text-gray-900">{employee?.company}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <p className="mt-1 text-gray-900">{employee?.position}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Trade</label>
                  <p className="mt-1 text-gray-900">{employee?.trade || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Join Date</label>
                  <p className="mt-1 text-gray-900">
                    {employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
