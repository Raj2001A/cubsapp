import React, { useState, useEffect } from 'react';
import DebugPanel from './DebugPanel';
import NetworkMonitor from './NetworkMonitor';
import { setDebugLevel, DebugLevel, configureDebug } from '../../utils/debugTools';

interface DebugToolsProps {
  enabled?: boolean;
}

const DebugTools: React.FC<DebugToolsProps> = ({ enabled = true }) => {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize debug tools
  useEffect(() => {
    if (!isInitialized && isEnabled) {
      // Set initial debug level
      setDebugLevel(DebugLevel.INFO);
      
      // Configure debug options
      configureDebug({
        logRenders: true,
        logEffects: false,
        logNetworkRequests: true,
        logStateChanges: false,
        logContextChanges: false,
        breakOnInfiniteLoop: true,
        renderThreshold: 20,
        effectThreshold: 10
      });
      
      // Log initialization
      console.log('Debug tools initialized');
      
      // Add keyboard shortcut to toggle debug tools
      const handleKeyDown = (e: KeyboardEvent) => {
        // Alt+D to toggle debug tools
        if (e.altKey && e.key === 'd') {
          setIsEnabled(prev => !prev);
        }
        
        // Alt+1-5 to set debug level
        if (e.altKey && e.key >= '1' && e.key <= '5') {
          const level = parseInt(e.key, 10) as DebugLevel;
          setDebugLevel(level);
          console.log(`Debug level set to ${DebugLevel[level]}`);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      
      // Mark as initialized
      setIsInitialized(true);
      
      // Cleanup
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isEnabled, isInitialized]);
  
  // If debug tools are disabled, don't render anything
  if (!isEnabled) {
    return null;
  }
  
  return (
    <>
      <DebugPanel initiallyOpen={false} />
      <NetworkMonitor initiallyOpen={false} />
    </>
  );
};

export default DebugTools;
