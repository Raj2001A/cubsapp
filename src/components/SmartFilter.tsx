import React, { useState } from 'react';
import { companies } from '../data/companies';
import { useUI } from '../context/UIContext';
import { OperationType } from '../types/ui';

interface SmartFilterProps {
  onFilter: (filters: FilterOptions) => Promise<void> | void;
}

export interface FilterOptions {
  companyId: string;
  visaStatus: string;
  trade: string;
  nationality: string;
  expiryDateFrom: string;
  expiryDateTo: string;
  searchText: string;
}

// Common trades in construction
const trades = [
  { id: 'carpenter', label: 'Carpenter' },
  { id: 'electrician', label: 'Electrician' },
  { id: 'plumber', label: 'Plumber' },
  { id: 'mason', label: 'Mason' },
  { id: 'painter', label: 'Painter' },
  { id: 'welder', label: 'Welder' },
  { id: 'hvac', label: 'HVAC Technician' },
  { id: 'civil_engineer', label: 'Civil Engineer' },
  { id: 'project_manager', label: 'Project Manager' },
  { id: 'helper', label: 'Helper' },
  { id: 'other', label: 'Other' }
];

// Common nationalities in UAE construction
const nationalities = [
  { id: 'egyptian', label: 'Egyptian' },
  { id: 'indian', label: 'Indian' },
  { id: 'pakistani', label: 'Pakistani' },
  { id: 'bangladeshi', label: 'Bangladeshi' },
  { id: 'nepali', label: 'Nepali' },
  { id: 'filipino', label: 'Filipino' },
  { id: 'jordanian', label: 'Jordanian' },
  { id: 'syrian', label: 'Syrian' },
  { id: 'emirati', label: 'Emirati' },
  { id: 'other', label: 'Other' }
];

const SmartFilter: React.FC<SmartFilterProps> = ({ onFilter }) => {
  const [filters, setFilters] = useState<FilterOptions>({
    companyId: '',
    visaStatus: '',
    trade: '',
    nationality: '',
    expiryDateFrom: '',
    expiryDateTo: '',
    searchText: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const { setLoading } = useUI();

  // Handle filter changes
  const handleFilterChange = async (field: keyof FilterOptions, value: string) => {
    try {
      setIsFiltering(true);
      const updatedFilters = { ...filters, [field]: value };
      setFilters(updatedFilters);

      // Set loading state
      setLoading(OperationType.FILTER_EMPLOYEES, true);

      // Call the onFilter function (which may be async)
      await onFilter(updatedFilters);
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setIsFiltering(false);
      setLoading(OperationType.FILTER_EMPLOYEES, false);
    }
  };

  // Clear all filters
  const handleClearFilters = async () => {
    try {
      setIsFiltering(true);
      const resetFilters = {
        companyId: '',
        visaStatus: '',
        trade: '',
        nationality: '',
        expiryDateFrom: '',
        expiryDateTo: '',
        searchText: ''
      };
      setFilters(resetFilters);

      // Set loading state
      setLoading(OperationType.FILTER_EMPLOYEES, true);

      // Call the onFilter function (which may be async)
      await onFilter(resetFilters);
    } catch (error) {
      console.error('Error clearing filters:', error);
    } finally {
      setIsFiltering(false);
      setLoading(OperationType.FILTER_EMPLOYEES, false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      {/* Basic Search Row */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '16px',
        alignItems: 'center'
      }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search by name, ID, email..."
            value={filters.searchText}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ width: '200px' }}>
          <select
            value={filters.companyId}
            onChange={(e) => handleFilterChange('companyId', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">All Companies</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            backgroundColor: isExpanded ? '#e3f2fd' : '#f5f5f5',
            color: isExpanded ? '#1976d2' : '#333',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 16px',
            cursor: isFiltering ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: isFiltering ? 0.7 : 1
          }}
          disabled={isFiltering}
        >
          {isExpanded ? 'Hide Filters' : 'More Filters'}
          <span style={{ fontSize: '10px', marginTop: '2px' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </button>

        {(filters.companyId || filters.visaStatus || filters.trade ||
          filters.nationality || filters.expiryDateFrom || filters.expiryDateTo ||
          filters.searchText) && (
          <button
            onClick={handleClearFilters}
            style={{
              backgroundColor: '#ffebee',
              color: '#d32f2f',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 16px',
              cursor: isFiltering ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isFiltering ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            disabled={isFiltering}
          >
            {isFiltering ? (
              <>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Clearing...
              </>
            ) : 'Clear Filters'}
          </button>
        )}
      </div>

      {/* Advanced Filters (Expandable) */}
      {isExpanded && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          marginBottom: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555', fontSize: '14px' }}>
              Visa Status
            </label>
            <select
              value={filters.visaStatus}
              onChange={(e) => handleFilterChange('visaStatus', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555', fontSize: '14px' }}>
              Trade
            </label>
            <select
              value={filters.trade}
              onChange={(e) => handleFilterChange('trade', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Trades</option>
              {trades.map(trade => (
                <option key={trade.id} value={trade.id}>{trade.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555', fontSize: '14px' }}>
              Nationality
            </label>
            <select
              value={filters.nationality}
              onChange={(e) => handleFilterChange('nationality', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">All Nationalities</option>
              {nationalities.map(nationality => (
                <option key={nationality.id} value={nationality.id}>{nationality.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555', fontSize: '14px' }}>
              Visa Expiry From
            </label>
            <input
              type="date"
              value={filters.expiryDateFrom}
              onChange={(e) => handleFilterChange('expiryDateFrom', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555', fontSize: '14px' }}>
              Visa Expiry To
            </label>
            <input
              type="date"
              value={filters.expiryDateTo}
              onChange={(e) => handleFilterChange('expiryDateTo', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {(filters.companyId || filters.visaStatus || filters.trade ||
        filters.nationality || filters.expiryDateFrom || filters.expiryDateTo) && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.75rem'
        }}>
          <span style={{ color: '#666' }}>Active filters:</span>

          {filters.companyId && (
            <div style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>Company: {companies.find(c => c.id === filters.companyId)?.name}</span>
              <button
                onClick={() => handleFilterChange('companyId', '')}
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

          {filters.visaStatus && (
            <div style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>Status: {filters.visaStatus.charAt(0).toUpperCase() + filters.visaStatus.slice(1)}</span>
              <button
                onClick={() => handleFilterChange('visaStatus', '')}
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

          {filters.trade && (
            <div style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>Trade: {trades.find(t => t.id === filters.trade)?.label}</span>
              <button
                onClick={() => handleFilterChange('trade', '')}
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

          {filters.nationality && (
            <div style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>Nationality: {nationalities.find(n => n.id === filters.nationality)?.label}</span>
              <button
                onClick={() => handleFilterChange('nationality', '')}
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

          {(filters.expiryDateFrom || filters.expiryDateTo) && (
            <div style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              padding: '4px 8px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>
                Expiry: {filters.expiryDateFrom ? new Date(filters.expiryDateFrom).toLocaleDateString() : 'Any'}
                {' to '}
                {filters.expiryDateTo ? new Date(filters.expiryDateTo).toLocaleDateString() : 'Any'}
              </span>
              <button
                onClick={() => {
                  handleFilterChange('expiryDateFrom', '');
                  handleFilterChange('expiryDateTo', '');
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
      )}
    </div>
  );
};

export default SmartFilter;
