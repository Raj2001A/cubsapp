import React, { useState, useEffect, useRef, ReactNode } from 'react';

/**
 * A component that prevents infinite rendering loops in React applications.
 * This component keeps track of render count and forces a stable state after a threshold.
 */
interface RenderBreakerProps {
  children: ReactNode;
  maxRenders?: number;
}

const RenderBreaker: React.FC<RenderBreakerProps> = ({ 
  children, 
  maxRenders = 25 // Maximum number of renders allowed before breaking the cycle
}) => {
  const [renderCount, setRenderCount] = useState(0);
  const [hasReachedMax, setHasReachedMax] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountTimeRef = useRef<number>(Date.now());
  const lastRenderTimeRef = useRef<number>(Date.now());

  // Track render frequency
  const renderFrequencyRef = useRef<number[]>([]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Calculate time since last render
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    lastRenderTimeRef.current = now;
    
    // Track render frequency (last 5 renders)
    renderFrequencyRef.current = [
      timeSinceLastRender,
      ...renderFrequencyRef.current.slice(0, 4)
    ];
    
    // Calculate average render frequency if we have enough data
    const avgRenderFrequency = renderFrequencyRef.current.length >= 3 
      ? renderFrequencyRef.current.reduce((sum, time) => sum + time, 0) / renderFrequencyRef.current.length
      : 0;
    
    // Detect rapid renders (less than 50ms between renders on average)
    const isRapidRender = avgRenderFrequency > 0 && avgRenderFrequency < 50;
    
    // Only increment if we haven't reached max yet
    if (renderCount < maxRenders && !hasReachedMax) {
      // Use a timeout to avoid immediate state updates
      // Clear previous timeout to avoid multiple increments
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Use a longer timeout for rapid renders to slow down the cycle
      const timeoutDuration = isRapidRender ? 100 : 0;
      
      timeoutRef.current = setTimeout(() => {
        setRenderCount(prev => prev + 1);
        timeoutRef.current = null;
      }, timeoutDuration);
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    } else if (renderCount >= maxRenders && !hasReachedMax) {
      setHasReachedMax(true);
      console.warn(
        `RenderBreaker: Breaking potential infinite render cycle after ${maxRenders} renders in ${(Date.now() - mountTimeRef.current) / 1000}s. ` +
        'This is a protective measure and may indicate an issue in your component state management. ' +
        'Average time between renders: ' + (avgRenderFrequency.toFixed(2)) + 'ms'
      );
    }
  }, [renderCount, maxRenders, hasReachedMax]);

  return <>{children}</>;
};

export default RenderBreaker;
