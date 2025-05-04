import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#4CAF50',
  fullScreen = false,
  message = 'Loading...'
}) => {
  // Determine the size in pixels
  const sizeInPx = size === 'small' ? 24 : size === 'medium' ? 40 : 64;
  
  // Styles for the spinner
  const spinnerStyle: React.CSSProperties = {
    border: `${sizeInPx / 8}px solid rgba(0, 0, 0, 0.1)`,
    borderTop: `${sizeInPx / 8}px solid ${color}`,
    borderRadius: '50%',
    width: `${sizeInPx}px`,
    height: `${sizeInPx}px`,
    animation: 'spin 1s linear infinite'
  };
  
  // Styles for the container
  const containerStyle: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      };
  
  // Styles for the message
  const messageStyle: React.CSSProperties = {
    marginTop: '12px',
    color: '#333',
    fontSize: size === 'small' ? '14px' : size === 'medium' ? '16px' : '18px'
  };
  
  // Add the keyframes animation to the document
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {message && <div style={messageStyle}>{message}</div>}
    </div>
  );
};

export default LoadingSpinner;
