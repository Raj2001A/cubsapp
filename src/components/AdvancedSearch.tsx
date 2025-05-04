import React, { useState } from 'react';
import { companies } from '../data/companies';

// Define the filter criteria interface
export interface FilterCriteria {
  id: string;
  field: string;
  operator: string;
  value: string;
}

// Define the saved search interface
export interface SavedSearch {
  id: string;
  name: string;
  criteria: FilterCriteria[];
}

interface AdvancedSearchProps {
  onSearch: (criteria: FilterCriteria[]) => void;
  onSaveSearch?: (search: SavedSearch) => void;
  savedSearches?: SavedSearch[];
  onLoadSearch?: (searchId: string) => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onSaveSearch,
  savedSearches = [],
  onLoadSearch
}) => {
  const [criteria, setCriteria] = useState<FilterCriteria[]>([
    { id: '1', field: 'name', operator: 'contains', value: '' }
  ]);
  const [searchName, setSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedSavedSearch, setSelectedSavedSearch] = useState('');

  // Available fields for searching
  const availableFields = [
    { id: 'name', label: 'Name' },
    { id: 'employeeId', label: 'Employee ID' },
    { id: 'email', label: 'Email' },
    { id: 'trade', label: 'Trade' },
    { id: 'nationality', label: 'Nationality' },
    { id: 'companyId', label: 'Company' },
    { id: 'department', label: 'Department' },
    { id: 'position', label: 'Position' },
    { id: 'visaStatus', label: 'Visa Status' },
    { id: 'visaExpiryDate', label: 'Visa Expiry Date' },
    { id: 'joinDate', label: 'Join Date' },
    { id: 'dateOfBirth', label: 'Date of Birth' },
    { id: 'mobileNumber', label: 'Mobile Number' }
  ];

  // Available operators based on field type
  const getAvailableOperators = (field: string) => {
    if (['visaExpiryDate', 'joinDate', 'dateOfBirth'].includes(field)) {
      return [
        { id: 'equals', label: 'Equals' },
        { id: 'before', label: 'Before' },
        { id: 'after', label: 'After' }
      ];
    } else if (field === 'visaStatus') {
      return [
        { id: 'equals', label: 'Equals' }
      ];
    } else if (field === 'companyId') {
      return [
        { id: 'equals', label: 'Equals' }
      ];
    } else {
      return [
        { id: 'contains', label: 'Contains' },
        { id: 'equals', label: 'Equals' },
        { id: 'startsWith', label: 'Starts with' },
        { id: 'endsWith', label: 'Ends with' }
      ];
    }
  };

  // Get input type based on field
  const getInputType = (field: string) => {
    if (['visaExpiryDate', 'joinDate', 'dateOfBirth'].includes(field)) {
      return 'date';
    }
    return 'text';
  };

  // Get input options for select fields
  const getInputOptions = (field: string) => {
    if (field === 'visaStatus') {
      return [
        { id: 'active', label: 'Active' },
        { id: 'expiring', label: 'Expiring' },
        { id: 'expired', label: 'Expired' }
      ];
    } else if (field === 'companyId') {
      return companies.map(company => ({
        id: company.id,
        label: company.name
      }));
    }
    return null;
  };

  // Add a new criteria
  const handleAddCriteria = () => {
    const newId = (criteria.length + 1).toString();
    setCriteria([...criteria, { id: newId, field: 'name', operator: 'contains', value: '' }]);
  };

  // Remove a criteria
  const handleRemoveCriteria = (id: string) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter(c => c.id !== id));
    }
  };

  // Update a criteria
  const handleCriteriaChange = (id: string, field: string, value: string) => {
    setCriteria(criteria.map(c => {
      if (c.id === id) {
        const updatedCriteria = { ...c, [field]: value };
        
        // Reset operator if field changes
        if (field === 'field') {
          updatedCriteria.operator = getAvailableOperators(value)[0].id;
          updatedCriteria.value = '';
        }
        
        return updatedCriteria;
      }
      return c;
    }));
  };

  // Handle search
  const handleSearch = () => {
    // Filter out empty criteria
    const validCriteria = criteria.filter(c => c.value !== '');
    onSearch(validCriteria);
  };

  // Handle save search
  const handleSaveSearch = () => {
    if (searchName.trim() === '') return;
    
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: searchName,
      criteria: [...criteria]
    };
    
    if (onSaveSearch) {
      onSaveSearch(newSearch);
    }
    
    setSearchName('');
    setShowSaveDialog(false);
  };

  // Handle load saved search
  const handleLoadSearch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const searchId = e.target.value;
    setSelectedSavedSearch(searchId);
    
    if (searchId && onLoadSearch) {
      onLoadSearch(searchId);
      
      // Find the saved search and update criteria
      const search = savedSearches.find(s => s.id === searchId);
      if (search) {
        setCriteria([...search.criteria]);
      }
    }
  };

  // Reset search
  const handleResetSearch = () => {
    setCriteria([{ id: '1', field: 'name', operator: 'contains', value: '' }]);
    setSelectedSavedSearch('');
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>Advanced Search</h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {savedSearches.length > 0 && (
            <select
              value={selectedSavedSearch}
              onChange={handleLoadSearch}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                fontSize: '14px'
              }}
            >
              <option value="">Load Saved Search</option>
              {savedSearches.map(search => (
                <option key={search.id} value={search.id}>{search.name}</option>
              ))}
            </select>
          )}
          
          <button
            onClick={() => setShowSaveDialog(true)}
            style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Save Search
          </button>
          
          <button
            onClick={handleResetSearch}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reset
          </button>
        </div>
      </div>
      
      {/* Search criteria */}
      <div style={{ marginBottom: '16px' }}>
        {criteria.map((criterion) => (
          <div 
            key={criterion.id} 
            style={{ 
              display: 'flex', 
              gap: '8px', 
              marginBottom: '8px',
              alignItems: 'center'
            }}
          >
            <select
              value={criterion.field}
              onChange={(e) => handleCriteriaChange(criterion.id, 'field', e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                fontSize: '14px',
                flex: 1
              }}
            >
              {availableFields.map(field => (
                <option key={field.id} value={field.id}>{field.label}</option>
              ))}
            </select>
            
            <select
              value={criterion.operator}
              onChange={(e) => handleCriteriaChange(criterion.id, 'operator', e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                fontSize: '14px',
                flex: 1
              }}
            >
              {getAvailableOperators(criterion.field).map(op => (
                <option key={op.id} value={op.id}>{op.label}</option>
              ))}
            </select>
            
            {getInputOptions(criterion.field) ? (
              <select
                value={criterion.value}
                onChange={(e) => handleCriteriaChange(criterion.id, 'value', e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  flex: 2
                }}
              >
                <option value="">Select a value</option>
                {getInputOptions(criterion.field)?.map(option => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={getInputType(criterion.field)}
                value={criterion.value}
                onChange={(e) => handleCriteriaChange(criterion.id, 'value', e.target.value)}
                placeholder="Enter value"
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  flex: 2
                }}
              />
            )}
            
            <button
              onClick={() => handleRemoveCriteria(criterion.id)}
              disabled={criteria.length === 1}
              style={{
                backgroundColor: criteria.length === 1 ? '#f5f5f5' : '#ffebee',
                color: criteria.length === 1 ? '#bdbdbd' : '#d32f2f',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: criteria.length === 1 ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={handleAddCriteria}
          style={{
            backgroundColor: '#e8f5e9',
            color: '#388e3c',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>+</span> Add Criteria
        </button>
        
        <button
          onClick={handleSearch}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Search
        </button>
      </div>
      
      {/* Save search dialog */}
      {showSaveDialog && (
        <div style={{ 
          marginTop: '16px', 
          padding: '16px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '4px',
          border: '1px solid #eee'
        }}>
          <h4 style={{ margin: '0 0 8px', color: '#333' }}>Save Current Search</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter a name for this search"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleSaveSearch}
              disabled={searchName.trim() === ''}
              style={{
                backgroundColor: searchName.trim() === '' ? '#f5f5f5' : '#4CAF50',
                color: searchName.trim() === '' ? '#bdbdbd' : 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: searchName.trim() === '' ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              Save
            </button>
            <button
              onClick={() => setShowSaveDialog(false)}
              style={{
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
