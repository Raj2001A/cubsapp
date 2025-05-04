import React from 'react';

interface FallbackErrorPageProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const FallbackErrorPage: React.FC<FallbackErrorPageProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '40px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#e53e3e"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginBottom: '20px' }}
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        
        <h1 style={{ 
          color: '#1a202c', 
          fontSize: '24px', 
          marginBottom: '16px' 
        }}>
          Something went wrong
        </h1>
        
        <p style={{ 
          color: '#4a5568', 
          marginBottom: '24px',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          We're sorry, but the application has encountered an unexpected error.
        </p>
        
        {error && (
          <div style={{
            backgroundColor: '#f7fafc',
            padding: '16px',
            borderRadius: '4px',
            marginBottom: '24px',
            textAlign: 'left',
            overflow: 'auto',
            maxHeight: '200px'
          }}>
            <p style={{ 
              fontFamily: 'monospace', 
              margin: 0,
              color: '#e53e3e',
              fontSize: '14px'
            }}>
              {error.message}
            </p>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#3182ce',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '10px 16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
          
          {resetErrorBoundary && (
            <button
              onClick={resetErrorBoundary}
              style={{
                backgroundColor: '#4a5568',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Try Again
            </button>
          )}
        </div>
        
        <p style={{ 
          marginTop: '24px',
          fontSize: '14px',
          color: '#718096'
        }}>
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

export default FallbackErrorPage;
