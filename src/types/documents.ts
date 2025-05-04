/**
 * Re-export from the unified document interface
 *
 * This file is kept for backward compatibility.
 * All components should gradually migrate to using the unified interface from document.ts
 */

export type {
  Document,
  DocumentType,
  DocumentMetadata,
  AccessLogEntry,
  UploadOptions,
  EXPIRY_TRACKED_DOCUMENTS
} from './document';

export {
  getDocumentTypeLabel,
  getDaysUntilExpiry,
  formatFileSize,
  mapBackendDocumentToFrontend,
  mapFrontendDocumentToBackend,
  DocumentStatus
} from './document';
