/**
 * WebSocket Context
 * 
 * Provides WebSocket functionality to React components
 * Handles connection management, reconnection, and message routing
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import websocketClient, { ConnectionStatus, WebSocketMessage } from '../services/websocketService';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import { ErrorSeverity } from './UIContext';
import { OperationType } from '../types/ui';
import logger from '../utils/logger';

// WebSocket context interface
interface WebSocketContextType {
  status: ConnectionStatus;
  connect: () => Promise<boolean>;
  disconnect: () => void;
  subscribe: (channel: string) => Promise<boolean>;
  unsubscribe: (channel: string) => Promise<boolean>;
  send: (message: WebSocketMessage) => void;
  sendWithResponse: (message: WebSocketMessage, timeout?: number) => Promise<WebSocketMessage>;
  addMessageHandler: (type: string, handler: (message: WebSocketMessage) => void) => () => void;
  isConnected: boolean;
  clientId: string | null;
  subscriptions: string[];
}

// Create context with default values
const WebSocketContext = createContext<WebSocketContextType>({
  status: ConnectionStatus.DISCONNECTED,
  connect: async () => false,
  disconnect: () => {},
  subscribe: async () => false,
  unsubscribe: async () => false,
  send: () => {},
  sendWithResponse: async () => ({ type: 'error' }),
  addMessageHandler: () => () => {},
  isConnected: false,
  clientId: null,
  subscriptions: [],
});

// WebSocket provider props
interface WebSocketProviderProps {
  children: React.ReactNode;
  autoConnect?: boolean;
}

// WebSocket provider component
export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  autoConnect = true 
}) => {
  // Get auth context
  const { isAuthenticated, user } = useAuth();
  
  // Get UI context for showing errors
  const { addError, showToast } = useUI();
  
  // WebSocket state
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [clientId, setClientId] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  
  // Derived state
  const isConnected = status === ConnectionStatus.CONNECTED;

  // Connect to WebSocket server
  const connect = useCallback(async () => {
    try {
      const success = await websocketClient.connect();
      return success;
    } catch (error) {
      logger.error('Error connecting to WebSocket server', {
        error: error instanceof Error ? error.message : String(error)
      });
      
      // Show error in UI
      addError(
        'WebSocket Connection Error',
        ErrorSeverity.WARNING,
        OperationType.WEBSOCKET,
        'Failed to connect to real-time updates server. Some features may not work correctly.'
      );
      
      return false;
    }
  }, [addError]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    websocketClient.disconnect();
  }, []);

  // Subscribe to a channel
  const subscribe = useCallback(async (channel: string) => {
    try {
      const success = await websocketClient.subscribe(channel);
      if (success) {
        setSubscriptions(prev => {
          if (prev.includes(channel)) return prev;
          return [...prev, channel];
        });
      }
      return success;
    } catch (error) {
      logger.error('Error subscribing to channel', {
        error: error instanceof Error ? error.message : String(error),
        channel
      });
      return false;
    }
  }, []);

  // Unsubscribe from a channel
  const unsubscribe = useCallback(async (channel: string) => {
    try {
      const success = await websocketClient.unsubscribe(channel);
      if (success) {
        setSubscriptions(prev => prev.filter(c => c !== channel));
      }
      return success;
    } catch (error) {
      logger.error('Error unsubscribing from channel', {
        error: error instanceof Error ? error.message : String(error),
        channel
      });
      return false;
    }
  }, []);

  // Send a message
  const send = useCallback((message: WebSocketMessage) => {
    websocketClient.send(message);
  }, []);

  // Send a message and wait for response
  const sendWithResponse = useCallback((message: WebSocketMessage, timeout?: number) => {
    return websocketClient.sendWithResponse(message, timeout);
  }, []);

  // Add a message handler
  const addMessageHandler = useCallback((type: string, handler: (message: WebSocketMessage) => void) => {
    return websocketClient.addMessageHandler(type, handler);
  }, []);

  // Set up status handler
  useEffect(() => {
    const removeHandler = websocketClient.addStatusHandler((newStatus) => {
      setStatus(newStatus);
      
      // Show toast for connection status changes
      if (newStatus === ConnectionStatus.CONNECTED) {
        showToast?.('Connected to real-time updates server', 'success');
      } else if (newStatus === ConnectionStatus.DISCONNECTED) {
        showToast?.('Disconnected from real-time updates server', 'info');
      } else if (newStatus === ConnectionStatus.ERROR) {
        showToast?.('Error connecting to real-time updates server', 'error');
      }
    });
    
    return removeHandler;
  }, [showToast]);

  // Set up connection message handler
  useEffect(() => {
    const removeHandler = websocketClient.addMessageHandler('connection', (message) => {
      if (
        message.data &&
        typeof message.data === 'object' &&
        'clientId' in message.data &&
        typeof (message.data as any).clientId === 'string'
      ) {
        setClientId((message.data as { clientId: string }).clientId);
      }
    });
    
    return removeHandler;
  }, []);

  // Set up database change handler
  useEffect(() => {
    const removeHandler = websocketClient.addMessageHandler('database_change', (message) => {
      if (
        message.data &&
        typeof message.data === 'object' &&
        'table' in message.data &&
        'action' in message.data
      ) {
        const { table, action } = message.data as { table: string; action: string };
        logger.debug('Database change notification received', { table, action });
        
        // Show toast for important changes
        if (table === 'employees' && action === 'create') {
          showToast?.('New employee added', 'info');
        } else if (table === 'documents' && action === 'create') {
          showToast?.('New document uploaded', 'info');
        }
      }
    });
    
    return removeHandler;
  }, [showToast]);

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated && autoConnect) {
      connect();
    }
    
    return () => {
      // Disconnect when component unmounts
      disconnect();
    };
  }, [isAuthenticated, autoConnect, connect, disconnect]);

  // Subscribe to user-specific channel when authenticated
  useEffect(() => {
    if (isConnected && isAuthenticated && user?.uid) {
      // Subscribe to user's channel
      subscribe(`user:${user.uid}`);
      
      // Subscribe to admin channels if user is admin
      if (user.role === 'Administrator') {
        subscribe('admin');
        subscribe('dashboard');
      }
    }
  }, [isConnected, isAuthenticated, user, subscribe]);

  // Update subscriptions when client reconnects
  useEffect(() => {
    if (isConnected) {
      // Update subscriptions state from client
      setSubscriptions(websocketClient.getSubscriptions());
      setClientId(websocketClient.getClientId());
    }
  }, [isConnected]);

  // Memoize the context value to prevent unnecessary re-renders and loops
  const contextValue = useMemo(() => ({
    status,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    sendWithResponse,
    addMessageHandler,
    isConnected,
    clientId,
    subscriptions,
  }), [
    status,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    sendWithResponse,
    addMessageHandler,
    isConnected,
    clientId,
    subscriptions
  ]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocket = () => useContext(WebSocketContext);

export default WebSocketContext;
