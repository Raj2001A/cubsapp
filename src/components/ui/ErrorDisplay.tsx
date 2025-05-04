import React from 'react';
import { ErrorMessage, ErrorSeverity } from '../../context/UIContext';

interface ErrorDisplayProps {
  error: ErrorMessage;
  onDismiss?: (id: string) => void;
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
  showDetails = false
}) => {
  // Get the appropriate background and text colors based on severity
  const getColors = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return { bg: '#d1ecf1', text: '#0c5460', border: '#bee5eb' };
      case ErrorSeverity.WARNING:
        return { bg: '#fff3cd', text: '#856404', border: '#ffeeba' };
      case ErrorSeverity.ERROR:
        return { bg: '#f8d7da', text: '#721c24', border: '#f5c6cb' };
      case ErrorSeverity.CRITICAL:
        return { bg: '#d32f2f', text: '#ffffff', border: '#c62828' };
      default:
        return { bg: '#f8f9fa', text: '#343a40', border: '#e9ecef' };
    }
  };
  
  const colors = getColors(error.severity);
  
  // Get the appropriate icon based on severity
  const getIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.INFO:
        return '🛈';
      case ErrorSeverity.WARNING:
        return '⚠️';
      case ErrorSeverity.ERROR:
        return '❌';
      case ErrorSeverity.CRITICAL:
        return '🚨';
      default:
        return '🛈';
    }
  };
  
  const icon = getIcon(error.severity);
  
  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      borderRadius: '4px',
      padding: '12px 16px',
      marginBottom: '12px',
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px'
    }}>
      <div style={{ fontSize: '20px' }}>{icon}</div>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, marginBottom: '4px' }}>{error.message}</div>
        
        {showDetails && error.details && (
          <div style={{ 
            marginTop: '8px', 
            padding: '8px', 
            backgroundColor: 'rgba(0,0,0,0.05)', 
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            {error.details}
          </div>
        )}
        
        {error.operation && (
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Operation: {error.operation}
          </div>
        )}
        
        <div style={{ fontSize: '12px', color: `${colors.text}99`, marginTop: '4px' }}>
          {error.timestamp.toLocaleString()}
        </div>
      </div>
      
      {onDismiss && (
        <button
          onClick={() => onDismiss(error.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: colors.text,
            opacity: 0.7,
            padding: '4px'
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorDisplay;
