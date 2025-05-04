/**
 * Debug Tools
 * 
 * A collection of utilities for debugging React applications
 * Helps identify render loops, performance issues, and network problems
 */

import { useRef, useEffect } from 'react';

// Debug levels
export enum DebugLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5
}

// Current debug level - can be changed at runtime
let currentDebugLevel = DebugLevel.ERROR;

// Enable/disable specific debug features
const debugConfig = {
  logRenders: false,
  logEffects: false,
  logNetworkRequests: false,
  logStateChanges: false,
  logContextChanges: false,
  breakOnInfiniteLoop: true,
  renderThreshold: 20, // ms - log renders that take longer than this
  effectThreshold: 10, // ms - log effects that take longer than this
};

// Set debug level
export const setDebugLevel = (level: DebugLevel): void => {
  currentDebugLevel = level;
  console.log(`Debug level set to ${DebugLevel[level]}`);
};

// Configure debug options
export const configureDebug = (options: Partial<typeof debugConfig>): void => {
  Object.assign(debugConfig, options);
  console.log('Debug configuration updated:', debugConfig);
};

// Debug logger with levels
export const debugLog = (level: DebugLevel, message: string, ...data: any[]): void => {
  if (level <= currentDebugLevel) {
    const prefix = `[${DebugLevel[level]}]`;
    
    switch (level) {
      case DebugLevel.ERROR:
        console.error(prefix, message, ...data);
        break;
      case DebugLevel.WARN:
        console.warn(prefix, message, ...data);
        break;
      case DebugLevel.INFO:
        console.info(prefix, message, ...data);
        break;
      case DebugLevel.DEBUG:
      case DebugLevel.TRACE:
      default:
        console.log(prefix, message, ...data);
    }
  }
};

// Track render counts and times for components
const componentRenderCounts = new Map<string, number>();
const componentRenderTimes = new Map<string, number[]>();

// Hook to track component renders
export const useRenderTracker = (componentName: string): void => {
  const renderStartTime = useRef(performance.now());
  
  // Update render count
  const currentCount = componentRenderCounts.get(componentName) || 0;
  componentRenderCounts.set(componentName, currentCount + 1);
  
  // Store last render time
  useEffect(() => {
    if (debugConfig.logRenders) {
      const renderTime = performance.now() - renderStartTime.current;
      
      // Store last 5 render times
      const times = componentRenderTimes.get(componentName) || [];
      times.unshift(renderTime);
      componentRenderTimes.set(componentName, times.slice(0, 5));
      
      // Log if render took longer than threshold
      if (renderTime > debugConfig.renderThreshold) {
        debugLog(
          DebugLevel.WARN, 
          `Slow render: ${componentName} took ${renderTime.toFixed(2)}ms (render #${currentCount + 1})`
        );
      } else {
        debugLog(
          DebugLevel.DEBUG, 
          `Render: ${componentName} in ${renderTime.toFixed(2)}ms (render #${currentCount + 1})`
        );
      }
    }
  });
  
  // Check for potential infinite loops
  useEffect(() => {
    const count = componentRenderCounts.get(componentName) || 0;
    const times = componentRenderTimes.get(componentName) || [];
    
    // If we have at least 5 renders and the average time between renders is < 50ms
    if (count > 5 && times.length >= 3) {
      const avgRenderTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      
      if (avgRenderTime < 50) {
        debugLog(
          DebugLevel.WARN,
          `Potential render loop detected in ${componentName}: ${count} renders with avg time ${avgRenderTime.toFixed(2)}ms`
        );
        
        if (debugConfig.breakOnInfiniteLoop && count > 20) {
          debugLog(
            DebugLevel.ERROR,
            `Breaking potential infinite loop in ${componentName} after ${count} renders`
          );
          
          // This will pause execution in the debugger if dev tools are open
          // eslint-disable-next-line no-debugger
          debugger;
        }
      }
    }
  });
};

