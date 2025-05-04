/**
 * Request Queue Manager
 * 
 * Manages concurrent API requests to prevent overwhelming the backend
 * and provides mechanisms to prioritize, throttle, and batch requests.
 */

import logger from './logger';

// Request priority levels
export enum RequestPriority {
  HIGH = 0,
  NORMAL = 1,
  LOW = 2
}

// Request status
export enum RequestStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Request interface
export interface QueuedRequest<T = any> {
  id: string;
  url: string;
  method: string;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  maxRetries: number;
  execute: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: any) => void;
  abortController: AbortController;
  timeout?: number;
  timeoutId?: NodeJS.Timeout;
  tags: string[];
}

// Queue configuration
interface QueueConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  defaultTimeout: number;
  priorityBoostInterval: number;
  retryDelayMs: number;
  maxRetries: number;
  batchingEnabled: boolean;
  batchingWindow: number;
  throttleWindow: number;
  throttleLimit: number;
}

// Default configuration
const DEFAULT_CONFIG: QueueConfig = {
  maxConcurrent: 6, // Maximum number of concurrent requests
  maxQueueSize: 100, // Maximum queue size
  defaultTimeout: 30000, // Default timeout in ms (30 seconds)
  priorityBoostInterval: 10000, // Boost priority of waiting requests every 10 seconds
  retryDelayMs: 1000, // Base delay for retries
  maxRetries: 3, // Maximum number of retries
  batchingEnabled: true, // Enable request batching
  batchingWindow: 50, // Batching window in ms
  throttleWindow: 1000, // Throttle window in ms
  throttleLimit: 20 // Maximum requests per throttle window
};

