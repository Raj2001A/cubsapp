import React, { useState } from 'react';
import { useUI } from '../../context/UIContext';
import ErrorDisplay from './ErrorDisplay';

const GlobalErrorDisplay: React.FC = () => {
  const { errors, dismissError } = useUI();
  const [showAllErrors, setShowAllErrors] = useState(false);
  
  // Filter out dismissed errors
  const activeErrors = errors.filter(error => !error.dismissed);
  
  if (activeErrors.length === 0) {
    return null;
  }
  
  // Show only the most recent error by default
  const visibleErrors = showAllErrors ? activeErrors : [activeErrors[0]];
  
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9998,
      width: '90%',
      maxWidth: '600px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '16px'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>
            {activeErrors.length > 1 
              ? `${activeErrors.length} Errors Occurred` 
              : 'An Error Occurred'}
          </h3>
          
          {activeErrors.length > 1 && (
            <button
              onClick={() => setShowAllErrors(!showAllErrors)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#2196f3',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '4px 8px'
              }}
            >
              {showAllErrors ? 'Show Less' : 'Show All'}
            </button>
          )}
        </div>
      </div>
      
      {visibleErrors.map(error => (
        <ErrorDisplay
          key={error.id}
          error={error}
          onDismiss={dismissError}
          showDetails
        />
      ))}
      
      <div style={{ textAlign: 'right', marginTop: '12px' }}>
        <button
          onClick={() => activeErrors.forEach(error => dismissError(error.id))}
          style={{
            backgroundColor: '#f5f5f5',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            color: '#333'
          }}
        >
          Dismiss All
        </button>
      </div>
    </div>
  );
};

export default GlobalErrorDisplay;
