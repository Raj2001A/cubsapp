import React, { useState } from 'react';
import AdvancedSearch, { FilterCriteria, SavedSearch } from './components/AdvancedSearch';
import CustomFilters from './components/CustomFilters';
import DataImportExport from './components/DataImportExport';
import { mockEmployees } from './data/mockEmployees';
import { companies } from './data/companies';

interface AdvancedEmployeeManagementProps {
  onBack: () => void;
  onViewEmployee: (id: string) => void;
}

const AdvancedEmployeeManagement: React.FC<AdvancedEmployeeManagementProps> = ({
  onBack,
  onViewEmployee
}) => {
  const [employees, setEmployees] = useState([...mockEmployees]);
  const [filteredEmployees, setFilteredEmployees] = useState([...mockEmployees]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);

  // Apply search criteria
  const handleSearch = (criteria: FilterCriteria[]) => {
    if (criteria.length === 0) {
      setFilteredEmployees([...employees]);
      setActiveSearchId(null);
      return;
    }

    const filtered = employees.filter(employee => {
      return criteria.every(criterion => {
        const value = employee[criterion.field as keyof typeof employee];
        
        if (value === undefined || value === null) {
          return false;
        }
        
        const stringValue = String(value).toLowerCase();
        const criterionValue = criterion.value.toLowerCase();
        
        switch (criterion.operator) {
          case 'contains':
            return stringValue.includes(criterionValue);
          case 'equals':
            return stringValue === criterionValue;
          case 'startsWith':
            return stringValue.startsWith(criterionValue);
          case 'endsWith':
            return stringValue.endsWith(criterionValue);
          case 'before':
            if (['visaExpiryDate', 'joinDate', 'dateOfBirth'].includes(criterion.field)) {
              return new Date(stringValue) < new Date(criterionValue);
            }
            return false;
          case 'after':
            if (['visaExpiryDate', 'joinDate', 'dateOfBirth'].includes(criterion.field)) {
              return new Date(stringValue) > new Date(criterionValue);
            }
            return false;
          default:
            return false;
        }
      });
    });
    
    setFilteredEmployees(filtered);
  };

  // Save search
  const handleSaveSearch = (search: SavedSearch) => {
    setSavedSearches([...savedSearches, search]);
  };

  // Load saved search
  const handleLoadSearch = (searchId: string) => {
    const search = savedSearches.find(s => s.id === searchId);
    if (search) {
      handleSearch(search.criteria);
      setActiveSearchId(searchId);
    }
  };

  // Apply filter from saved searches
  const handleApplyFilter = (searchId: string) => {
    handleLoadSearch(searchId);
  };

  // Delete saved filter
  const handleDeleteFilter = (searchId: string) => {
    setSavedSearches(savedSearches.filter(s => s.id !== searchId));
    if (activeSearchId === searchId) {
      setFilteredEmployees([...employees]);
      setActiveSearchId(null);
    }
  };

  // Rename saved filter
  const handleRenameFilter = (searchId: string, newName: string) => {
    setSavedSearches(savedSearches.map(s => 
      s.id === searchId ? { ...s, name: newName } : s
    ));
  };

  // Handle import
  const handleImport = (importedEmployees: any[]) => {
    // In a real app, this would validate and process the imported data
    // For this demo, we'll just add the imported employees to our list
    const newEmployees = importedEmployees.map(emp => ({
      ...emp,
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      documents: []
    }));
    
    setEmployees([...newEmployees, ...employees]);
    setFilteredEmployees([...newEmployees, ...employees]);
  };

  // Handle export
  const handleExport = () => {
    // In a real app, this would export the data to a file
    console.log('Exporting employees:', filteredEmployees);
  };

  // Handle backup
  const handleBackup = () => {
    // In a real app, this would create a backup of all system data
    console.log('Creating backup of system data');
  };

  // Handle restore
  const handleRestore = (backupData: any) => {
    // In a real app, this would restore the system from a backup
    console.log('Restoring system from backup:', backupData);
    
    if (backupData.employees) {
      setEmployees([...backupData.employees]);
      setFilteredEmployees([...backupData.employees]);
    }
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
        <h1 style={{ margin: 0, color: '#333' }}>Advanced Employee Management</h1>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowImportExport(!showImportExport)}
            style={{
              backgroundColor: showImportExport ? '#e3f2fd' : '#f5f5f5',
              color: showImportExport ? '#1976d2' : '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: showImportExport ? '500' : 'normal'
            }}
          >
            {showImportExport ? 'Hide Import/Export' : 'Show Import/Export'}
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#666', fontSize: '0.875rem' }}>
            {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
          </span>
          {activeSearchId && (
            <div style={{ 
              backgroundColor: '#e3f2fd', 
              color: '#1976d2', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>Filter applied</span>
              <button
                onClick={() => {
                  setFilteredEmployees([...employees]);
                  setActiveSearchId(null);
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#1976d2',
                  cursor: 'pointer',
                  padding: '0',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Import/Export Section */}
      {showImportExport && (
        <DataImportExport
          onImport={handleImport}
          onExport={handleExport}
          onBackup={handleBackup}
          onRestore={handleRestore}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '20px' }}>
        {/* Left Sidebar */}
        <div>
          <CustomFilters
            savedSearches={savedSearches}
            onApplyFilter={handleApplyFilter}
            onDeleteFilter={handleDeleteFilter}
            onRenameFilter={handleRenameFilter}
          />
        </div>
        
        {/* Main Content */}
        <div>
          <AdvancedSearch
            onSearch={handleSearch}
            onSaveSearch={handleSaveSearch}
            savedSearches={savedSearches}
            onLoadSearch={handleLoadSearch}
          />
          
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            padding: '20px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', color: '#333', marginTop: 0, marginBottom: '16px' }}>
              Employee Results
            </h2>
            
            {filteredEmployees.length > 0 ? (
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
                          {companies.find(c => c.id === employee.companyId)?.name || employee.companyId}
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
                <p style={{ margin: 0, fontSize: '1rem' }}>No employees found matching your search criteria.</p>
                <p style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>
                  Try adjusting your search filters or clear the search to see all employees.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedEmployeeManagement;
