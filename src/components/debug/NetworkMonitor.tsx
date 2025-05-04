import React, { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { ConnectionStatus } from '../../services/websocketService';

interface NetworkMonitorProps {
  initiallyOpen?: boolean;
  apiEndpoint?: string;
}

interface NetworkStatus {
  api: {
    status: 'online' | 'offline' | 'error' | 'unknown';
    latency: number | null;
    lastChecked: Date | null;
    errorMessage?: string;
  };
  websocket: {
    status: ConnectionStatus;
    connected: boolean;
    clientId: string | null;
    subscriptions: string[];
    lastEvent: Date | null;
  };
  endpoints: Record<string, {
    status: 'success' | 'error' | 'pending';
    latency: number | null;
    lastChecked: Date | null;
    statusCode?: number;
    errorMessage?: string;
  }>;
}

const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ 
  initiallyOpen = false,
  apiEndpoint = '/api/backend/status'
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [status, setStatus] = useState<NetworkStatus>({
    api: {
      status: 'unknown',
      latency: null,
      lastChecked: null
    },
    websocket: {
      status: ConnectionStatus.DISCONNECTED,
      connected: false,
      clientId: null,
      subscriptions: [],
      lastEvent: null
    },
    endpoints: {}
  });
  const [isChecking, setIsChecking] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get WebSocket context
  const ws = useWebSocket();
  
  // Toggle panel
  const togglePanel = () => {
    setIsOpen(prev => !prev);
  };
  
  // Check API status
  const checkApiStatus = async () => {
    setIsChecking(true);
    
    try {
      const startTime = performance.now();
      
      // Try the proxied endpoint first
      try {
        const response = await fetch(apiEndpoint, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        const endTime = performance.now();
        const latency = endTime - startTime;
        
        setStatus(prev => ({
          ...prev,
          api: {
            status: response.ok ? 'online' : 'error',
            latency,
            lastChecked: new Date(),
            errorMessage: response.ok ? undefined : `Status: ${response.status}`
          }
        }));
        
        return;
      } catch (error) {
        console.log('Proxy endpoint failed, trying direct endpoint...');
      }
      
      // If proxy fails, try direct endpoint
      const directEndpoint = `${window.location.protocol}//${window.location.hostname}:5002/backend/status`;
      const response = await fetch(directEndpoint, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      setStatus(prev => ({
        ...prev,
        api: {
          status: response.ok ? 'online' : 'error',
          latency,
          lastChecked: new Date(),
          errorMessage: response.ok ? undefined : `Status: ${response.status}`
        }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        api: {
          status: 'offline',
          latency: null,
          lastChecked: new Date(),
          errorMessage: error instanceof Error ? error.message : String(error)
        }
      }));
    } finally {
      setIsChecking(false);
    }
  };
  
  // Check specific endpoint
  const checkEndpoint = async (url: string) => {
    try {
      setStatus(prev => ({
        ...prev,
        endpoints: {
          ...prev.endpoints,
          [url]: {
            ...prev.endpoints[url],
            status: 'pending',
            lastChecked: new Date()
          }
        }
      }));
      
      const startTime = performance.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const endTime = performance.now();
      const latency = endTime - startTime;
      
      setStatus(prev => ({
        ...prev,
        endpoints: {
          ...prev.endpoints,
          [url]: {
            status: response.ok ? 'success' : 'error',
            latency,
            lastChecked: new Date(),
            statusCode: response.status,
            errorMessage: response.ok ? undefined : `Status: ${response.status}`
          }
        }
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        endpoints: {
          ...prev.endpoints,
          [url]: {
            status: 'error',
            latency: null,
            lastChecked: new Date(),
            errorMessage: error instanceof Error ? error.message : String(error)
          }
        }
      }));
    }
  };
  
  // Add endpoint to check
  const addEndpoint = () => {
    const url = prompt('Enter endpoint URL to check:');
    if (!url) return;
    
    setStatus(prev => ({
      ...prev,
      endpoints: {
        ...prev.endpoints,
        [url]: {
          status: 'pending',
          latency: null,
          lastChecked: null
        }
      }
    }));
    
    checkEndpoint(url);
  };
  
  // Remove endpoint
  const removeEndpoint = (url: string) => {
    setStatus(prev => {
      const newEndpoints = { ...prev.endpoints };
      delete newEndpoints[url];
      return {
        ...prev,
        endpoints: newEndpoints
      };
    });
  };
  
  // Check all
  const checkAll = () => {
    checkApiStatus();
    Object.keys(status.endpoints).forEach(checkEndpoint);
  };
  
  // Toggle auto refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };
  
  // Update WebSocket status from context
  useEffect(() => {
    setStatus(prev => ({
      ...prev,
      websocket: {
        status: ws.status,
        connected: ws.isConnected,
        clientId: ws.clientId,
        subscriptions: ws.subscriptions,
        lastEvent: prev.websocket.lastEvent
      }
    }));
  }, [ws.status, ws.isConnected, ws.clientId, ws.subscriptions]);
  
  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      timerRef.current = setInterval(checkAll, 5000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoRefresh]);
  
  // Initial check
  useEffect(() => {
    checkApiStatus();
  }, []);
  
  // Panel styles
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: isOpen ? '50px' : '-500px',
    right: '10px',
    width: '400px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#fff',
    transition: 'top 0.3s ease',
    zIndex: 9998,
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    fontFamily: 'monospace',
    fontSize: '12px'
  };
  
  const toggleButtonStyle: React.CSSProperties = {
    position: 'fixed',
    top: '10px',
    right: '10px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    zIndex: 9999
  };
  
  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    margin: '0 4px'
  };
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online':
      case 'success':
      case 'connected':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'offline':
        return '#ff9800';
      case 'pending':
        return '#2196f3';
      default:
        return '#aaa';
    }
  };
  
  return (
    <>
      <button style={toggleButtonStyle} onClick={togglePanel}>
        {isOpen ? 'Hide Network Monitor' : 'Show Network Monitor'}
      </button>
      
      <div style={panelStyle}>
        <div style={{ padding: '10px', borderBottom: '1px solid #444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#4caf50' }}>Network Monitor</h3>
            <div>
              <button 
                style={buttonStyle} 
                onClick={checkAll}
                disabled={isChecking}
              >
                {isChecking ? 'Checking...' : 'Check All'}
              </button>
              <button 
                style={{ 
                  ...buttonStyle, 
                  backgroundColor: autoRefresh ? '#f44336' : '#4caf50' 
                }} 
                onClick={toggleAutoRefresh}
              >
                {autoRefresh ? 'Stop Auto' : 'Auto (5s)'}
              </button>
              <button style={{ ...buttonStyle, backgroundColor: '#2196f3' }} onClick={addEndpoint}>
                Add Endpoint
              </button>
            </div>
          </div>
        </div>
        
        <div style={{ padding: '10px' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#4caf50' }}>API Status</h4>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <div 
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: getStatusColor(status.api.status),
                marginRight: '5px'
              }} 
            />
            <div>
              <strong>Status:</strong> {status.api.status.toUpperCase()}
              {status.api.latency !== null && ` (${status.api.latency.toFixed(0)}ms)`}
            </div>
          </div>
          {status.api.errorMessage && (
            <div style={{ color: '#f44336', marginBottom: '10px' }}>
              Error: {status.api.errorMessage}
            </div>
          )}
          {status.api.lastChecked && (
            <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '10px' }}>
              Last checked: {status.api.lastChecked.toLocaleTimeString()}
            </div>
          )}
          
          <h4 style={{ margin: '10px 0 5px 0', color: '#4caf50' }}>WebSocket Status</h4>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div 
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: getStatusColor(ws.isConnected ? 'connected' : 'offline'),
                marginRight: '5px'
              }} 
            />
            <div>
              <strong>Status:</strong> {ws.status}
            </div>
          </div>
          <div style={{ marginBottom: '5px' }}>
            <strong>Client ID:</strong> {ws.clientId || 'Not connected'}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Subscriptions:</strong> {ws.subscriptions.length > 0 ? ws.subscriptions.join(', ') : 'None'}
          </div>
          <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <button 
              style={buttonStyle} 
              onClick={() => ws.connect()}
              disabled={ws.isConnected}
            >
              Connect
            </button>
            <button 
              style={{ ...buttonStyle, backgroundColor: '#f44336' }} 
              onClick={() => ws.disconnect()}
              disabled={!ws.isConnected}
            >
              Disconnect
            </button>
            {ws.isConnected && (
              <button 
                style={{ ...buttonStyle, backgroundColor: '#2196f3' }} 
                onClick={() => {
                  const channel = prompt('Enter channel to subscribe to:');
                  if (channel) ws.subscribe(channel);
                }}
              >
                Subscribe
              </button>
            )}
          </div>
          
          <h4 style={{ margin: '10px 0 5px 0', color: '#4caf50' }}>Custom Endpoints</h4>
          {Object.keys(status.endpoints).length === 0 ? (
            <div style={{ color: '#aaa', marginBottom: '10px' }}>
              No custom endpoints added. Click "Add Endpoint" to add one.
            </div>
          ) : (
            <div style={{ marginBottom: '10px' }}>
              {Object.entries(status.endpoints).map(([url, endpointStatus]) => (
                <div key={url} style={{ marginBottom: '10px', padding: '5px', backgroundColor: 'rgba(30, 30, 30, 0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ wordBreak: 'break-all' }}>{url}</div>
                    <button 
                      style={{ 
                        backgroundColor: 'transparent', 
                        color: '#f44336', 
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }} 
                      onClick={() => removeEndpoint(url)}
                    >
                      ×
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                    <div 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: getStatusColor(endpointStatus.status),
                        marginRight: '5px'
                      }} 
                    />
                    <div>
                      <strong>Status:</strong> {endpointStatus.status.toUpperCase()}
                      {endpointStatus.statusCode && ` (${endpointStatus.statusCode})`}
                      {endpointStatus.latency !== null && ` ${endpointStatus.latency.toFixed(0)}ms`}
                    </div>
                  </div>
                  {endpointStatus.errorMessage && (
                    <div style={{ color: '#f44336', marginTop: '5px', fontSize: '11px' }}>
                      {endpointStatus.errorMessage}
                    </div>
                  )}
                  {endpointStatus.lastChecked && (
                    <div style={{ fontSize: '10px', color: '#aaa', marginTop: '5px' }}>
                      Last checked: {endpointStatus.lastChecked.toLocaleTimeString()}
                    </div>
                  )}
                  <button 
                    style={{ ...buttonStyle, marginTop: '5px', padding: '2px 5px' }} 
                    onClick={() => checkEndpoint(url)}
                  >
                    Check
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ padding: '8px', borderTop: '1px solid #444', fontSize: '10px', color: '#aaa' }}>
          Network Monitor v1.0 | Click "Add Endpoint" to test specific API endpoints
        </div>
      </div>
    </>
  );
};

export default NetworkMonitor;
