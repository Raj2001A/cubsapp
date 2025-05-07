import React, { useEffect, useRef, useState } from 'react';

/**
 * RenderBreaker is a protective component that will detect and stop infinite render cycles
 * It helps debug React performance issues and prevents browser hangs
 */
interface RenderBreakerProps {
  children: React.ReactNode;
  threshold?: number;
  timeWindow?: number;
  onBreak?: (rendered: number, timeMs: number) => void;
}

export default function RenderBreaker({
  children,
  threshold = 200, // Increased from default 100 to be more generous
  timeWindow = 5000, // Increased from default 3000ms to allow for slower devices
  onBreak
}: RenderBreakerProps) {
  const [broken, setBroken] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const renderCount = useRef(0);
  const firstRenderTime = useRef(Date.now());
  const isFirstRender = useRef(true);
  const initialDataLoading = useRef(true);
  const initialLoadTimeout = useRef<number | null>(null);

  // Allow more renders during initial data loading (first 5 seconds)
  useEffect(() => {
    initialLoadTimeout.current = window.setTimeout(() => {
      initialDataLoading.current = false;
    }, 5000);

    return () => {
      if (initialLoadTimeout.current) {
        clearTimeout(initialLoadTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    // Skip first render (this is the initial mount)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    renderCount.current++;
    const now = Date.now();
    const elapsed = now - firstRenderTime.current;

    // Use a higher threshold during initial data loading
    const effectiveThreshold = initialDataLoading.current ? threshold * 2 : threshold;

    // Break if we exceed the threshold within the time window
    if (renderCount.current > effectiveThreshold && elapsed < timeWindow) {
      // Calculate average time between renders
      const avgRenderTime = elapsed / renderCount.current;

      const message = `Breaking potential infinite render cycle after ${renderCount.current} renders in ${(elapsed / 1000).toFixed(2)}s. This is a protective measure and may indicate an issue in your component state management. Average time between renders: ${avgRenderTime.toFixed(2)}ms`;
      console.warn(message);
      setBroken(true);
      setFallbackMessage(message);

      if (onBreak) {
        onBreak(renderCount.current, elapsed);
      }
    }

    // Reset counter if we've gone past the time window
    if (elapsed > timeWindow) {
      renderCount.current = 0;
      firstRenderTime.current = now;
    }
  });

  // Provide a fallback UI when broken
  if (broken) {
    return (
      <div style={{
        margin: '20px',
        padding: '20px',
        border: '2px solid #f00',
        borderRadius: '5px',
        backgroundColor: '#fff0f0',
        color: '#500'
      }}>
        <h3>Too many renders detected</h3>
        <p>{fallbackMessage}</p>
        <p>This may be caused by:</p>
        <ul>
          <li>State update inside a render function</li>
          <li>Missing dependency arrays in hooks</li>
          <li>Mutating state objects directly</li>
          <li>Props changing too frequently</li>
        </ul>
        <button
          onClick={() => setBroken(false)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reset and try again
        </button>
      </div>
    );
  }

  // Normal rendering
  return <>{children}</>;
}
