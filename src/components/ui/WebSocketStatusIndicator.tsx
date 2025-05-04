import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../context/WebSocketContext';
import { ConnectionStatus } from '../../services/websocketService';

const statusConfig = {
  [ConnectionStatus.CONNECTED]: {
    color: '#22c55e',
    label: 'Connected'
  },
  [ConnectionStatus.CONNECTING]: {
    color: '#fbbf24',
    label: 'Connecting'
  },
  [ConnectionStatus.RECONNECTING]: {
    color: '#fbbf24',
    label: 'Reconnecting'
  },
  [ConnectionStatus.DISCONNECTED]: {
    color: '#ef4444',
    label: 'Disconnected'
  },
  [ConnectionStatus.ERROR]: {
    color: '#ef4444',
    label: 'Error'
  }
};

const WebSocketStatusIndicator: React.FC = () => {
  const { status } = useWebSocket();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    if (status === ConnectionStatus.CONNECTED) {
      // Optionally auto-hide after a few seconds when connected
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!visible && status === ConnectionStatus.CONNECTED) return null;

  const config = statusConfig[status] || statusConfig[ConnectionStatus.DISCONNECTED];

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      zIndex: 9999,
      background: '#fff',
      border: `2px solid ${config.color}`,
      color: config.color,
      borderRadius: 8,
      padding: '8px 18px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      fontWeight: 600,
      fontSize: 15,
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }}>
      <span style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: config.color,
        marginRight: 8
      }}></span>
      {config.label}
    </div>
  );
};

export default WebSocketStatusIndicator;
