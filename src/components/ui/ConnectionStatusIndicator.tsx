import React from 'react';

interface ConnectionStatusIndicatorProps {
  isApiAvailable: boolean;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isApiAvailable
}) => {
  if (isApiAvailable) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: '#2f855a',
          padding: '4px 8px',
          backgroundColor: '#f0fff4',
          borderRadius: '4px',
        }}
        title="Connected to backend API and database"
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#38a169',
        }} />
        <span>API Connected</span>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#f97316', // Orange instead of red
        padding: '4px 8px',
        backgroundColor: '#fff7ed', // Light orange background
        borderRadius: '4px',
      }}
      title="Backend server is running but database connection is not available. Using mock data where possible."
    >
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#f97316', // Orange
      }} />
      <span>Using Mock Data</span>
    </div>
  );
};

export default ConnectionStatusIndicator;
