/**
 * Batch Request Utility
 * 
 * Combines multiple similar API requests into a single request to reduce load on the backend.
 * Particularly useful for fetching multiple items by ID.
 */

import logger from './logger';
import requestQueueManager from './requestQueueManager';

// Batch request configuration
interface BatchConfig {
  maxBatchSize: number;
  batchingWindow: number;
  retryIndividualOnFailure: boolean;
}

// Default configuration
const DEFAULT_CONFIG: BatchConfig = {
  maxBatchSize: 50, // Maximum number of items in a batch
  batchingWindow: 50, // Batching window in ms
  retryIndividualOnFailure: true // Retry individual items if batch fails
};

// Batch request state
interface BatchState<T, R> {
  items: T[];
  resolvers: ((result: R) => void)[];
  rejectors: ((error: any) => void)[];
  timer: NodeJS.Timeout | null;
  inProgress: boolean;
}

// Batch request manager
class BatchRequestManager {
  private batches: Map<string, BatchState<any, any>> = new Map();
  private config: BatchConfig;

  constructor(config: Partial<BatchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add an item to a batch
   * @param batchKey Unique key for the batch
   * @param item Item to add
   * @param batchFn Function to process the batch
   * @param itemResultFn Function to extract individual result from batch result
   * @returns Promise that resolves with the item result
   */
  public add<T, R, S>(
    batchKey: string,
    item: T,
    batchFn: (items: T[]) => Promise<R>,
    itemResultFn: (batchResult: R, item: T, index: number) => S
  ): Promise<S> {
    return new Promise<S>((resolve, reject) => {
      // Get or create batch
      if (!this.batches.has(batchKey)) {
        this.batches.set(batchKey, {
          items: [],
          resolvers: [],
          rejectors: [],
          timer: null,
          inProgress: false
        });
      }

      const batch = this.batches.get(batchKey)!;

      // Add item to batch
      batch.items.push(item);
      batch.resolvers.push(resolve as any);
      batch.rejectors.push(reject);

      logger.debug('Added item to batch', {
        batchKey,
        batchSize: batch.items.length,
        maxBatchSize: this.config.maxBatchSize
      });

      // If batch is already in progress, don't schedule another execution
      if (batch.inProgress) {
        return;
      }

      // If batch is full, process it immediately
      if (batch.items.length >= this.config.maxBatchSize) {
        // Clear any existing timer
        if (batch.timer) {
          clearTimeout(batch.timer);
          batch.timer = null;
        }

        // Process batch
        this.processBatch(batchKey, batchFn, itemResultFn);
        return;
      }

      // Otherwise, schedule batch processing
      if (batch.timer) {
        clearTimeout(batch.timer);
      }

      batch.timer = setTimeout(() => {
        this.processBatch(batchKey, batchFn, itemResultFn);
      }, this.config.batchingWindow);
    });
  }

  /**
   * Process a batch
   * @param batchKey Batch key
   * @param batchFn Function to process the batch
   * @param itemResultFn Function to extract individual result from batch result
   */
  private processBatch<T, R, S>(
    batchKey: string,
    batchFn: (items: T[]) => Promise<R>,
    itemResultFn: (batchResult: R, item: T, index: number) => S
  ): void {
    const batch = this.batches.get(batchKey);
    if (!batch || batch.items.length === 0) {
      return;
    }

    // Clear timer
    if (batch.timer) {
      clearTimeout(batch.timer);
      batch.timer = null;
    }

    // Mark batch as in progress
    batch.inProgress = true;

    // Take a snapshot of the current batch
    const items = [...batch.items];
    const resolvers = [...batch.resolvers];
    const rejectors = [...batch.rejectors];

    // Clear the batch for new items
    batch.items = [];
    batch.resolvers = [];
    batch.rejectors = [];
    batch.inProgress = false;

    logger.debug('Processing batch', {
      batchKey,
      batchSize: items.length
    });

    // Process the batch using the request queue manager
    requestQueueManager.enqueue({
      url: `batch/${batchKey}`,
      method: 'POST',
      execute: () => batchFn(items),
      tags: ['batch', batchKey]
    })
      .then(result => {
        logger.debug('Batch processed successfully', {
          batchKey,
          batchSize: items.length
        });

        // Resolve each item with its result
        items.forEach((item, index) => {
          try {
            const itemResult = itemResultFn(result, item, index);
            resolvers[index](itemResult);
          } catch (error) {
            rejectors[index](error);
          }
        });
      })
      .catch(error => {
        logger.error('Batch processing failed', {
          batchKey,
          batchSize: items.length,
          error: error instanceof Error ? error.message : String(error)
        });

        // If configured to retry individual items, do so
        if (this.config.retryIndividualOnFailure) {
          logger.debug('Retrying individual items', {
            batchKey,
            batchSize: items.length
          });

          // Process each item individually
          items.forEach((item, index) => {
            requestQueueManager.enqueue({
              url: `individual/${batchKey}`,
              method: 'POST',
              execute: () => batchFn([item]),
              tags: ['batch-retry', batchKey]
            })
              .then(result => {
                try {
                  const itemResult = itemResultFn(result, item, 0);
                  resolvers[index](itemResult);
                } catch (error) {
                  rejectors[index](error);
                }
              })
              .catch(error => {
                rejectors[index](error);
              });
          });
        } else {
          // Otherwise, reject all items with the same error
          items.forEach((_, index) => {
            rejectors[index](error);
          });
        }
      });
  }

  /**
   * Cancel all batches with the given key
   * @param batchKey Batch key to cancel
   */
  public cancel(batchKey: string): void {
    const batch = this.batches.get(batchKey);
    if (!batch) {
      return;
    }

    // Clear timer
    if (batch.timer) {
      clearTimeout(batch.timer);
      batch.timer = null;
    }

    // Reject all pending items
    batch.rejectors.forEach(reject => {
      reject(new Error(`Batch cancelled: ${batchKey}`));
    });

    // Remove batch
    this.batches.delete(batchKey);

    // Cancel any in-flight requests
    requestQueueManager.cancelByTag(batchKey);

    logger.debug('Batch cancelled', {
      batchKey,
      pendingItems: batch.items.length
    });
  }

  /**
   * Cancel all batches
   */
  public cancelAll(): void {
    for (const batchKey of this.batches.keys()) {
      this.cancel(batchKey);
    }
  }
}

// Create singleton instance
const batchRequestManager = new BatchRequestManager();

export default batchRequestManager;
