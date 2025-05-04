import { fetchWithTimeout, safeHandleResponse } from '../api';
import { getAuthToken } from '../authService';
import { handleApiError, logError } from '../../utils/errorUtils';
import { Document, DocumentMetadata, UploadOptions } from '../../types/document';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 10; // Number of requests to batch together

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface BatchRequest {
  id: string;
  type: 'get' | 'post' | 'put' | 'delete';
  url: string;
  data?: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

// Cache storage
const cache = new Map<string, CacheEntry<any>>();

// Request batching
let batchQueue: BatchRequest[] = [];
let batchTimeout: NodeJS.Timeout | null = null;

const processBatch = async () => {
  if (batchQueue.length === 0) return;

  const currentBatch = batchQueue.splice(0, BATCH_SIZE);
  const batchPromises = currentBatch.map(async (request) => {
    try {
      let response;
      switch (request.type) {
        case 'get':
          response = await fetchWithTimeout(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/${request.url}`, {
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
          break;
        case 'post':
          response = await fetchWithTimeout(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/${request.url}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify(request.data),
          });
          break;
        case 'put':
          response = await fetchWithTimeout(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/${request.url}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${getAuthToken()}`,
            },
            body: JSON.stringify(request.data),
          });
          break;
        case 'delete':
          response = await fetchWithTimeout(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/${request.url}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
            },
          });
          break;
      }
      const data = await safeHandleResponse(response);
      request.resolve(data);
    } catch (error) {
      request.reject(error);
    }
  });

  await Promise.all(batchPromises);
};

const queueRequest = (request: BatchRequest) => {
  batchQueue.push(request);

  if (batchTimeout) {
    clearTimeout(batchTimeout);
  }

  batchTimeout = setTimeout(() => {
    processBatch();
  }, 100); // Wait 100ms to collect more requests
};

// Cache utilities
const isCacheValid = <T>(entry: CacheEntry<T> | undefined): boolean => {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
};

const setCache = <T>(key: string, data: T): void => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

const getCache = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (entry && isCacheValid(entry)) {
    return entry.data;
  }
  cache.delete(key);
  return null;
};

const clearCache = (): void => {
  cache.clear();
};