// Hook to track effect execution times
export const useEffectTracker = (
  effectName: string, 
  effect: () => void | (() => void), 
  deps?: React.DependencyList
): void => {
  useEffect(() => {
    if (debugConfig.logEffects) {
      debugLog(DebugLevel.DEBUG, `Effect started: ${effectName}`);
      const startTime = performance.now();
      
      const cleanup = effect();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (duration > debugConfig.effectThreshold) {
        debugLog(
          DebugLevel.WARN, 
          `Slow effect: ${effectName} took ${duration.toFixed(2)}ms`
        );
      } else {
        debugLog(
          DebugLevel.DEBUG, 
          `Effect completed: ${effectName} in ${duration.toFixed(2)}ms`
        );
      }
      
      return typeof cleanup === 'function' ? () => {
        debugLog(DebugLevel.DEBUG, `Effect cleanup: ${effectName}`);
        cleanup();
      } : undefined;
    } else {
      return effect();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

// Network request tracking
let pendingRequests = 0;
const requestTimes = new Map<string, number>();

// Intercept fetch to track network requests
const originalFetch = window.fetch;
window.fetch = function trackedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!debugConfig.logNetworkRequests) {
    return originalFetch.apply(window, [input, init]);
  }
  
  // --- FIX: Properly extract URL from input ---
  let url: string;
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof Request) {
    url = input.url;
  } else if (input instanceof URL) {
    url = input.toString();
  } else {
    url = String(input);
  }
  const method = init?.method || 'GET';
  const requestId = `${method} ${url} ${Date.now()}`;
  
  pendingRequests++;
  requestTimes.set(requestId, performance.now());
  
  debugLog(DebugLevel.INFO, `🌐 Request started: ${method} ${url}`, init?.body);
  
  return originalFetch.apply(window, [input, init])
    .then(response => {
      const time = performance.now() - (requestTimes.get(requestId) || 0);
      pendingRequests--;
      
      debugLog(
        response.ok ? DebugLevel.INFO : DebugLevel.ERROR,
        `🌐 Request ${response.ok ? 'succeeded' : 'failed'}: ${method} ${url} (${response.status}) in ${time.toFixed(2)}ms`
      );
      
      return response;
    })
    .catch(error => {
      const time = performance.now() - (requestTimes.get(requestId) || 0);
      pendingRequests--;
      
      debugLog(
        DebugLevel.ERROR,
        `🌐 Request error: ${method} ${url} in ${time.toFixed(2)}ms`,
        error
      );
      
      throw error;
    });
};

// Get debug stats
export const getDebugStats = (): Record<string, any> => {
  // --- FIX: Only access performance.memory if it exists and has the correct shape ---
  let memoryInfo: string | { usedJSHeapSize?: string; totalJSHeapSize?: string } = 'Not available';
  const perfAny = performance as any;
  if (
    perfAny.memory &&
    typeof perfAny.memory.usedJSHeapSize === 'number' &&
    typeof perfAny.memory.totalJSHeapSize === 'number'
  ) {
    memoryInfo = {
      usedJSHeapSize: Math.round(perfAny.memory.usedJSHeapSize / (1024 * 1024)) + 'MB',
      totalJSHeapSize: Math.round(perfAny.memory.totalJSHeapSize / (1024 * 1024)) + 'MB',
    };
  }

  return {
    debugLevel: DebugLevel[currentDebugLevel],
    config: { ...debugConfig },
    componentRenders: Object.fromEntries(componentRenderCounts.entries()),
    pendingRequests,
    memory: memoryInfo,
  };
};

// Reset debug stats
export const resetDebugStats = (): void => {
  componentRenderCounts.clear();
  componentRenderTimes.clear();
  requestTimes.clear();
  pendingRequests = 0;
  debugLog(DebugLevel.INFO, 'Debug stats reset');
};

// Create a global debug object for console access
(window as any).__DEBUG__ = {
  setLevel: setDebugLevel,
  configure: configureDebug,
  getStats: getDebugStats,
  reset: resetDebugStats,
  levels: DebugLevel,
};

// Log that debug tools are initialized
debugLog(DebugLevel.INFO, 'Debug tools initialized. Access via window.__DEBUG__ in console');
