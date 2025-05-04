/**
 * Unified Document Interface
 * 
 * This file contains the standardized Document interface and related types
 * to be used consistently throughout the application.
 */

/**
 * Document types enumeration
 */
export enum DocumentType {
  PASSPORT_COPY = 'PASSPORT_COPY',
  EMIRATES_ID = 'EMIRATES_ID',
  LABOUR_CARD = 'LABOUR_CARD',
  MEDICAL_INSURANCE = 'MEDICAL_INSURANCE',
  WORKMEN_COMPENSATION = 'WORKMEN_COMPENSATION',
  VISA_COPY = 'VISA_COPY',
  ILOE = 'ILOE', // Immigration Letter of Employment
  CICPA = 'CICPA', // Critical Infrastructure & Coastal Protection Authority
  TEMPORARY_WORK_PERMIT = 'TEMPORARY_WORK_PERMIT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  OTHER_CERTIFICATES = 'OTHER_CERTIFICATES'
}

/**
 * Document types that require expiry date tracking
 */
export const EXPIRY_TRACKED_DOCUMENTS = [
  DocumentType.VISA_COPY,
  DocumentType.PASSPORT_COPY,
  DocumentType.TEMPORARY_WORK_PERMIT
];

/**
 * Document status enumeration
 */
export enum DocumentStatus {
  VALID = 'valid',
  EXPIRING_SOON = 'expiring',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

/**
 * Document access log entry interface
 */
export interface AccessLogEntry {
  userId: string;
  action: 'view' | 'download' | 'edit' | 'delete';
  timestamp: string;
  ipAddress?: string;
}

/**
 * Document metadata interface
 */
export interface DocumentMetadata {
  description?: string;
  tags?: string[];
  documentType?: DocumentType;
  status?: DocumentStatus;
  expiryDate?: string; // ISO date string
  issueDate?: string; // ISO date string
  documentNumber?: string; // ID number, passport number, etc.
  issuingAuthority?: string;
  employeeId?: string;
  virusScanStatus?: 'clean' | 'infected' | 'pending';
  compressionRatio?: number;
}

/**
 * Unified Document interface
 */
export interface Document {
  // Core properties
  id: string;
  name: string;
  type: string; // MIME type or document type
  
  // Employee association
  employeeId: string;
  employeeName?: string;
  
  // Dates
  uploadDate: string; // ISO date string
  expiryDate?: string; // ISO date string
  issueDate?: string; // ISO date string
  
  // Status
  status?: DocumentStatus;
  
  // File properties
  size?: number;
  url?: string;
  fileName?: string;
  fileType?: string;
  
  // Storage details
  fileId?: string;
  filePath?: string;
  mimeType?: string;
  
  // Version control
  version?: number;
  checksum?: string;
  isEncrypted?: boolean;
  
  // Categories and types
  documentType?: DocumentType;
  category?: 'passport' | 'visa' | 'work_permit' | 'other';
  
  // Additional data
  accessLog?: AccessLogEntry[];
  metadata?: DocumentMetadata;
  notes?: string;
  
  // Computed properties (should be calculated, not stored)
  daysUntilExpiry?: number;
}

/**
 * Document upload options interface
 */
export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  metadata?: DocumentMetadata;
  compress?: boolean;
  encrypt?: boolean;
  virusScan?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Get days until expiry
 * @param expiryDate ISO date string
 * @returns number of days until expiry, negative if expired
 */
export const getDaysUntilExpiry = (expiryDate?: string): number | null => {
  if (!expiryDate) return null;

  const expiry = new Date(expiryDate);
  const today = new Date();

  // Reset time to compare dates only
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get document status based on expiry date
 * @param expiryDate ISO date string
 * @returns DocumentStatus
 */
export const getDocumentStatus = (expiryDate?: string): DocumentStatus => {
  if (!expiryDate) return DocumentStatus.VALID;

  const daysUntilExpiry = getDaysUntilExpiry(expiryDate);

  if (daysUntilExpiry === null) return DocumentStatus.VALID;
  if (daysUntilExpiry < 0) return DocumentStatus.EXPIRED;
  if (daysUntilExpiry <= 30) return DocumentStatus.EXPIRING_SOON;
  return DocumentStatus.VALID;
};

/**
 * Get human-readable document type label
 * @param type DocumentType
 * @returns string
 */
export const getDocumentTypeLabel = (type: DocumentType): string => {
  switch (type) {
    case DocumentType.PASSPORT_COPY:
      return 'Passport Copy';
    case DocumentType.EMIRATES_ID:
      return 'Emirates ID';
    case DocumentType.LABOUR_CARD:
      return 'Labour Card';
    case DocumentType.MEDICAL_INSURANCE:
      return 'Medical Insurance';
    case DocumentType.WORKMEN_COMPENSATION:
      return 'Workmen Compensation';
    case DocumentType.VISA_COPY:
      return 'Visa Copy';
    case DocumentType.ILOE:
      return 'ILOE';
    case DocumentType.CICPA:
      return 'CICPA';
    case DocumentType.TEMPORARY_WORK_PERMIT:
      return 'Temporary Work Permit';
    case DocumentType.DRIVING_LICENSE:
      return 'Driving License';
    case DocumentType.OTHER_CERTIFICATES:
      return 'Other Certificates';
    default:
      return 'Unknown Document Type';
  }
};

/**
 * Format file size for display
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === null) return 'Unknown size';
  
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Convert backend document model to frontend document interface
 * @param backendDocument Document from backend API
 * @returns Frontend Document interface
 */
export const mapBackendDocumentToFrontend = (backendDocument: any): Document => {
  return {
    id: backendDocument.id,
    name: backendDocument.name,
    type: backendDocument.type,
    employeeId: backendDocument.employee_id,
    employeeName: backendDocument.employee_name,
    uploadDate: backendDocument.created_at,
    expiryDate: backendDocument.expiry_date,
    status: getDocumentStatus(backendDocument.expiry_date),
    size: backendDocument.file_size,
    fileName: backendDocument.file_name,
    fileId: backendDocument.file_id,
    filePath: backendDocument.file_path,
    mimeType: backendDocument.mime_type,
    notes: backendDocument.notes,
    documentType: backendDocument.document_type,
    daysUntilExpiry: getDaysUntilExpiry(backendDocument.expiry_date) || undefined
  };
};

/**
 * Convert frontend document to backend model format
 * @param frontendDocument Document from frontend
 * @returns Backend document model
 */
export const mapFrontendDocumentToBackend = (frontendDocument: Document): any => {
  return {
    id: frontendDocument.id,
    name: frontendDocument.name,
    type: frontendDocument.type,
    employee_id: frontendDocument.employeeId,
    file_id: frontendDocument.fileId,
    file_name: frontendDocument.fileName,
    file_path: frontendDocument.filePath,
    file_size: frontendDocument.size,
    mime_type: frontendDocument.mimeType,
    expiry_date: frontendDocument.expiryDate,
    notes: frontendDocument.notes,
    status: frontendDocument.status
  };
};
