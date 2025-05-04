import React, { useState } from 'react';
import { FilterCriteria, SavedSearch } from './AdvancedSearch';

interface CustomFiltersProps {
  savedSearches: SavedSearch[];
  onApplyFilter: (searchId: string) => void;
  onDeleteFilter: (searchId: string) => void;
  onRenameFilter: (searchId: string, newName: string) => void;
}

const CustomFilters: React.FC<CustomFiltersProps> = ({
  savedSearches,
  onApplyFilter,
  onDeleteFilter,
  onRenameFilter
}) => {
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [newFilterName, setNewFilterName] = useState('');

  // Start editing a filter name
  const handleStartEdit = (filterId: string, currentName: string) => {
    setEditingFilterId(filterId);
    setNewFilterName(currentName);
  };

  // Save the edited filter name
  const handleSaveEdit = () => {
    if (editingFilterId && newFilterName.trim()) {
      onRenameFilter(editingFilterId, newFilterName.trim());
      setEditingFilterId(null);
      setNewFilterName('');
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingFilterId(null);
    setNewFilterName('');
  };

  // Format criteria for display
  const formatCriteria = (criteria: FilterCriteria[]) => {
    return criteria.map(c => {
      const fieldLabel = c.field.charAt(0).toUpperCase() + c.field.slice(1).replace(/([A-Z])/g, ' $1');
      let operatorLabel = '';
      
      switch (c.operator) {
        case 'contains':
          operatorLabel = 'contains';
          break;
        case 'equals':
          operatorLabel = 'equals';
          break;
        case 'startsWith':
          operatorLabel = 'starts with';
          break;
        case 'endsWith':
          operatorLabel = 'ends with';
          break;
        case 'before':
          operatorLabel = 'before';
          break;
        case 'after':
          operatorLabel = 'after';
          break;
        default:
          operatorLabel = c.operator;
      }
      
      return `${fieldLabel} ${operatorLabel} "${c.value}"`;
    }).join(' AND ');
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#333' }}>Saved Filters</h3>
      
      {savedSearches.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center', 
          backgroundColor: '#f9fafb', 
          borderRadius: '4px',
          color: '#6b7280'
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            No saved filters yet. Use the Advanced Search to create and save filters.
          </p>
        </div>
      ) : (
        <div>
          {savedSearches.map(search => (
            <div 
              key={search.id} 
              style={{ 
                padding: '12px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '4px',
                marginBottom: '8px',
                border: '1px solid #eee'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                {editingFilterId === search.id ? (
                  <input
                    type="text"
                    value={newFilterName}
                    onChange={(e) => setNewFilterName(e.target.value)}
                    autoFocus
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      width: '60%'
                    }}
                  />
                ) : (
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>{search.name}</h4>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {editingFilterId === search.id ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        style={{
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          backgroundColor: '#f5f5f5',
                          color: '#333',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(search.id, search.name)}
                        style={{
                          backgroundColor: '#e3f2fd',
                          color: '#1976d2',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => onDeleteFilter(search.id)}
                        style={{
                          backgroundColor: '#ffebee',
                          color: '#d32f2f',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#666',
                backgroundColor: '#f5f5f5',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                {formatCriteria(search.criteria)}
              </div>
              
              <button
                onClick={() => onApplyFilter(search.id)}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  width: '100%'
                }}
              >
                Apply Filter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomFilters;