// Document API endpoints
export const documentApi = {
  // Get all documents
  getAll: async (): Promise<Document[]> => {
    try {
      const cacheKey = 'all_documents';
      const cached = getCache<Document[]>(cacheKey);
      if (cached) return cached;
      return new Promise<Document[]>((resolve, reject) => {
        queueRequest({
          id: 'get_all_documents',
          type: 'get',
          url: 'documents',
          resolve: (data: Document[]) => {
            setCache(cacheKey, data);
            resolve(data);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'getAll');
      throw handleApiError(error);
    }
  },

  // Get documents by employee ID
  getDocumentsByEmployeeId: async (employeeId: string): Promise<Document[]> => {
    try {
      const cacheKey = `documents_employee_${employeeId}`;
      const cached = getCache<Document[]>(cacheKey);
      if (cached) return cached;
      return new Promise<Document[]>((resolve, reject) => {
        queueRequest({
          id: `get_documents_employee_${employeeId}`,
          type: 'get',
          url: `documents/employee/${employeeId}`,
          resolve: (data: Document[]) => {
            setCache(cacheKey, data);
            resolve(data);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'getDocumentsByEmployeeId');
      throw handleApiError(error);
    }
  },

  // Get documents by type
  getDocumentsByType: async (documentType: string): Promise<Document[]> => {
    try {
      const cacheKey = `documents_type_${documentType}`;
      const cached = getCache<Document[]>(cacheKey);
      if (cached) return cached;
      return new Promise<Document[]>((resolve, reject) => {
        queueRequest({
          id: `get_documents_type_${documentType}`,
          type: 'get',
          url: `documents/type/${documentType}`,
          resolve: (data: Document[]) => {
            setCache(cacheKey, data);
            resolve(data);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'getDocumentsByType');
      throw handleApiError(error);
    }
  },

  // Get documents with expiring dates
  getExpiringDocuments: async (days: number = 30): Promise<Document[]> => {
    try {
      const cacheKey = `expiring_documents_${days}`;
      const cached = getCache<Document[]>(cacheKey);
      if (cached) return cached;
      return new Promise<Document[]>((resolve, reject) => {
        queueRequest({
          id: `get_expiring_documents_${days}`,
          type: 'get',
          url: `documents/expiring?days=${days}`,
          resolve: (data: Document[]) => {
            setCache(cacheKey, data);
            resolve(data);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'getExpiringDocuments');
      throw handleApiError(error);
    }
  },

  // Get all documents for a visa
  getDocumentsByVisaId: async (visaId: string): Promise<Document[]> => {
    try {
      const cacheKey = `documents_visa_${visaId}`;
      const cached = getCache<Document[]>(cacheKey);
      if (cached) return cached;
      return new Promise<Document[]>((resolve, reject) => {
        queueRequest({
          id: `get_documents_visa_${visaId}`,
          type: 'get',
          url: `documents/visa/${visaId}`,
          resolve: (data: Document[]) => {
            setCache(cacheKey, data);
            resolve(data);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'getDocumentsByVisaId');
      throw handleApiError(error);
    }
  },

  // Get a single document by ID
  getDocumentById: async (documentId: string): Promise<Document | null> => {
    try {
      const cacheKey = `document_${documentId}`;
      const cached = getCache<Document>(cacheKey);
      if (cached) return cached;
      return new Promise<Document | null>((resolve, reject) => {
        queueRequest({
          id: `get_document_${documentId}`,
          type: 'get',
          url: `documents/${documentId}`,
          resolve: (data: Document) => {
            setCache(cacheKey, data);
            resolve(data);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'getDocumentById');
      throw handleApiError(error);
    }
  },

  // Upload a document
  uploadDocument: async (visaId: string, file: File, options: UploadOptions = {}): Promise<Document> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('visaId', visaId);
      if (options.metadata) {
        formData.append('metadata', JSON.stringify(options.metadata));
      }
      const response = await fetchWithTimeout(`${import.meta.env.VITE_API_URL || 'http://localhost:5002/api'}/documents/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });
      const data = await safeHandleResponse(response);
      // Invalidate related caches
      clearCache();
      return data as Document;
    } catch (error) {
      logError(error, 'uploadDocument');
      throw handleApiError(error);
    }
  },

  // Download a document (legacy method, now handled by B2Storage)
  downloadDocument: async (documentId: string): Promise<boolean> => {
    try {
      return new Promise<boolean>((resolve, reject) => {
        queueRequest({
          id: `download_document_${documentId}`,
          type: 'get',
          url: `documents/${documentId}/download`,
          resolve: async (response: any) => {
            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response]));
            // Get filename from Content-Disposition header if available
            const contentDisposition = response.headers?.['content-disposition'];
            let filename = 'document';
            if (contentDisposition) {
              const filenameMatch = contentDisposition.match(/filename="(.+)"/);
              if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1];
              }
            }
            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            // Clean up
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            resolve(true);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'downloadDocument');
      throw handleApiError(error);
    }
  },

  // Log document access
  logDocumentAccess: async (documentId: string, userId: string, action: string, ipAddress?: string): Promise<void> => {
    try {
      return new Promise<void>((resolve, reject) => {
        queueRequest({
          id: `log_access_${documentId}_${action}`,
          type: 'post',
          url: `documents/${documentId}/access-log`,
          data: { userId, action, ipAddress },
          resolve: () => resolve(),
          reject
        });
      });
    } catch (error) {
      logError(error, 'logDocumentAccess');
      throw handleApiError(error);
    }
  },

  // Delete a document
  deleteDocument: async (documentId: string): Promise<{ success: boolean; visaId?: string }> => {
    try {
      return new Promise<{ success: boolean; visaId?: string }>((resolve, reject) => {
        queueRequest({
          id: `delete_document_${documentId}`,
          type: 'delete',
          url: `documents/${documentId}`,
          resolve: (data: { success: boolean; visaId?: string }) => {
            // Clear related caches
            cache.delete(`document_${documentId}`);
            if (data.visaId) {
              cache.delete(`documents_visa_${data.visaId}`);
            }
            resolve(data);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'deleteDocument');
      throw handleApiError(error);
    }
  },

  // Update document metadata
  updateDocumentMetadata: async (documentId: string, metadata: DocumentMetadata): Promise<Document> => {
    try {
      return new Promise<Document>((resolve, reject) => {
        queueRequest({
          id: `update_document_${documentId}`,
          type: 'put',
          url: `documents/${documentId}/metadata`,
          data: { metadata },
          resolve: (data: Document) => {
            // Update cache
            setCache(`document_${documentId}`, data);
            resolve(data);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'updateDocumentMetadata');
      throw handleApiError(error);
    }
  },

  // Get document access log
  getDocumentAccessLog: async (documentId: string): Promise<any[]> => {
    try {
      const cacheKey = `document_access_log_${documentId}`;
      const cached = getCache<any[]>(cacheKey);
      if (cached) return cached;
      return new Promise<any[]>((resolve, reject) => {
        queueRequest({
          id: `get_access_log_${documentId}`,
          type: 'get',
          url: `documents/${documentId}/access-log`,
          resolve: (data: any[]) => {
            setCache(cacheKey, data);
            resolve(data);
          },
          reject
        });
      });
    } catch (error) {
      logError(error, 'getDocumentAccessLog');
      throw handleApiError(error);
    }
  },
};

export default documentApi;