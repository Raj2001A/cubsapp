// Removed unused createHash import for code hygiene
import documentApi from './api/documentApi';
import B2StorageService from './b2StorageService';
import { handleApiError, logError, AppError } from '../utils/errorUtils';
import { Document, AccessLogEntry, UploadOptions } from '../types/document';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 10; // Number of documents to process in a batch

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// Additional interface for internal document service use
interface DocumentWithVisaId extends Document {
  visaId: string;
}

class DocumentService {
  private readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly DEFAULT_ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  private readonly FILE_SIGNATURES = {
    'application/pdf': ['25504446'],
    'image/jpeg': ['FFD8FF'],
    'image/png': ['89504E47'],
    'application/msword': ['D0CF11E0'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['504B0304']
  };

  private documentCache: Map<string, CacheEntry<Document>> = new Map();
  private documentListCache: Map<string, CacheEntry<Document[]>> = new Map();
  private accessLogCache: Map<string, CacheEntry<AccessLogEntry[]>> = new Map();
  private uploadQueue: File[] = [];
  private isProcessingQueue = false;
  private b2Storage: B2StorageService;

  constructor() {
    this.b2Storage = new B2StorageService();
  }

  private validateFile(file: File, options: UploadOptions = {}): void {
    const maxSize = options.maxSize || this.DEFAULT_MAX_SIZE;
    const allowedTypes = options.allowedTypes || this.DEFAULT_ALLOWED_TYPES;

    if (file.size > maxSize) {
      throw new AppError(
        `File size exceeds the limit of ${maxSize / (1024 * 1024)}MB`,
        { code: 'FILE_TOO_LARGE', isOperational: true }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      throw new AppError(
        `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        { code: 'INVALID_FILE_TYPE', isOperational: true }
      );
    }
  }

  private async detectFileType(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arr = new Uint8Array(e.target?.result as ArrayBuffer).subarray(0, 4);
          const header = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

          for (const [type, signatures] of Object.entries(this.FILE_SIGNATURES)) {
            if (signatures.some(sig => header.startsWith(sig))) {
              resolve(type);
              return;
            }
          }
          reject(new AppError('Unknown file type', { code: 'UNKNOWN_FILE_TYPE', isOperational: true }));
        } catch (error) {
          reject(new AppError('Failed to detect file type', { code: 'FILE_TYPE_DETECTION_ERROR', isOperational: false }));
        }
      };
      reader.onerror = () => reject(new AppError('Failed to read file', { code: 'FILE_READ_ERROR', isOperational: false }));
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }

  private async compressFile(file: File): Promise<{ file: File; ratio: number }> {
    // In a real implementation, this would use a compression library
    // For now, we'll simulate compression
    try {
      const ratio = 0.7; // Simulated compression ratio
      return { file, ratio };
    } catch (error) {
      throw new AppError('Failed to compress file', { code: 'COMPRESSION_ERROR', isOperational: false });
    }
  }

  private async encryptFile(file: File): Promise<File> {
    // In a real implementation, this would use a encryption library
    // For now, we'll just return the original file
    try {
      return file;
    } catch (error) {
      throw new AppError('Failed to encrypt file', { code: 'ENCRYPTION_ERROR', isOperational: false });
    }
  }

  private async scanForVirus(_: File): Promise<'clean' | 'infected'> {
    // In a real implementation, this would use a virus scanning service
    // For now, we'll simulate a scan
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return Math.random() > 0.1 ? 'clean' : 'infected';
    } catch (error) {
      throw new AppError('Failed to scan file for viruses', { code: 'VIRUS_SCAN_ERROR', isOperational: false });
    }
  }

  private generateUniqueFilename(originalName: string): string {
    try {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15);
      const extension = originalName.split('.').pop();
      return `${timestamp}-${random}.${extension}`;
    } catch (error) {
      throw new AppError('Failed to generate unique filename', { code: 'FILENAME_GENERATION_ERROR', isOperational: false });
    }
  }

  private logAccess(documentId: string, userId: string, action: AccessLogEntry['action'], _?: string): void {
    // This is now handled by the backend
    console.log(`Access logged: ${action} by ${userId} on document ${documentId}`);
  }

  private isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
    if (!entry) return false;
    return Date.now() - entry.timestamp < CACHE_TTL;
  }

  private setCache<T>(key: string, data: T, cache: Map<string, CacheEntry<T>>): void {
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  private getCache<T>(key: string, cache: Map<string, CacheEntry<T>>): T | null {
    const entry = cache.get(key);
    if (entry && this.isCacheValid(entry)) {
      return entry.data;
    }
    cache.delete(key);
    return null;
  }

  private clearCache(): void {
    this.documentCache.clear();
    this.documentListCache.clear();
    this.accessLogCache.clear();
  }

  private async processUploadQueue(): Promise<void> {
    if (this.isProcessingQueue || this.uploadQueue.length === 0) return;

    this.isProcessingQueue = true;
    const batch = this.uploadQueue.splice(0, BATCH_SIZE);

    try {
      await Promise.all(batch.map(file => this.uploadDocument('visa-123', file)));
    } catch (error) {
      logError(error, 'processUploadQueue');
      // Put failed files back in the queue
      this.uploadQueue.unshift(...batch);
    } finally {
      this.isProcessingQueue = false;
      // Process next batch if there are more files
      if (this.uploadQueue.length > 0) {
        setTimeout(() => this.processUploadQueue(), 1000);
      }
    }
  }

  async uploadDocument(visaId: string, file: File, options: UploadOptions = {}): Promise<Document> {
    try {
      // Add file to upload queue
      this.uploadQueue.push(file);
      this.processUploadQueue();

      // Validate file
      this.validateFile(file, options);

      // Detect file type
      const detectedType = await this.detectFileType(file);
      if (detectedType !== file.type) {
        throw new AppError(
          `File type mismatch. Detected: ${detectedType}, Provided: ${file.type}`,
          { code: 'FILE_TYPE_MISMATCH', isOperational: true }
        );
      }

      // Process file in parallel
      const [compressedFile, encryptedFile, virusScanResult] = await Promise.all([
        options.compress ? this.compressFile(file) : Promise.resolve({ file, ratio: 1 }),
        options.encrypt ? this.encryptFile(file) : Promise.resolve(file),
        options.virusScan ? this.scanForVirus(file) : Promise.resolve('clean')
      ]);

      // Generate unique filename
      const uniqueFilename = this.generateUniqueFilename(file.name);

      // Prepare metadata
      const fileMetadata = {
        ...options.metadata,
        virusScanStatus: virusScanResult,
        compressionRatio: compressedFile.ratio
      };

      // Create B2 metadata
      const b2Metadata: Record<string, string> = {
        visaId,
        originalName: file.name
      };

      // Add metadata fields to B2 metadata
      if (fileMetadata) {
        Object.entries(fileMetadata).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            b2Metadata[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
          }
        });
      }

      // Upload to B2
      const b2FileInfo = await this.b2Storage.uploadFile(
        encryptedFile,
        `${visaId}/${uniqueFilename}`,
        file.type,
        b2Metadata,
        options.onProgress
      );

      // Create document object
      const document: DocumentWithVisaId = {
        id: b2FileInfo.fileId,
        visaId,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: `${visaId}/${uniqueFilename}`,
        version: 1,
        isEncrypted: !!options.encrypt,
        accessLog: [],
        employeeId: options.metadata?.employeeId || '',
        metadata: {
          ...fileMetadata,
          virusScanStatus: (fileMetadata?.virusScanStatus === 'clean' || fileMetadata?.virusScanStatus === 'infected' || fileMetadata?.virusScanStatus === 'pending')
            ? fileMetadata.virusScanStatus
            : undefined,
        },
      };

      // Also upload to API for database record
      await documentApi.uploadDocument(visaId, encryptedFile, {
        ...options,
        metadata: {
          ...fileMetadata,
          virusScanStatus: (fileMetadata?.virusScanStatus === 'clean' || fileMetadata?.virusScanStatus === 'infected' || fileMetadata?.virusScanStatus === 'pending')
            ? fileMetadata.virusScanStatus
            : undefined,
        },
        onProgress: undefined // Don't need progress again
      });

      // Update cache
      this.setCache(document.id, document, this.documentCache);
      this.clearCache(); // Clear list cache as it's now stale

      return document;
    } catch (error) {
      logError(error, 'uploadDocument');
      throw handleApiError(error);
    }
  }

  async uploadMultipleDocuments(visaId: string, files: File[], options: UploadOptions = {}): Promise<Document[]> {
    try {
      const uploadPromises = files.map(file => this.uploadDocument(visaId, file, options));
      return await Promise.all(uploadPromises);
    } catch (error) {
      logError(error, 'uploadMultipleDocuments');
      throw handleApiError(error);
    }
  }

  async downloadDocument(documentId: string, userId: string, _?: string): Promise<void> {
    try {
      // Log access (this will be handled by the backend)
      this.logAccess(documentId, userId, 'download');

      // Get document info
      const document = await this.getDocumentById(documentId);
      if (!document) {
        throw new AppError('Document not found', { code: 'DOCUMENT_NOT_FOUND', isOperational: true });
      }

      // Download from B2
      await this.b2Storage.downloadFile(documentId, document.url ?? '');

      // Also log download via API
      await documentApi.logDocumentAccess(documentId, userId, 'download');
    } catch (error) {
      logError(error, 'downloadDocument');
      throw handleApiError(error);
    }
  }

  async deleteDocument(documentId: string, userId: string, _?: string): Promise<void> {
    try {
      // Log access (this will be handled by the backend)
      this.logAccess(documentId, userId, 'delete');

      // Get document info
      const document = await this.getDocumentById(documentId);
      if (!document) {
        throw new AppError('Document not found', { code: 'DOCUMENT_NOT_FOUND', isOperational: true });
      }

      // Delete from B2
      await this.b2Storage.deleteFile(documentId, document.url ?? '');

      // Delete from API
      await documentApi.deleteDocument(documentId);

      // Clear caches
      this.documentCache.delete(documentId);
      this.accessLogCache.delete(documentId);
      this.clearCache(); // Clear list cache as it's now stale
    } catch (error) {
      logError(error, 'deleteDocument');
      throw handleApiError(error);
    }
  }

  async getDocumentsByVisaId(visaId: string): Promise<Document[]> {
    try {
      // Check cache first
      const cached = this.getCache(visaId, this.documentListCache);
      if (cached) return cached;

      const documents = await documentApi.getDocumentsByVisaId(visaId);
      this.setCache(visaId, documents as Document[], this.documentListCache);
      return documents as Document[];
    } catch (error) {
      logError(error, 'getDocumentsByVisaId');
      throw handleApiError(error);
    }
  }

  async getDocumentById(documentId: string): Promise<Document | null> {
    try {
      // Check cache first
      const cached = this.getCache(documentId, this.documentCache);
      if (cached) return cached;

      const document = await documentApi.getDocumentById(documentId);
      if (document) {
        this.setCache(documentId, document as Document, this.documentCache);
      }
      return document as Document | null;
    } catch (error) {
      logError(error, 'getDocumentById');
      throw handleApiError(error);
    }
  }

  async updateDocumentMetadata(documentId: string, metadata: Document['metadata']): Promise<Document> {
    try {
      const document = await documentApi.updateDocumentMetadata(documentId, metadata as any);

      // Update cache
      this.setCache(documentId, document as Document, this.documentCache);
      this.clearCache(); // Clear list cache as it's now stale

      return document as Document;
    } catch (error) {
      logError(error, 'updateDocumentMetadata');
      throw handleApiError(error);
    }
  }

  async getDocumentAccessLog(documentId: string): Promise<AccessLogEntry[]> {
    try {
      // Check cache first
      const cached = this.getCache(documentId, this.accessLogCache);
      if (cached) return cached;

      const log = await documentApi.getDocumentAccessLog(documentId);
      this.setCache(documentId, log as AccessLogEntry[], this.accessLogCache);
      return log as AccessLogEntry[];
    } catch (error) {
      logError(error, 'getDocumentAccessLog');
      throw handleApiError(error);
    }
  }
}

export default DocumentService;