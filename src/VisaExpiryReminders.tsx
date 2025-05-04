import React, { useState, useEffect } from 'react';
import { getExpiringVisas } from './services/dashboardService';
import { useUI } from './context/UIContext';
import { OperationType, ErrorSeverity } from './types/ui';
import LoadingSpinner from './components/ui/LoadingSpinner';

interface Employee {
  id: string;
  name: string;
  email: string;
  department?: string;
  position?: string;
  visaExpiryDate: string;
  daysRemaining: number;
}

interface VisaExpiryRemindersProps {
  onViewEmployee: (id: string) => void;
  limit?: number;
}

const VisaExpiryReminders: React.FC<VisaExpiryRemindersProps> = ({
  onViewEmployee,
  limit = 5
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get UI context for loading and error handling
  const { setLoading, addError } = useUI();

  useEffect(() => {
    // Track if the component is mounted
    let isMounted = true;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const fetchExpiringVisas = async (retry = 0) => {
      try {
        if (isMounted) {
          setIsLoading(true);
          setError(null);
          setLoading(OperationType.FETCH_DASHBOARD_DATA, true);
        }

        // Fetch employees with expiring visas with a timeout
        const expiringVisasData = await getExpiringVisas(limit);

        // Only update state if component is still mounted
        if (!isMounted) return;

        // If we got an empty array, show a message but don't treat as error
        // This should be rare now with our fallback data
        if (expiringVisasData.length === 0) {
          setEmployees([]);
          return;
        }

        // Transform the data and calculate days remaining
        const employeesWithExpiryInfo = expiringVisasData.map(emp => {
          // Make sure visaExpiryDate is not null or undefined
          if (!emp.visaExpiryDate) {
            return {
              ...emp,
              daysRemaining: 0
            };
          }

          try {
            const expiryDate = new Date(emp.visaExpiryDate);
            const today = new Date();
            const diffTime = expiryDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return {
              ...emp,
              daysRemaining: diffDays
            };
          } catch (dateError) {
            console.warn('Invalid date format for visa expiry:', emp.visaExpiryDate);
            return {
              ...emp,
              daysRemaining: 0
            };
          }
        });

        if (isMounted) {
          setEmployees(employeesWithExpiryInfo);
          // Clear any previous errors since we succeeded
          setError(null);
        }
      } catch (err) {
        console.error(`Error fetching expiring visas (attempt ${retry + 1}/${maxRetries}):`, err);

        if (isMounted) {
          // If we haven't exceeded max retries, try again
          if (retry < maxRetries - 1) {
            console.log(`Retrying in ${retryDelay}ms...`);
            setTimeout(() => fetchExpiringVisas(retry + 1), retryDelay);
            return;
          }

          setError('Failed to load visa expiry data');

          // Check if it's a timeout error
          const errorMessage = err instanceof Error ? err.message : String(err);
          if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
            addError(
              'Failed to load visa expiry reminders',
              ErrorSeverity.WARNING,
              OperationType.FETCH_DASHBOARD_DATA,
              'Request timeout. Using fallback data.'
            );
          } else {
            addError(
              'Failed to load visa expiry reminders',
              ErrorSeverity.CRITICAL,
              OperationType.FETCH_DASHBOARD_DATA,
              'Using fallback data. ' + errorMessage
            );
          }

          // No fallback data - show error message
          setError('Unable to fetch visa expiry data. Please check your connection and try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setLoading(OperationType.FETCH_DASHBOARD_DATA, false);
        }
      }
    };

    fetchExpiringVisas();

    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [limit]);

  // Sort employees by days remaining (expired first, then soonest to expire)
  const sortedEmployees = [...employees].sort((a, b) => {
    // Expired visas first
    if (a.daysRemaining < 0 && b.daysRemaining >= 0) return -1;
    if (a.daysRemaining >= 0 && b.daysRemaining < 0) return 1;

    // Then sort by days remaining
    return a.daysRemaining - b.daysRemaining;
  });

  // Limit the number of employees shown
  const limitedEmployees = sortedEmployees.slice(0, limit);

  // Loading state
  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <LoadingSpinner size="small" message="Loading visa expiry data..." />
      </div>
    );
  }

  // Function to retry loading data with improved error handling
  const handleRetry = () => {
    // Reset state
    setIsLoading(true);
    setError(null);
    setLoading(OperationType.FETCH_DASHBOARD_DATA, true);

    // Fetch data again with retry logic
    const retryWithBackoff = (attempt = 0, maxAttempts = 2, delay = 1500) => {
      getExpiringVisas(limit)
        .then(expiringVisasData => {
          // Transform the data and calculate days remaining
          const employeesWithExpiryInfo = expiringVisasData.map(emp => {
            if (!emp.visaExpiryDate) {
              return { ...emp, daysRemaining: 0 };
            }

            return {
              ...emp,
              daysRemaining: Math.ceil((new Date(emp.visaExpiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            };
          });

          setEmployees(employeesWithExpiryInfo);
          setError(null);
          setLoading(OperationType.FETCH_DASHBOARD_DATA, false);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(`Error retrying expiring visas fetch (attempt ${attempt + 1}/${maxAttempts}):`, err);

          // If we have attempts left, retry with backoff
          if (attempt < maxAttempts) {
            setTimeout(() => retryWithBackoff(attempt + 1, maxAttempts, delay * 1.5), delay);
            return;
          }

          // Final attempt failed, show error
          setError('Unable to fetch visa expiry data. Please check your connection and try again.');
          setLoading(OperationType.FETCH_DASHBOARD_DATA, false);
          setIsLoading(false);
        });
    };

    // Start the retry process
    retryWithBackoff();
  };

  // Error state - now shows a more user-friendly message
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {/* Show different message based on error content */}
        {error.includes('sample data') ? (
          <div style={{ backgroundColor: '#fff8e1', padding: '12px', borderRadius: '4px', marginBottom: '15px' }}>
            <p style={{ color: '#f59e0b', marginBottom: '5px', fontWeight: '500' }}>
              <span style={{ marginRight: '8px' }}>⚠️</span>
              {error}
            </p>
            <p style={{ color: '#78716c', fontSize: '0.875rem' }}>
              The data below is sample data. Real data will be shown when connection is restored.
            </p>
          </div>
        ) : (
          <p style={{ color: '#ef4444', marginBottom: '10px' }}>{error}</p>
        )}

        <button
          onClick={handleRetry}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
          </svg>
          Try Again
        </button>
      </div>
    );
  }

  // Get status badge style based on days remaining
  const getStatusBadgeStyle = (daysRemaining: number) => {
    if (daysRemaining < 0) return { backgroundColor: '#ffebee', color: '#d32f2f' };
    if (daysRemaining <= 30) return { backgroundColor: '#fff8e1', color: '#ffa000' };
    return { backgroundColor: '#e8f5e9', color: '#388e3c' };
  };

  // If there are no employees with expiring visas, show a message
  if (employees.length === 0 && !isLoading && !error) {
    return (
      <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>
        No visa expiry reminders. All visas are active.
      </p>
    );
  }

  return (
    <div>
      {limitedEmployees.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {limitedEmployees.map((employee) => (
            <li
              key={employee.id}
              style={{
                padding: '12px 0',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#e0f2f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontSize: '16px',
                    color: '#00796b',
                    fontWeight: 'bold'
                  }}>
                    {employee.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{employee.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{employee.position}</div>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6b7280' }}>
                  Visa expires on {new Date(employee.visaExpiryDate).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  marginBottom: '8px',
                  ...getStatusBadgeStyle(employee.daysRemaining)
                }}>
                  {employee.daysRemaining < 0
                    ? `Expired ${Math.abs(employee.daysRemaining)} days ago`
                    : `${employee.daysRemaining} days remaining`}
                </span>
                <button
                  onClick={() => onViewEmployee(employee.id)}
                  style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: '0.75rem'
                  }}
                >
                  View Employee
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>
          No visa expiry reminders.
        </p>
      )}
    </div>
  );
};

export default VisaExpiryReminders;
