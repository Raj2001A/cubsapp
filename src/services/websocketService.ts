/**
 * WebSocket Service
 *
 * Provides real-time updates for the dashboard and other components
 * Handles reconnection, authentication, and message parsing
 */

import { getAuthToken, isAuthenticated as getIsAuthenticated } from './authService';
import logger from '../utils/logger';

// WebSocket message interface
export interface WebSocketMessage {
  type: string;
  action?: string;
  data?: unknown;
  channel?: string;
  requestId?: string;
}

// WebSocket connection status
export enum ConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// WebSocket client class
class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000; // Start with 1 second
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, Set<(message: WebSocketMessage) => void>> = new Map();
  private statusHandlers: Set<(status: ConnectionStatus) => void> = new Set();
  private pendingMessages: WebSocketMessage[] = [];
  private requestMap: Map<string, { resolve: Function, reject: Function, timeout: NodeJS.Timeout }> = new Map();
  private subscriptions: Set<string> = new Set();
  private clientId: string | null = null;

  constructor() {
    // Get WebSocket URL from environment or use default
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';
    // Listen for network recovery to auto-reconnect
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        if (
          this.status === ConnectionStatus.DISCONNECTED ||
          this.status === ConnectionStatus.ERROR
        ) {
          logger.info('[WebSocketClient] Network online, attempting to reconnect WebSocket...');
          this.connect();
        }
      });
    }
  }

  // Connect to WebSocket server
  public async connect(): Promise<boolean> {
    // If already connected or connecting, return
    if (this.status === ConnectionStatus.CONNECTED || this.status === ConnectionStatus.CONNECTING) {
      logger.debug('[WebSocketClient.connect] Already connected or connecting', { status: this.status });
      return true;
    }

    // Check authentication before attempting connection
    if (!getIsAuthenticated()) {
      logger.warn('[WebSocketClient.connect] WebSocket connection attempt blocked: user not authenticated.');
      this.setStatus(ConnectionStatus.DISCONNECTED);
      return false;
    }

    // Update status
    this.setStatus(ConnectionStatus.CONNECTING);

    try {
      // Get auth token
      const token = await getAuthToken();
      if (!token) {
        logger.error('[WebSocketClient.connect] Failed to get auth token for WebSocket connection. User may not be logged in.');
        this.setStatus(ConnectionStatus.ERROR);
        return false;
      }

      // Create WebSocket connection with token
      // First try the relative path for Vite proxy
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${this.url}?token=${token}`;
      logger.info('[WebSocketClient.connect] Connecting to WebSocket server at:', wsUrl);
      try {
        this.socket = new WebSocket(wsUrl);
      } catch (wsError) {
        // If that fails, try the fallback URL
        logger.warn('[WebSocketClient.connect] Failed to connect using relative path, trying fallback URL', wsError);
        const fallbackUrl = `ws://localhost:5002/ws?token=${token}`;
        this.socket = new WebSocket(fallbackUrl);
      }

      // Set up event handlers
      this.socket.onopen = this.handleOpen.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleClose.bind(this);
      this.socket.onerror = this.handleError.bind(this);

      return true;
    } catch (error: unknown) {
      logger.error('[WebSocketClient.connect] Error connecting to WebSocket server', {
        error: error instanceof Error ? error.message : String(error)
      });
      this.setStatus(ConnectionStatus.ERROR);
      return false;
    }
  }

  // Handle WebSocket open event
  private handleOpen(): void {
    logger.info('[WebSocketClient] WebSocket connection established');
    this.setStatus(ConnectionStatus.CONNECTED);
    this.reconnectAttempts = 0;

    // Start ping interval
    this.startPingInterval();

    // Send any pending messages
    this.sendPendingMessages();

    // Resubscribe to channels
    this.resubscribeToChannels();
  }

  // Handle WebSocket message event
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WebSocketMessage;

      // Handle connection message (first message after connection)
      if (message.type === 'connection' && typeof message.data === 'object' && message.data && 'clientId' in message.data) {
        // Type guard for clientId
        this.clientId = (message.data as { clientId: string }).clientId;
        logger.info('[WebSocketClient] WebSocket client ID received', { clientId: this.clientId });
      }

      // Handle pong message (response to ping)
      if (message.type === 'pong') {
        // Resolve pending request if exists
        this.resolveRequest(message.requestId, message);
        return;
      }

      // Handle error message
      if (message.type === 'error') {
        logger.warn('[WebSocketClient] WebSocket error message received', {
          code: typeof message.data === 'object' && message.data && 'code' in message.data ? (message.data as any).code : undefined,
          message: typeof message.data === 'object' && message.data && 'message' in message.data ? (message.data as any).message : undefined
        });

        // Reject pending request if exists
        if (message.requestId) {
          this.rejectRequest(
            message.requestId,
            new Error(
              typeof message.data === 'object' && message.data && 'message' in message.data ? (message.data as any).message : 'Unknown error'
            )
          );
        }
      }

      // Handle subscription confirmation
      if (message.type === 'subscribed' && message.channel) {
        logger.debug('[WebSocketClient] Subscribed to channel', { channel: message.channel });
        this.subscriptions.add(message.channel);

        // Resolve pending request if exists
        this.resolveRequest(message.requestId, message);
      }

      // Handle unsubscription confirmation
      if (message.type === 'unsubscribed' && message.channel) {
        logger.debug('[WebSocketClient] Unsubscribed from channel', { channel: message.channel });
        this.subscriptions.delete(message.channel);

        // Resolve pending request if exists
        this.resolveRequest(message.requestId, message);
      }

      // Notify all handlers for this message type
      const handlers = this.messageHandlers.get(message.type);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error: unknown) {
            logger.error('[WebSocketClient] Error in WebSocket message handler', {
              error: error instanceof Error ? error.message : String(error),
              messageType: message.type
            });
          }
        });
      }

      // Notify all handlers for 'all' message type
      const allHandlers = this.messageHandlers.get('all');
      if (allHandlers) {
        allHandlers.forEach(handler => {
          try {
            handler(message);
          } catch (error: unknown) {
            logger.error('[WebSocketClient] Error in WebSocket "all" message handler', {
              error: error instanceof Error ? error.message : String(error),
              messageType: message.type
            });
          }
        });
      }
    } catch (error: unknown) {
      logger.error('[WebSocketClient] Error parsing WebSocket message', {
        error: error instanceof Error ? error.message : String(error),
        data: typeof event.data === 'string' ? event.data.substring(0, 100) : 'Binary data'
      });
    }
  }

  // Handle WebSocket close event
  private handleClose(event: CloseEvent): void {
    logger.warn('[WebSocketClient] WebSocket connection closed', { code: event.code, reason: event.reason });
    this.setStatus(ConnectionStatus.DISCONNECTED);
    this.clearIntervals();
    // Schedule reconnect if not intentionally closed
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  // Handle WebSocket error event
  private handleError(): void {
    logger.error('[WebSocketClient] WebSocket encountered an error');
    this.setStatus(ConnectionStatus.ERROR);
    this.clearIntervals();
  }

  // Schedule reconnection attempt
  private scheduleReconnect(): void {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Check if we've exceeded max reconnect attempts
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('[WebSocketClient] Maximum WebSocket reconnect attempts reached');
      this.setStatus(ConnectionStatus.ERROR);
      return;
    }

    // Increment reconnect attempts
    this.reconnectAttempts++;

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );

    logger.info('[WebSocketClient] Scheduling WebSocket reconnect', {
      attempt: this.reconnectAttempts,
      delay: Math.round(delay)
    });

    // Update status
    this.setStatus(ConnectionStatus.RECONNECTING);

    // Schedule reconnect
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Start ping interval
  private startPingInterval(): void {
    // Clear any existing interval
    this.clearIntervals();

    // Start new interval
    this.pingInterval = setInterval(() => {
      this.ping();
    }, 30000); // 30 seconds
  }

  // Clear all intervals
  private clearIntervals(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Send ping message
  private ping(): void {
    const requestId = this.generateRequestId();
    this.send({
      type: 'ping',
      requestId
    });
  }

  // Send message to server
  public send(message: WebSocketMessage): void {
    // If not connected, queue message
    if (this.status !== ConnectionStatus.CONNECTED || !this.socket) {
      this.pendingMessages.push(message);
      return;
    }

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error: unknown) {
      logger.error('[WebSocketClient] Error sending WebSocket message', {
        error: error instanceof Error ? error.message : String(error),
        messageType: message.type
      });

      // Queue message for retry
      this.pendingMessages.push(message);
    }
  }

  // Send pending messages
  private sendPendingMessages(): void {
    if (this.pendingMessages.length === 0) return;

    logger.debug('[WebSocketClient] Sending pending WebSocket messages', {
      count: this.pendingMessages.length
    });

    // Clone and clear pending messages
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];

    // Send each message
    messages.forEach(message => {
      this.send(message);
    });
  }

  // Resubscribe to channels
  private resubscribeToChannels(): void {
    if (this.subscriptions.size === 0) return;

    logger.debug('[WebSocketClient] Resubscribing to WebSocket channels', {
      channels: Array.from(this.subscriptions)
    });

    // Subscribe to each channel
    this.subscriptions.forEach(channel => {
      this.send({
        type: 'subscribe',
        channel
      });
    });
  }

  // Subscribe to a channel
  public async subscribe(channel: string): Promise<boolean> {
    // If already subscribed, return success
    if (this.subscriptions.has(channel)) {
      return true;
    }

    try {
      // Send subscription request
      const requestId = this.generateRequestId();
      const response = await this.sendWithResponse({
        type: 'subscribe',
        channel,
        requestId
      });

      // Check response
      if (response.type === 'subscribed' && response.channel === channel) {
        this.subscriptions.add(channel);
        return true;
      }

      return false;
    } catch (error: unknown) {
      logger.error('[WebSocketClient] Error subscribing to channel', {
        error: error instanceof Error ? error.message : String(error),
        channel
      });
      return false;
    }
  }

  // Unsubscribe from a channel
  public async unsubscribe(channel: string): Promise<boolean> {
    // If not subscribed, return success
    if (!this.subscriptions.has(channel)) {
      return true;
    }

    try {
      // Send unsubscription request
      const requestId = this.generateRequestId();
      const response = await this.sendWithResponse({
        type: 'unsubscribe',
        channel,
        requestId
      });

      // Check response
      if (response.type === 'unsubscribed' && response.channel === channel) {
        this.subscriptions.delete(channel);
        return true;
      }

      return false;
    } catch (error: unknown) {
      logger.error('[WebSocketClient] Error unsubscribing from channel', {
        error: error instanceof Error ? error.message : String(error),
        channel
      });
      return false;
    }
  }

  // Send message and wait for response
  public sendWithResponse(message: WebSocketMessage, timeout: number = 10000): Promise<WebSocketMessage> {
    return new Promise((resolve, reject) => {
      // Ensure message has a request ID
      if (!message.requestId) {
        message.requestId = this.generateRequestId();
      }

      // Set up timeout
      const timeoutId = setTimeout(() => {
        this.rejectRequest(message.requestId!, new Error('WebSocket request timed out'));
      }, timeout);

      // Store request callbacks
      this.requestMap.set(message.requestId!, {
        resolve,
        reject,
        timeout: timeoutId
      });

      // Send message
      this.send(message);
    });
  }

  // Resolve a pending request
  private resolveRequest(requestId: string | undefined, response: WebSocketMessage): void {
    if (!requestId) return;

    const request = this.requestMap.get(requestId);
    if (!request) return;

    // Clear timeout
    clearTimeout(request.timeout);

    // Remove from map
    this.requestMap.delete(requestId);

    // Resolve promise
    request.resolve(response);
  }

  // Reject a pending request
  private rejectRequest(requestId: string, error: unknown): void {
    const request = this.requestMap.get(requestId);
    if (!request) return;

    // Clear timeout
    clearTimeout(request.timeout);

    // Remove from map
    this.requestMap.delete(requestId);

    // Ensure error is an Error instance
    if (error instanceof Error) {
      request.reject(error);
    } else {
      request.reject(new Error(typeof error === 'string' ? error : 'Unknown error'));
    }
  }

  // Generate a unique request ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Set connection status and notify handlers
  private setStatus(status: ConnectionStatus): void {
    // Only notify if status changed
    if (this.status === status) return;

    // Update status
    this.status = status;

    // Notify status handlers
    this.statusHandlers.forEach(handler => {
      try {
        handler(status);
      } catch (error: unknown) {
        logger.error('[WebSocketClient] Error in WebSocket status handler', {
          error: error instanceof Error ? error.message : String(error),
          status
        });
      }
    });
  }

  // Add message handler
  public addMessageHandler(type: string, handler: (message: WebSocketMessage) => void): () => void {
    // Get or create handlers set for this type
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }

    // Add handler
    this.messageHandlers.get(type)!.add(handler);

    // Return function to remove handler
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.messageHandlers.delete(type);
        }
      }
    };
  }

  // Add status handler
  public addStatusHandler(handler: (status: ConnectionStatus) => void): () => void {
    // Add handler
    this.statusHandlers.add(handler);

    // Return function to remove handler
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  // Get current connection status
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  // Get client ID
  public getClientId(): string | null {
    return this.clientId;
  }

  // Get subscribed channels
  public getSubscriptions(): string[] {
    return Array.from(this.subscriptions);
  }

  // Disconnect from server
  public disconnect(): void {
    // Clear intervals
    this.clearIntervals();

    // Close socket
    if (this.socket) {
      try {
        this.socket.close(1000, 'Client disconnected');
      } catch (error: unknown) {
        // Ignore errors during disconnect
      }
      this.socket = null;
    }

    // Update status
    this.setStatus(ConnectionStatus.DISCONNECTED);

    // Clear request map
    this.requestMap.forEach(request => {
      clearTimeout(request.timeout);
      request.reject(new Error('WebSocket disconnected'));
    });
    this.requestMap.clear();
  }

  // Request dashboard data
  public async getDashboardStats(): Promise<any> {
    try {
      // Ensure connected
      if (this.status !== ConnectionStatus.CONNECTED) {
        await this.connect();
      }

      // Subscribe to dashboard channel
      await this.subscribe('dashboard');

      // Request dashboard stats
      const response = await this.sendWithResponse({
        type: 'dashboard',
        action: 'get_stats',
        requestId: this.generateRequestId()
      });

      return response.data;
    } catch (error: unknown) {
      logger.error('[WebSocketClient] Error getting dashboard stats', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }
}

// Create singleton instance
const websocketClient = new WebSocketClient();

export default websocketClient;
