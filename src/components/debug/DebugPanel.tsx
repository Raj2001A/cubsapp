import React, { useState, useEffect, useCallback } from 'react';
import { DebugLevel, getDebugStats, setDebugLevel, configureDebug, resetDebugStats } from '../../utils/debugTools';

interface DebugPanelProps {
  initiallyOpen?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [stats, setStats] = useState(getDebugStats());
  const [activeTab, setActiveTab] = useState<'general' | 'components' | 'network' | 'config'>('general');
  const [refreshInterval, setRefreshInterval] = useState<number | null>(1000);

  // Refresh stats
  const refreshStats = useCallback(() => {
    setStats(getDebugStats());
  }, []);

  // Toggle debug panel
  const togglePanel = () => {
    setIsOpen(prev => !prev);
  };

  // Set debug level
  const handleSetDebugLevel = (level: DebugLevel) => {
    setDebugLevel(level);
    refreshStats();
  };

  // Toggle debug option
  const toggleOption = (option: string) => {
    configureDebug({
      [option]: !(stats.config as any)[option]
    });
    refreshStats();
  };

  // Reset stats
  const handleReset = () => {
    resetDebugStats();
    refreshStats();
  };

  // Toggle refresh interval
  const toggleRefresh = () => {
    setRefreshInterval(prev => prev ? null : 1000);
  };

  // Auto-refresh on interval
  useEffect(() => {
    if (!refreshInterval) return;

    const intervalId = setInterval(refreshStats, refreshInterval);
    return () => clearInterval(intervalId);
  }, [refreshInterval, refreshStats]);

  // Panel styles
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: isOpen ? '0' : '-500px',
    right: '0',
    width: '400px',
    height: '400px',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    color: '#fff',
    transition: 'bottom 0.3s ease',
    zIndex: 9999,
    borderTopLeftRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'monospace',
    fontSize: '12px'
  };

  const tabStyle: React.CSSProperties = {
    padding: '8px 12px',
    cursor: 'pointer',
    backgroundColor: 'rgba(30, 30, 30, 0.7)',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    marginRight: '2px'
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    backgroundColor: 'rgba(60, 60, 60, 0.9)',
    borderBottom: '2px solid #4caf50'
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

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-30px',
    right: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    border: 'none',
    padding: '5px 10px',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px'
  };

  return (
    <>
      <button style={toggleButtonStyle} onClick={togglePanel}>
        {isOpen ? 'Hide Debug' : 'Show Debug'}
      </button>
      <div style={panelStyle}>
        <div style={{ display: 'flex', borderBottom: '1px solid #444', padding: '8px' }}>
          <div 
            style={activeTab === 'general' ? activeTabStyle : tabStyle} 
            onClick={() => setActiveTab('general')}
          >
            General
          </div>
          <div 
            style={activeTab === 'components' ? activeTabStyle : tabStyle} 
            onClick={() => setActiveTab('components')}
          >
            Components
          </div>
          <div 
            style={activeTab === 'network' ? activeTabStyle : tabStyle} 
            onClick={() => setActiveTab('network')}
          >
            Network
          </div>
          <div 
            style={activeTab === 'config' ? activeTabStyle : tabStyle} 
            onClick={() => setActiveTab('config')}
          >
            Config
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button style={buttonStyle} onClick={refreshStats}>
              Refresh
            </button>
            <button 
              style={{ ...buttonStyle, backgroundColor: refreshInterval ? '#f44336' : '#4caf50' }} 
              onClick={toggleRefresh}
            >
              {refreshInterval ? 'Stop Auto' : 'Auto'}
            </button>
            <button style={{ ...buttonStyle, backgroundColor: '#f44336' }} onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
        
        <div style={{ flex: 1, overflow: 'auto', padding: '10px' }}>
          {activeTab === 'general' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>General Stats</h3>
              <div>Debug Level: {stats.debugLevel}</div>
              <div>Memory: {typeof stats.memory === 'string' ? stats.memory : JSON.stringify(stats.memory || {})}</div>
              <div>Pending Requests: {stats.pendingRequests}</div>
              
              <h4 style={{ margin: '10px 0', color: '#4caf50' }}>Debug Level</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Object.entries(DebugLevel)
                  .filter(([key]) => isNaN(Number(key)))
                  .map(([key, value]) => (
                    <button 
                      key={key}
                      style={{
                        ...buttonStyle,
                        backgroundColor: stats.debugLevel === key ? '#4caf50' : '#555'
                      }}
                      onClick={() => handleSetDebugLevel(value as unknown as DebugLevel)}
                    >
                      {key}
                    </button>
                  ))
                }
              </div>
            </div>
          )}
          
          {activeTab === 'components' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>Component Renders</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '5px', borderBottom: '1px solid #444' }}>Component</th>
                    <th style={{ textAlign: 'right', padding: '5px', borderBottom: '1px solid #444' }}>Renders</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(stats.componentRenders || {}).map(([component, count]) => (
                    <tr key={component}>
                      <td style={{ padding: '5px', borderBottom: '1px solid #333' }}>{component}</td>
                      <td style={{ 
                        textAlign: 'right', 
                        padding: '5px', 
                        borderBottom: '1px solid #333',
                        color: (count as number) > 20 ? '#ff5252' : (count as number) > 10 ? '#ffab40' : 'inherit'
                      }}>
                        {String(count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'network' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>Network</h3>
              <div>Pending Requests: {stats.pendingRequests}</div>
              <p style={{ color: '#aaa' }}>
                Network details are logged to the console when the logNetworkRequests option is enabled.
              </p>
            </div>
          )}
          
          {activeTab === 'config' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>Debug Configuration</h3>
              {Object.entries(stats.config || {}).map(([option, value]) => (
                <div key={option} style={{ margin: '5px 0', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    id={option} 
                    checked={value as boolean} 
                    onChange={() => toggleOption(option)}
                  />
                  <label htmlFor={option} style={{ marginLeft: '5px' }}>{option}</label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ padding: '8px', borderTop: '1px solid #444', fontSize: '10px', color: '#aaa' }}>
          Debug Panel v1.0 | Press F12 for more details | Access via window.__DEBUG__ in console
        </div>
      </div>
    </>
  );
};

export default DebugPanel;
