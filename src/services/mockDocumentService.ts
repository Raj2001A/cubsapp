/**
 * Mock Document Service
 * 
 * A simplified document service for the mock implementation
 */

// Mock document data with file URLs
const mockDocumentFiles: Record<string, string> = {
  '1': 'https://example.com/documents/passport_john_doe.pdf',
  '2': 'https://example.com/documents/visa_john_doe.pdf',
  '3': 'https://example.com/documents/contract_john_doe.pdf',
  '4': 'https://example.com/documents/passport_jane_smith.pdf',
  '5': 'https://example.com/documents/visa_jane_smith.pdf',
  '6': 'https://example.com/documents/passport_mike_johnson.pdf',
  '7': 'https://example.com/documents/visa_mike_johnson.pdf',
  '8': 'https://example.com/documents/emirates_id_mike_johnson.pdf',
  '9': 'https://example.com/documents/labour_card_jane_smith.pdf',
  '10': 'https://example.com/documents/medical_insurance_john_doe.pdf',
};

// Document file types for proper download handling
const documentFileTypes: Record<string, string> = {
  '1': 'application/pdf',
  '2': 'application/pdf',
  '3': 'application/pdf',
  '4': 'application/pdf',
  '5': 'application/pdf',
  '6': 'application/pdf',
  '7': 'application/pdf',
  '8': 'application/pdf',
  '9': 'application/pdf',
  '10': 'application/pdf',
};

/**
 * Download a document
 * @param documentId The ID of the document to download
 * @param documentName The name to use for the downloaded file
 */
export const downloadDocument = (documentId: string, documentName: string): void => {
  // In a real app, this would make an API call to get the document
  // For this mock implementation, we'll simulate a download
  
  // Check if document exists
  if (!mockDocumentFiles[documentId]) {
    alert('Document not found');
    return;
  }
  
  // Create a mock download by creating a temporary anchor element
  const link = document.createElement('a');
  link.href = mockDocumentFiles[documentId];
  link.download = documentName || `document_${documentId}.pdf`;
  
  // Set the appropriate content type
  const contentType = documentFileTypes[documentId] || 'application/pdf';
  link.setAttribute('type', contentType);
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log(`Downloading document: ${documentName} (ID: ${documentId})`);
};

/**
 * Preview a document
 * @param documentId The ID of the document to preview
 */
export const previewDocument = (documentId: string): void => {
  // In a real app, this would open a document preview
  // For this mock implementation, we'll open the URL in a new tab
  
  // Check if document exists
  if (!mockDocumentFiles[documentId]) {
    alert('Document not found');
    return;
  }
  
  // Open in new tab
  window.open(mockDocumentFiles[documentId], '_blank');
  
  console.log(`Previewing document: (ID: ${documentId})`);
};

/**
 * Get document file URL
 * @param documentId The ID of the document
 * @returns The URL of the document file
 */
export const getDocumentFileUrl = (documentId: string): string | null => {
  return mockDocumentFiles[documentId] || null;
};

export default {
  downloadDocument,
  previewDocument,
  getDocumentFileUrl
};
