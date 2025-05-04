/**
 * Service Worker Manager
 * 
 * This utility provides functions to interact with the service worker
 * for offline support and updates.
 */

// Check if service worker is supported
export const isServiceWorkerSupported = (): boolean => {
  return 'serviceWorker' in navigator;
};

// Register the service worker
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!isServiceWorkerSupported()) {
    console.warn('Service workers are not supported in this browser');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered with scope:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Check for service worker updates
export const checkForUpdates = async (): Promise<boolean> => {
  if (!isServiceWorkerSupported()) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return false;
    }
    
    await registration.update();
    return registration.waiting !== null;
  } catch (error) {
    console.error('Error checking for Service Worker updates:', error);
    return false;
  }
};

// Apply service worker update
export const applyUpdate = async (): Promise<boolean> => {
  if (!isServiceWorkerSupported()) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration || !registration.waiting) {
      return false;
    }
    
    // Send a message to the waiting service worker to skip waiting
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Wait for the new service worker to take control
    return new Promise<boolean>((resolve) => {
      // Listen for the controlling service worker to change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        resolve(true);
      });
      
      // Set a timeout in case the controllerchange event doesn't fire
      setTimeout(() => resolve(false), 3000);
    });
  } catch (error) {
    console.error('Error applying Service Worker update:', error);
    return false;
  }
};

// Unregister the service worker
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if (!isServiceWorkerSupported()) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return false;
    }
    
    const success = await registration.unregister();
    return success;
  } catch (error) {
    console.error('Error unregistering Service Worker:', error);
    return false;
  }
};

// Check if the app is being served from cache by the service worker
export const isServedFromCache = (): boolean => {
  return isServiceWorkerSupported() && 
         navigator.serviceWorker.controller !== null &&
         document.querySelector('meta[name="from-cache"]') !== null;
};

// Add a listener for service worker updates
export const addUpdateListener = (callback: () => void): () => void => {
  if (!isServiceWorkerSupported()) {
    return () => {}; // Return empty function if not supported
  }
  
  const listener = () => {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration && registration.waiting) {
        callback();
      }
    });
  };
  
  navigator.serviceWorker.addEventListener('controllerchange', listener);
  
  // Return a function to remove the listener
  return () => {
    navigator.serviceWorker.removeEventListener('controllerchange', listener);
  };
};
