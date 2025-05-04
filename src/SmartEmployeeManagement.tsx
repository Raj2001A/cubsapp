import React, { useState, useEffect } from 'react';
import SmartFilter, { FilterOptions } from './components/SmartFilter';
import DataExport, { ExportOptions } from './components/DataExport';
import { companies } from './data/companies';
import { useEmployees } from './context/EmployeeContext';
import LoadingSpinner from './components/ui/LoadingSpinner';

interface SmartEmployeeManagementProps {
  onBack: () => void;
  onViewEmployee: (id: string) => void;
}

const SmartEmployeeManagement: React.FC<SmartEmployeeManagementProps> = ({
  onBack,
  onViewEmployee
}) => {
  // Use the employee context instead of mock data
  const { employees, isLoading, searchEmployees, filterEmployeesByCompany } = useEmployees();
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [showExport, setShowExport] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);

  // Update filtered employees when employees change
  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  // Apply filters
  const handleFilter = async (filters: FilterOptions) => {
    const hasActiveFilters =
      filters.companyId ||
      filters.visaStatus ||
      filters.trade ||
      filters.nationality ||
      filters.expiryDateFrom ||
      filters.expiryDateTo ||
      filters.searchText;

    setIsFiltered(Boolean(hasActiveFilters));

    if (!hasActiveFilters) {
      setFilteredEmployees([...employees]);
      return;
    }

    try {
      let filteredResults = [...employees];

      // If we have a company filter, use the API
      if (filters.companyId) {
        const result = await filterEmployeesByCompany(filters.companyId);
        filteredResults = Array.isArray(result) ? result : result.employees;
      }

      // If we have a search text, use the API
      if (filters.searchText) {
        const result = await searchEmployees(filters.searchText);
        filteredResults = Array.isArray(result) ? result : result.employees;
      }

      // Apply additional client-side filters
      filteredResults = filteredResults.filter(employee => {
        // Visa status filter
        if (filters.visaStatus && employee.visaStatus !== filters.visaStatus) {
          return false;
        }

        // Trade filter
        if (filters.trade && (employee.trade?.toLowerCase() !== filters.trade.toLowerCase())) {
          return false;
        }

        // Nationality filter
        if (filters.nationality && employee.nationality.toLowerCase() !== filters.nationality.toLowerCase()) {
          return false;
        }

        // Expiry date range filter
        if (filters.expiryDateFrom && employee.visaExpiryDate &&
            new Date(employee.visaExpiryDate) < new Date(filters.expiryDateFrom)) {
          return false;
        }

        if (filters.expiryDateTo && employee.visaExpiryDate &&
            new Date(employee.visaExpiryDate) > new Date(filters.expiryDateTo)) {
          return false;
        }

        return true;
      });

      setFilteredEmployees(filteredResults);
    } catch (error) {
      console.error('Error applying filters:', error);

      // Fallback to client-side filtering
      const filtered = employees.filter(employee => {
        // Company filter
        if (filters.companyId && employee.companyId !== filters.companyId) {
          return false;
        }

        // Visa status filter
        if (filters.visaStatus && employee.visaStatus !== filters.visaStatus) {
          return false;
        }

        // Trade filter
        if (filters.trade && (employee.trade?.toLowerCase() !== filters.trade.toLowerCase())) {
          return false;
        }

        // Nationality filter
        if (filters.nationality && employee.nationality.toLowerCase() !== filters.nationality.toLowerCase()) {
          return false;
        }

        // Expiry date range filter
        if (filters.expiryDateFrom && employee.visaExpiryDate &&
            new Date(employee.visaExpiryDate) < new Date(filters.expiryDateFrom)) {
          return false;
        }

        if (filters.expiryDateTo && employee.visaExpiryDate &&
            new Date(employee.visaExpiryDate) > new Date(filters.expiryDateTo)) {
          return false;
        }

        // Search text filter (search across multiple fields)
        if (filters.searchText) {
          const searchLower = filters.searchText.toLowerCase();
          return (
            employee.name.toLowerCase().includes(searchLower) ||
            employee.employeeId.toLowerCase().includes(searchLower) ||
            employee.email.toLowerCase().includes(searchLower) ||
            employee.trade?.toLowerCase().includes(searchLower) ||
            employee.nationality.toLowerCase().includes(searchLower) ||
            employee.companyName.toLowerCase().includes(searchLower)
          );
        }

        return true;
      });

      setFilteredEmployees(filtered);
    }
  };

  // Handle export
  const handleExport = (options: ExportOptions) => {
    // Determine which employees to export
    const dataToExport = options.dataType === 'filtered_employees' && isFiltered
      ? filteredEmployees
      : options.dataType === 'visa_expiry'
        ? employees.filter(emp => emp.visaExpiryDate) // Only employees with visa expiry dates
        : employees;

    // Create CSV content
    const createCsvContent = () => {
      // Get headers from selected fields
      const headers = options.includeFields.join(',');

      // Create rows
      const rows = dataToExport.map(emp => {
        return options.includeFields.map(field => {
          const value = emp[field as keyof typeof emp];
          // Handle values with commas by wrapping in quotes
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        }).join(',');
      });

      // Combine headers and rows
      return [headers, ...rows].join('\n');
    };

    // Create and download file
    const csvContent = createCsvContent();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Generate filename
    const date = new Date().toISOString().split('T')[0];
    const fileType = options.dataType === 'visa_expiry' ? 'visa_expiry' : 'employees';
    a.download = `${fileType}_export_${date}.${options.format}`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    alert(`Successfully exported ${dataToExport.length} employees to ${options.format.toUpperCase()}`);
  };

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return { backgroundColor: '#e8f5e9', color: '#388e3c' };
      case 'expiring':
        return { backgroundColor: '#fff8e1', color: '#ffa000' };
      case 'expired':
        return { backgroundColor: '#ffebee', color: '#d32f2f' };
      default:
        return { backgroundColor: '#e0e0e0', color: '#616161' };
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginRight: '10px',
            padding: '5px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 style={{ margin: 0, color: '#333' }}>Employee Management</h1>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowExport(!showExport)}
            style={{
              backgroundColor: showExport ? '#e3f2fd' : '#f5f5f5',
              color: showExport ? '#1976d2' : '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: showExport ? '500' : 'normal'
            }}
          >
            {showExport ? 'Hide Export Options' : 'Export Data'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#666', fontSize: '0.875rem' }}>
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Smart Filter */}
      <SmartFilter onFilter={async (filters) => await handleFilter(filters)} />

      {/* Export Section */}
      {showExport && (
        <DataExport
          onExport={handleExport}
          employeeCount={employees.length}
          isFiltered={isFiltered}
        />
      )}

      {/* Employee Results */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.25rem', color: '#333', marginTop: 0, marginBottom: '16px' }}>
          Employee Results
        </h2>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <LoadingSpinner size="medium" message="Loading employees..." />
          </div>
        ) : filteredEmployees.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Trade</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Nationality</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Company</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Visa Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(employee => (
                  <tr key={employee.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px' }}>{employee.employeeId}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>{employee.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{employee.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{employee.trade}</td>
                    <td style={{ padding: '12px 16px' }}>{employee.nationality}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {companies.find(c => c.id === employee.companyId)?.name.split(',')[0] || employee.companyName.split(',')[0]}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        ...getStatusBadgeStyle(employee.visaStatus)
                      }}>
                        {employee.visaStatus === 'active' ? 'Active' :
                         employee.visaStatus === 'expiring' ? 'Expiring Soon' :
                         employee.visaStatus === 'expired' ? 'Expired' : employee.visaStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => onViewEmployee(employee.id)}
                        style={{
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            color: '#6b7280'
          }}>
            <p style={{ margin: 0, fontSize: '1rem' }}>
              {employees.length === 0 ? 'No employees available. Please add employees first.' : 'No employees found matching your search criteria.'}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>
              {employees.length > 0 ? 'Try adjusting your filters or clear them to see all employees.' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartEmployeeManagement;
