import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from '../../services/searchService';

interface AdvancedEmployeeSearchProps {
  onSearch: (filters: EmployeeSearchFilters) => void;
  companyOptions: { id: string; name: string }[];
  tradeOptions: string[];
  nationalityOptions: string[];
}

export interface EmployeeSearchFilters {
  query: string;
  companies: string[];
  trades: string[];
  nationalities: string[];
  visaStatus: 'all' | 'active' | 'expiring' | 'expired';
  joinDateFrom?: string;
  joinDateTo?: string;
}

const AdvancedEmployeeSearch: React.FC<AdvancedEmployeeSearchProps> = ({
  onSearch,
  companyOptions,
  tradeOptions,
  nationalityOptions
}) => {
  const [filters, setFilters] = useState<EmployeeSearchFilters>({
    query: '',
    companies: [],
    trades: [],
    nationalities: [],
    visaStatus: 'all'
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Create a debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((newFilters: EmployeeSearchFilters) => {
      onSearch(newFilters);
    }, 300),
    [onSearch]
  );
  
  // Update filters and trigger search
  const updateFilters = (newFilters: Partial<EmployeeSearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    debouncedSearch(updatedFilters);
  };
  
  // Handle text search input
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilters({ query: e.target.value });
  };
  
  // Handle company selection
  const handleCompanyChange = (companyId: string) => {
    const updatedCompanies = filters.companies.includes(companyId)
      ? filters.companies.filter(id => id !== companyId)
      : [...filters.companies, companyId];
    
    updateFilters({ companies: updatedCompanies });
  };
  
  // Handle trade selection
  const handleTradeChange = (trade: string) => {
    const updatedTrades = filters.trades.includes(trade)
      ? filters.trades.filter(t => t !== trade)
      : [...filters.trades, trade];
    
    updateFilters({ trades: updatedTrades });
  };
  
  // Handle nationality selection
  const handleNationalityChange = (nationality: string) => {
    const updatedNationalities = filters.nationalities.includes(nationality)
      ? filters.nationalities.filter(n => n !== nationality)
      : [...filters.nationalities, nationality];
    
    updateFilters({ nationalities: updatedNationalities });
  };
  
  // Handle visa status selection
  const handleVisaStatusChange = (status: 'all' | 'active' | 'expiring' | 'expired') => {
    updateFilters({ visaStatus: status });
  };
  
  // Handle date range selection
  const handleDateChange = (field: 'joinDateFrom' | 'joinDateTo', value: string) => {
    updateFilters({ [field]: value });
  };
  
  // Clear all filters
  const clearFilters = () => {
    const resetFilters = {
      query: '',
      companies: [],
      trades: [],
      nationalities: [],
      visaStatus: 'all' as const,
      joinDateFrom: undefined,
      joinDateTo: undefined
    };
    
    setFilters(resetFilters);
    onSearch(resetFilters);
  };
  
  // Trigger initial search on mount
  useEffect(() => {
    onSearch(filters);
  }, [onSearch, filters]);

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '16px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      {/* Search Bar */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: isExpanded ? '16px' : '0'
      }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            value={filters.query}
            onChange={handleSearchInput}
            placeholder="Search employees by name, ID, email..."
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem'
            }}
          />
          <div style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#6b7280'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
            </svg>
          </div>
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            backgroundColor: 'transparent',
            color: '#4b5563',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            padding: '10px 12px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>{isExpanded ? 'Hide Filters' : 'Show Filters'}</span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'none' }}
          >
            <path d="M7 10l5 5 5-5z" fill="currentColor" />
          </svg>
        </button>
        
        {(filters.query || filters.companies.length > 0 || filters.trades.length > 0 || 
          filters.nationalities.length > 0 || filters.visaStatus !== 'all' || 
          filters.joinDateFrom || filters.joinDateTo) && (
          <button
            onClick={clearFilters}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 12px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Clear Filters
          </button>
        )}
      </div>
      
      {/* Advanced Filters */}
      {isExpanded && (
        <div style={{ 
          marginTop: '16px',
          borderTop: '1px solid #e5e7eb',
          paddingTop: '16px'
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            {/* Company Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '8px', fontWeight: '500' }}>
                Company
              </label>
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '8px'
              }}>
                {companyOptions.map(company => (
                  <div key={company.id} style={{ marginBottom: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={filters.companies.includes(company.id)}
                        onChange={() => handleCompanyChange(company.id)}
                        style={{ marginRight: '8px' }}
                      />
                      {company.name.split(',')[0]}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Trade Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '8px', fontWeight: '500' }}>
                Trade
              </label>
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '8px'
              }}>
                {tradeOptions.map(trade => (
                  <div key={trade} style={{ marginBottom: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={filters.trades.includes(trade)}
                        onChange={() => handleTradeChange(trade)}
                        style={{ marginRight: '8px' }}
                      />
                      {trade}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Nationality Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '8px', fontWeight: '500' }}>
                Nationality
              </label>
              <div style={{ 
                maxHeight: '150px', 
                overflowY: 'auto',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                padding: '8px'
              }}>
                {nationalityOptions.map(nationality => (
                  <div key={nationality} style={{ marginBottom: '6px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={filters.nationalities.includes(nationality)}
                        onChange={() => handleNationalityChange(nationality)}
                        style={{ marginRight: '8px' }}
                      />
                      {nationality}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Visa Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '8px', fontWeight: '500' }}>
                Visa Status
              </label>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'expiring', label: 'Expiring Soon' },
                  { value: 'expired', label: 'Expired' }
                ].map(option => (
                  <label 
                    key={option.value} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    <input
                      type="radio"
                      name="visaStatus"
                      checked={filters.visaStatus === option.value}
                      onChange={() => handleVisaStatusChange(option.value as any)}
                      style={{ marginRight: '8px' }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Join Date Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '8px', fontWeight: '500' }}>
                Join Date Range
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
                    From:
                  </label>
                  <input
                    type="date"
                    value={filters.joinDateFrom || ''}
                    onChange={(e) => handleDateChange('joinDateFrom', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
                    To:
                  </label>
                  <input
                    type="date"
                    value={filters.joinDateTo || ''}
                    onChange={(e) => handleDateChange('joinDateTo', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Active Filters Summary */}
          {(filters.companies.length > 0 || filters.trades.length > 0 || 
            filters.nationalities.length > 0 || filters.visaStatus !== 'all' || 
            filters.joinDateFrom || filters.joinDateTo) && (
            <div style={{ 
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              fontSize: '0.875rem',
              color: '#4b5563'
            }}>
              <div style={{ fontWeight: '500', marginBottom: '8px' }}>Active Filters:</div>
              <div style={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                {filters.companies.length > 0 && (
                  <div style={{ 
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    Companies: {filters.companies.length}
                  </div>
                )}
                
                {filters.trades.length > 0 && (
                  <div style={{ 
                    backgroundColor: '#f0fdf4',
                    color: '#16a34a',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    Trades: {filters.trades.length}
                  </div>
                )}
                
                {filters.nationalities.length > 0 && (
                  <div style={{ 
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    Nationalities: {filters.nationalities.length}
                  </div>
                )}
                
                {filters.visaStatus !== 'all' && (
                  <div style={{ 
                    backgroundColor: filters.visaStatus === 'active' ? '#e8f5e9' :
                                    filters.visaStatus === 'expiring' ? '#fff8e1' : '#ffebee',
                    color: filters.visaStatus === 'active' ? '#388e3c' :
                          filters.visaStatus === 'expiring' ? '#ffa000' : '#d32f2f',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    Visa: {filters.visaStatus === 'active' ? 'Active' :
                          filters.visaStatus === 'expiring' ? 'Expiring' : 'Expired'}
                  </div>
                )}
                
                {(filters.joinDateFrom || filters.joinDateTo) && (
                  <div style={{ 
                    backgroundColor: '#f3e8ff',
                    color: '#9333ea',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}>
                    Join Date: {filters.joinDateFrom ? new Date(filters.joinDateFrom).toLocaleDateString() : 'Any'} 
                    {' '} to {' '}
                    {filters.joinDateTo ? new Date(filters.joinDateTo).toLocaleDateString() : 'Any'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedEmployeeSearch;
