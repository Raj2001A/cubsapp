import React, { useEffect, useState } from 'react';
import { checkForUpdates, applyUpdate } from '../../utils/ServiceWorkerManager';

const ServiceWorkerUpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check for updates when the component mounts
    checkForUpdates().then(hasUpdate => {
      setUpdateAvailable(hasUpdate);
    });

    // Set up periodic checks for updates
    const intervalId = setInterval(() => {
      checkForUpdates().then(hasUpdate => {
        setUpdateAvailable(hasUpdate);
      });
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(intervalId);
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      const success = await applyUpdate();
      
      if (success) {
        // Reload the page to use the new service worker
        window.location.reload();
      } else {
        setIsUpdating(false);
        setUpdateAvailable(false);
      }
    } catch (error) {
      console.error('Error updating service worker:', error);
      setIsUpdating(false);
    }
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ebf8ff',
        color: '#2b6cb0',
        padding: '12px 16px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '90%',
        width: '400px',
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
      
      <div style={{ flex: 1 }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
          Update Available
        </p>
        <p style={{ margin: 0, fontSize: '14px' }}>
          A new version of the application is available.
        </p>
      </div>
      
      <button
        onClick={handleUpdate}
        disabled={isUpdating}
        style={{
          backgroundColor: '#4299e1',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          cursor: isUpdating ? 'default' : 'pointer',
          opacity: isUpdating ? 0.7 : 1,
          fontSize: '14px',
          fontWeight: 'bold',
        }}
      >
        {isUpdating ? 'Updating...' : 'Update Now'}
      </button>
    </div>
  );
};

export default ServiceWorkerUpdateNotification;