class RequestQueueManager {
  private queue: QueuedRequest[] = [];
  private running: Map<string, QueuedRequest> = new Map();
  private config: QueueConfig;
  private requestCounter = 0;
  private priorityBoostInterval?: NodeJS.Timeout;
  private throttleTimestamps: number[] = [];
  private batchGroups: Map<string, QueuedRequest[]> = new Map();
  private batchTimers: Map<string, NodeJS.Timeout> = new Map();
  private paused = false;
  private urlPatternThrottles: Map<string, { count: number, lastReset: number, limit: number, window: number }> = new Map();

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startPriorityBoost();
  }

  /**
   * Enqueue a request
   * @param options Request options
   * @returns Promise that resolves with the request result
   */
  public enqueue<T>(options: {
    url: string;
    method: string;
    execute: () => Promise<T>;
    priority?: RequestPriority;
    timeout?: number;
    maxRetries?: number;
    tags?: string[];
    batch?: boolean;
    batchKey?: string;
  }): Promise<T> {
    // Check if queue is paused
    if (this.paused) {
      return Promise.reject(new Error('Request queue is paused'));
    }

    // Check if we should throttle this request
    if (this.shouldThrottle(options.url)) {
      return Promise.reject(new Error('Request throttled'));
    }

    // Generate a unique ID for this request
    const id = `req_${++this.requestCounter}_${Date.now()}`;
    
    // Create abort controller for this request
    const abortController = new AbortController();
    
    // Create a promise that will be resolved when the request completes
    return new Promise<T>((resolve, reject) => {
      // Create the request object
      const request: QueuedRequest<T> = {
        id,
        url: options.url,
        method: options.method,
        priority: options.priority ?? RequestPriority.NORMAL,
        status: RequestStatus.PENDING,
        createdAt: Date.now(),
        retryCount: 0,
        maxRetries: options.maxRetries ?? this.config.maxRetries,
        execute: options.execute,
        resolve,
        reject,
        abortController,
        timeout: options.timeout ?? this.config.defaultTimeout,
        tags: options.tags ?? []
      };

      // Check if we should batch this request
      if (this.config.batchingEnabled && options.batch !== false && options.batchKey) {
        this.addToBatch(request, options.batchKey);
        return;
      }

      // Check if queue is full
      if (this.queue.length >= this.config.maxQueueSize) {
        // If queue is full, reject low priority requests
        if (request.priority === RequestPriority.LOW) {
          reject(new Error('Queue is full, low priority request rejected'));
          return;
        }
        
        // Otherwise, remove the lowest priority request to make room
        const lowestPriorityIndex = this.findLowestPriorityIndex();
        if (lowestPriorityIndex !== -1) {
          const removedRequest = this.queue.splice(lowestPriorityIndex, 1)[0];
          removedRequest.status = RequestStatus.CANCELLED;
          removedRequest.reject(new Error('Request cancelled due to queue overflow'));
          logger.warn('Request cancelled due to queue overflow', { 
            requestId: removedRequest.id,
            url: removedRequest.url
          });
        }
      }

      // Add to queue
      this.queue.push(request);
      logger.debug('Request enqueued', { 
        requestId: id,
        url: options.url,
        method: options.method,
        priority: options.priority ?? RequestPriority.NORMAL,
        queueLength: this.queue.length,
        runningCount: this.running.size
      });

      // Process queue
      this.processQueue();
    });
  }

  /**
   * Add a request to a batch
   * @param request Request to add
   * @param batchKey Batch key
   */
  private addToBatch<T>(request: QueuedRequest<T>, batchKey: string): void {
    // Get or create batch group
    if (!this.batchGroups.has(batchKey)) {
      this.batchGroups.set(batchKey, []);
      
      // Set timer to process this batch
      this.batchTimers.set(batchKey, setTimeout(() => {
        this.processBatch(batchKey);
      }, this.config.batchingWindow));
    }
    
    // Add request to batch
    this.batchGroups.get(batchKey)!.push(request);
    
    logger.debug('Request added to batch', { 
      requestId: request.id,
      batchKey,
      batchSize: this.batchGroups.get(batchKey)!.length
    });
  }

  /**
   * Process a batch of requests
   * @param batchKey Batch key
   */
  private processBatch(batchKey: string): void {
    // Get batch group
    const batch = this.batchGroups.get(batchKey);
    if (!batch || batch.length === 0) {
      return;
    }
    
    // Clear batch timer
    clearTimeout(this.batchTimers.get(batchKey)!);
    this.batchTimers.delete(batchKey);
    
    // Remove batch from groups
    this.batchGroups.delete(batchKey);
    
    // Add all requests to queue
    this.queue.push(...batch);
    
    logger.debug('Batch processed', { 
      batchKey,
      batchSize: batch.length,
      queueLength: this.queue.length
    });
    
    // Process queue
    this.processQueue();
  }

  /**
   * Process the queue
   */
  private processQueue(): void {
    // If queue is paused, don't process
    if (this.paused) {
      return;
    }
    
    // Check if we can run more requests
    while (this.running.size < this.config.maxConcurrent && this.queue.length > 0) {
      // Sort queue by priority
      this.queue.sort((a, b) => a.priority - b.priority);
      
      // Get next request
      const request = this.queue.shift();
      if (!request) {
        break;
      }
      
      // Execute request
      this.executeRequest(request);
    }
  }

  /**
   * Execute a request
   * @param request Request to execute
   */
  private executeRequest<T>(request: QueuedRequest<T>): void {
    // Update request status
    request.status = RequestStatus.RUNNING;
    request.startedAt = Date.now();
    
    // Add to running map
    this.running.set(request.id, request);
    
    // Add to throttle timestamps
    this.throttleTimestamps.push(Date.now());
    
    // Update URL pattern throttle
    this.updateUrlPatternThrottle(request.url);
    
    // Set timeout
    if (request.timeout) {
      request.timeoutId = setTimeout(() => {
        // Abort the request
        request.abortController.abort();
        
        // Remove from running
        this.running.delete(request.id);
        
        // Update status
        request.status = RequestStatus.FAILED;
        
        // Reject with timeout error
        const timeoutError = new Error(`Request timed out after ${request.timeout}ms`);
        request.reject(timeoutError);
        
        logger.warn('Request timed out', { 
          requestId: request.id,
          url: request.url,
          timeout: request.timeout
        });
        
        // Process queue
        this.processQueue();
      }, request.timeout);
    }
    
    logger.debug('Executing request', { 
      requestId: request.id,
      url: request.url,
      method: request.method,
      runningCount: this.running.size
    });
    
    // Execute the request
    request.execute()
      .then(result => {
        // Clear timeout
        if (request.timeoutId) {
          clearTimeout(request.timeoutId);
        }
        
        // Remove from running
        this.running.delete(request.id);
        
        // Update status
        request.status = RequestStatus.COMPLETED;
        request.completedAt = Date.now();
        
        // Resolve with result
        request.resolve(result);
        
        logger.debug('Request completed', { 
          requestId: request.id,
          url: request.url,
          duration: request.completedAt - (request.startedAt ?? request.createdAt)
        });
        
        // Process queue
        this.processQueue();
      })
      .catch(error => {
        // Clear timeout
        if (request.timeoutId) {
          clearTimeout(request.timeoutId);
        }
        
        // Remove from running
        this.running.delete(request.id);
        
        // Check if we should retry
        if (this.shouldRetry(request, error)) {
          // Increment retry count
          request.retryCount++;
          
          // Calculate retry delay with exponential backoff
          const delay = this.calculateRetryDelay(request.retryCount);
          
          // Update status
          request.status = RequestStatus.PENDING;
          
          logger.debug('Retrying request', { 
            requestId: request.id,
            url: request.url,
            retryCount: request.retryCount,
            delay
          });
          
          // Add back to queue after delay
          setTimeout(() => {
            this.queue.push(request);
            this.processQueue();
          }, delay);
        } else {
          // Update status
          request.status = RequestStatus.FAILED;
          
          // Reject with error
          request.reject(error);
          
          logger.warn('Request failed', { 
            requestId: request.id,
            url: request.url,
            error: error instanceof Error ? error.message : String(error)
          });
          
          // Process queue
          this.processQueue();
        }
      });
  }

  /**
   * Check if we should retry a request
   * @param request Request to check
   * @param error Error that occurred
   * @returns True if we should retry
   */
  private shouldRetry<T>(request: QueuedRequest<T>, error: any): boolean {
    // Don't retry if we've reached max retries
    if (request.retryCount >= request.maxRetries) {
      return false;
    }
    
    // Don't retry if request was aborted
    if (error && error.name === 'AbortError') {
      return false;
    }
    
    // Don't retry client errors (4xx)
    if (error && error.status && error.status >= 400 && error.status < 500) {
      return false;
    }
    
    // Retry server errors (5xx) and network errors
    return true;
  }

  /**
   * Calculate retry delay with exponential backoff
   * @param retryCount Retry count
   * @returns Delay in ms
   */
  private calculateRetryDelay(retryCount: number): number {
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.3 + 0.85; // 0.85-1.15
    return Math.min(
      this.config.retryDelayMs * Math.pow(2, retryCount) * jitter,
      30000 // Cap at 30 seconds
    );
  }

  /**
   * Find the index of the lowest priority request in the queue
   * @returns Index of the lowest priority request, or -1 if queue is empty
   */
  private findLowestPriorityIndex(): number {
    if (this.queue.length === 0) {
      return -1;
    }
    
    let lowestPriorityIndex = 0;
    let lowestPriority = this.queue[0].priority;
    
    for (let i = 1; i < this.queue.length; i++) {
      if (this.queue[i].priority > lowestPriority) {
        lowestPriorityIndex = i;
        lowestPriority = this.queue[i].priority;
      }
    }
    
    return lowestPriorityIndex;
  }

  /**
   * Start priority boost interval
   */
  private startPriorityBoost(): void {
    this.priorityBoostInterval = setInterval(() => {
      // Boost priority of waiting requests
      for (const request of this.queue) {
        // Only boost if not already highest priority
        if (request.priority > RequestPriority.HIGH) {
          request.priority--;
          logger.debug('Boosted request priority', { 
            requestId: request.id,
            newPriority: request.priority
          });
        }
      }
    }, this.config.priorityBoostInterval);
  }

  /**
   * Check if we should throttle a request
   * @param url URL to check
   * @returns True if request should be throttled
   */
  private shouldThrottle(url: string): boolean {
    // Clean up old timestamps
    const now = Date.now();
    this.throttleTimestamps = this.throttleTimestamps.filter(
      timestamp => now - timestamp < this.config.throttleWindow
    );
    
    // Check global throttle
    if (this.throttleTimestamps.length >= this.config.throttleLimit) {
      logger.warn('Request throttled (global limit)', { 
        url,
        currentCount: this.throttleTimestamps.length,
        limit: this.config.throttleLimit
      });
      return true;
    }
    
    // Check URL pattern throttles
    for (const [pattern, throttle] of this.urlPatternThrottles.entries()) {
      // Reset throttle if window has passed
      if (now - throttle.lastReset > throttle.window) {
        throttle.count = 0;
        throttle.lastReset = now;
      }
      
      // Check if URL matches pattern
      if (this.urlMatchesPattern(url, pattern)) {
        // Check if we've reached the limit
        if (throttle.count >= throttle.limit) {
          logger.warn('Request throttled (pattern limit)', { 
            url,
            pattern,
            currentCount: throttle.count,
            limit: throttle.limit
          });
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Update URL pattern throttle
   * @param url URL to update
   */
  private updateUrlPatternThrottle(url: string): void {
    const now = Date.now();
    
    for (const [pattern, throttle] of this.urlPatternThrottles.entries()) {
      // Reset throttle if window has passed
      if (now - throttle.lastReset > throttle.window) {
        throttle.count = 0;
        throttle.lastReset = now;
      }
      
      // Check if URL matches pattern
      if (this.urlMatchesPattern(url, pattern)) {
        // Increment count
        throttle.count++;
      }
    }
  }

  /**
   * Check if URL matches pattern
   * @param url URL to check
   * @param pattern Pattern to match
   * @returns True if URL matches pattern
   */
  private urlMatchesPattern(url: string, pattern: string): boolean {
    // Simple wildcard matching
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(url);
  }

  /**
   * Add a URL pattern throttle
   * @param pattern URL pattern to throttle
   * @param limit Maximum requests per window
   * @param window Window in ms
   */
  public addUrlPatternThrottle(pattern: string, limit: number, window: number = this.config.throttleWindow): void {
    this.urlPatternThrottles.set(pattern, {
      count: 0,
      lastReset: Date.now(),
      limit,
      window
    });
    
    logger.debug('Added URL pattern throttle', { pattern, limit, window });
  }

  /**
   * Remove a URL pattern throttle
   * @param pattern URL pattern to remove
   */
  public removeUrlPatternThrottle(pattern: string): void {
    this.urlPatternThrottles.delete(pattern);
    logger.debug('Removed URL pattern throttle', { pattern });
  }

  /**
   * Pause the queue
   */
  public pause(): void {
    this.paused = true;
    logger.info('Request queue paused');
  }

  /**
   * Resume the queue
   */
  public resume(): void {
    this.paused = false;
    logger.info('Request queue resumed');
    this.processQueue();
  }

  /**
   * Cancel all requests with the given tag
   * @param tag Tag to cancel
   */
  public cancelByTag(tag: string): void {
    // Cancel queued requests
    const cancelledQueue = this.queue.filter(request => request.tags.includes(tag));
    this.queue = this.queue.filter(request => !request.tags.includes(tag));
    
    // Cancel running requests
    const cancelledRunning: QueuedRequest[] = [];
    for (const [id, request] of this.running.entries()) {
      if (request.tags.includes(tag)) {
        // Abort the request
        request.abortController.abort();
        
        // Remove from running
        this.running.delete(id);
        
        cancelledRunning.push(request);
      }
    }
    
    // Reject all cancelled requests
    [...cancelledQueue, ...cancelledRunning].forEach(request => {
      request.status = RequestStatus.CANCELLED;
      request.reject(new Error(`Request cancelled by tag: ${tag}`));
    });
    
    logger.info('Cancelled requests by tag', { 
      tag,
      queuedCount: cancelledQueue.length,
      runningCount: cancelledRunning.length
    });
    
    // Process queue
    this.processQueue();
  }

  /**
   * Get queue statistics
   * @returns Queue statistics
   */
  public getStats(): {
    queueLength: number;
    runningCount: number;
    batchCount: number;
    paused: boolean;
    throttleCount: number;
  } {
    return {
      queueLength: this.queue.length,
      runningCount: this.running.size,
      batchCount: this.batchGroups.size,
      paused: this.paused,
      throttleCount: this.throttleTimestamps.length
    };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    // Clear intervals
    if (this.priorityBoostInterval) {
      clearInterval(this.priorityBoostInterval);
    }
    
    // Clear batch timers
    for (const timer of this.batchTimers.values()) {
      clearTimeout(timer);
    }
    
    // Cancel all requests
    [...this.queue, ...Array.from(this.running.values())].forEach(request => {
      if (request.timeoutId) {
        clearTimeout(request.timeoutId);
      }
      
      request.status = RequestStatus.CANCELLED;
      request.reject(new Error('Request cancelled due to queue disposal'));
    });
    
    // Clear collections
    this.queue = [];
    this.running.clear();
    this.batchGroups.clear();
    this.batchTimers.clear();
    this.throttleTimestamps = [];
    this.urlPatternThrottles.clear();
    
    logger.info('Request queue disposed');
  }
}

// Create singleton instance
const requestQueueManager = new RequestQueueManager();

// Add some common URL pattern throttles
requestQueueManager.addUrlPatternThrottle('/api/employees*', 10, 1000); // 10 requests per second
requestQueueManager.addUrlPatternThrottle('/api/documents*', 10, 1000); // 10 requests per second
requestQueueManager.addUrlPatternThrottle('/api/search*', 5, 1000); // 5 requests per second

export default requestQueueManager;
