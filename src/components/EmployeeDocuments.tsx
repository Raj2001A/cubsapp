import React, { useRef, useState } from 'react';
import Button from './ui/Button';
import { format } from 'date-fns';
import { EmployeeDocument } from '../services/employeeService';

export interface DocumentType {
  id: string;
  label: string;
  requiresExpiry?: boolean;
}

// Use the EmployeeDocument type from employeeService.ts

interface EmployeeDocumentsProps {
  documents: EmployeeDocument[];
  onUpload: (file: File, documentType: string, expiryDate?: string) => void;
  onDelete: (id: string) => void;
}

// Document types based on the provided list
const DOCUMENT_TYPES: DocumentType[] = [
  { id: 'passport', label: 'PASSPORT COPY' },
  { id: 'emirates_id', label: 'EMIRATES ID' },
  { id: 'labour_card', label: 'LABOUR CARD' },
  { id: 'medical_insurance', label: 'MEDICAL INSURANCE' },
  { id: 'workmen_compensation', label: 'WORKMEN COMPENSATION' },
  { id: 'visa_copy', label: 'VISA COPY', requiresExpiry: true },
  { id: 'iloe', label: 'ILOE' },
  { id: 'cicpa', label: 'CICPA' },
  { id: 'temporary_work_permit', label: 'TEMPORARY WORK PERMIT', requiresExpiry: true },
  { id: 'driving_license', label: 'DRIVING LICENSE', requiresExpiry: true },
  { id: 'other_certificates', label: 'OTHER CERTIFICATES' },
];

const EmployeeDocuments: React.FC<EmployeeDocumentsProps> = ({ documents, onUpload, onDelete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });
  const horizontalScrollRef = useRef<HTMLDivElement>(null);
  
  // Group documents by type for organized display
  const documentsByType = documents.reduce((acc, doc) => {
    // Use the document type if available, or fallback to 'other_certificates'
    const docType = doc.type || 'other_certificates';
    if (!acc[docType]) {
      acc[docType] = [];
    }
    acc[docType].push(doc);
    return acc;
  }, {} as Record<string, EmployeeDocument[]>);
  
  const handleUploadClick = () => {
    setIsUploadModalOpen(true);
  };
  
  const handleFileUpload = async () => {
    if (fileInputRef.current?.files && fileInputRef.current.files[0] && selectedDocType) {
      const file = fileInputRef.current.files[0];
      const selectedDocTypeObj = DOCUMENT_TYPES.find(dt => dt.id === selectedDocType);
      const needsExpiry = selectedDocTypeObj?.requiresExpiry;
      
      // Validate file type
      const validFileTypes = [
        'application/pdf', 
        'image/jpeg', 
        'image/png', 
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!validFileTypes.includes(file.type)) {
        setUploadStatus({ 
          loading: false, 
          error: 'Invalid file type. Please upload a PDF, JPG, PNG, or DOC file.'
        });
        return;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setUploadStatus({ 
          loading: false, 
          error: 'File size exceeds 10MB limit. Please upload a smaller file.'
        });
        return;
      }
      
      if (needsExpiry && !expiryDate) {
        setUploadStatus({ 
          loading: false, 
          error: 'Please select an expiry date for this document.'
        });
        return;
      }
      
      try {
        setUploadStatus({ loading: true, error: null });
        
        // Call the parent component's upload function
        await onUpload(
          file, 
          selectedDocType,
          needsExpiry ? expiryDate : undefined
        );
        
        // Reset form and status on success
        setIsUploadModalOpen(false);
        setSelectedDocType('');
        setExpiryDate('');
        setUploadStatus({ loading: false, error: null });
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (error) {
        setUploadStatus({ 
          loading: false, 
          error: error instanceof Error ? error.message : 'Failed to upload document'
        });
      }
    } else {
      setUploadStatus({ 
        loading: false, 
        error: 'Please select a document type and file.'
      });
    }
  };
  
  const handleFileChange = () => {
    // Reset any previous error when a new file is selected
    if (uploadStatus.error) {
      setUploadStatus({ loading: false, error: null });
    }
  };
  
  // Horizontal scroll controls
  const scrollLeft = () => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (horizontalScrollRef.current) {
      horizontalScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Employee Documents</h2>
        <Button onClick={handleUploadClick} variant="primary" className="flex items-center gap-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          Upload Document
        </Button>
      </div>
      
      {/* Document Categories with Horizontal Scrolling */}
      <div className="relative mb-4">
        <div className="flex items-center">
          <button 
            onClick={scrollLeft}
            className="absolute left-0 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100"
            aria-label="Scroll left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <div 
            ref={horizontalScrollRef}
            className="flex overflow-x-auto py-2 px-8 scrollbar-hide scroll-smooth"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {/* Document type columns */}
            {DOCUMENT_TYPES.map(docType => {
              const docsOfType = documentsByType[docType.id] || [];
              return (
                <div key={docType.id} className="flex-shrink-0 w-56 mr-4 border rounded-lg p-3 bg-gray-50">
                  <h3 className="text-sm font-bold text-gray-700 mb-2 truncate" title={docType.label}>
                    {docType.label}
                    {docType.requiresExpiry && (
                      <span className="ml-1 text-yellow-600 text-xs">(Requires Expiry)</span>
                    )}
                  </h3>
                  <ul className="space-y-2">
                    {docsOfType.length === 0 && (
                      <li className="text-gray-400 text-sm italic">No documents</li>
                    )}
                    {docsOfType.map(doc => (
                      <li key={doc.id} className="text-sm bg-white p-2 rounded border">
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline block truncate"
                          title={doc.name}
                        >
                          {doc.name}
                        </a>
                        {doc.expiryDate && (
                          <div className="mt-1 text-xs">
                            <span className="font-medium">Expires:</span>{' '}
                            <span className={`${new Date(doc.expiryDate) < new Date() ? 'text-red-600 font-bold' : 'text-gray-600'}`}>
                              {format(new Date(doc.expiryDate), 'dd MMM yyyy')}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-end mt-1">
                          <Button 
                            onClick={() => onDelete(doc.id)} 
                            variant="danger" 
                            className="text-xs py-1 px-2"
                          >
                            Delete
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          
          <button 
            onClick={scrollRight}
            className="absolute right-0 z-10 bg-white rounded-full shadow-md p-1 hover:bg-gray-100"
            aria-label="Scroll right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
      
      {/* CSS for horizontal scroll hiding */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            
            {uploadStatus.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                {uploadStatus.error}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-400"
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                disabled={uploadStatus.loading}
              >
                <option value="">Select document type</option>
                {DOCUMENT_TYPES.map(docType => (
                  <option key={docType.id} value={docType.id}>{docType.label}</option>
                ))}
              </select>
            </div>
            
            {selectedDocType && DOCUMENT_TYPES.find(dt => dt.id === selectedDocType)?.requiresExpiry && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-400"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={uploadStatus.loading}
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
              <input
                ref={fileInputRef}
                type="file"
                className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-400"
                onChange={handleFileChange}
                disabled={uploadStatus.loading}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, JPG, PNG, DOC (max 10MB)</p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadStatus({ loading: false, error: null });
                }} 
                variant="default"
                disabled={uploadStatus.loading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleFileUpload} 
                variant="primary"
                disabled={uploadStatus.loading}
              >
                {uploadStatus.loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
