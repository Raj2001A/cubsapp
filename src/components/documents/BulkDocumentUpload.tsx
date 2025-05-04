import React, { useState, useRef } from 'react';

interface BulkDocumentUploadProps {
  onUpload: (files: File[], metadata: DocumentMetadata[]) => void;
  employeeOptions: { id: string; name: string }[];
}

interface DocumentMetadata {
  file: File;
  employeeId: string;
  documentType: string;
  expiryDate?: string;
}

const BulkDocumentUpload: React.FC<BulkDocumentUploadProps> = ({
  onUpload,
  employeeOptions
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Document type options
  const documentTypes = [
    { id: 'passport', label: 'Passport' },
    { id: 'visa', label: 'Visa' },
    { id: 'emirates_id', label: 'Emirates ID' },
    { id: 'labor_card', label: 'Labor Card' },
    { id: 'medical_insurance', label: 'Medical Insurance' },
    { id: 'workmen_compensation', label: 'Workmen Compensation' },
    { id: 'iloe', label: 'ILOE' },
    { id: 'cicpa', label: 'CICPA' },
    { id: 'temporary_work_permit', label: 'Temporary Work Permit' },
    { id: 'driving_license', label: 'Driving License' },
    { id: 'certificate', label: 'Certificate' },
    { id: 'other', label: 'Other' }
  ];
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...files]);
      
      // Initialize metadata for each file
      const newMetadata = files.map(file => ({
        file,
        employeeId: '',
        documentType: '',
        expiryDate: ''
      }));
      
      setDocumentMetadata(prevMetadata => [...prevMetadata, ...newMetadata]);
    }
  };
  
  // Update metadata for a specific file
  const updateMetadata = (index: number, field: keyof DocumentMetadata, value: string) => {
    setDocumentMetadata(prevMetadata => {
      const updated = [...prevMetadata];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };
  
  // Remove a file
  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setDocumentMetadata(prevMetadata => prevMetadata.filter((_, i) => i !== index));
  };
  
  // Handle upload
  const handleUpload = () => {
    // Validate metadata
    const isValid = documentMetadata.every(meta => 
      meta.employeeId && meta.documentType
    );
    
    if (!isValid) {
      alert('Please fill in all required fields for each document.');
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // Call the onUpload callback
        onUpload(selectedFiles, documentMetadata);
        
        // Reset state
        setTimeout(() => {
          setSelectedFiles([]);
          setDocumentMetadata([]);
          setIsUploading(false);
          setUploadProgress(0);
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 500);
      }
    }, 100);
  };
  
  // Get file size display
  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: '0 0 16px', color: '#333' }}>Bulk Document Upload</h2>
      
      {/* File Selection */}
      <div style={{ marginBottom: '20px' }}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
        
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer'
          }}
        >
          <div style={{ marginBottom: '12px', color: '#6b7280' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto' }}>
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" fill="currentColor" />
            </svg>
          </div>
          <p style={{ margin: '0 0 8px', color: '#4b5563', fontWeight: '500' }}>
            Click to select files or drag and drop
          </p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
            PDF, JPG, PNG (Max. 10MB per file)
          </p>
        </div>
      </div>
      
      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1rem', color: '#4b5563', marginBottom: '12px' }}>
            Selected Documents ({selectedFiles.length})
          </h3>
          
          <div style={{ 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            {selectedFiles.map((file, index) => (
              <div 
                key={`${file.name}-${index}`}
                style={{ 
                  padding: '16px',
                  borderBottom: index < selectedFiles.length - 1 ? '1px solid #e5e7eb' : 'none',
                  backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                }}
              >
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      backgroundColor: '#e0f2fe', 
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#0284c7'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>{file.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{getFileSize(file.size)}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#6b7280',
                      border: 'none',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      padding: '4px'
                    }}
                  >
                    ✕
                  </button>
                </div>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px'
                }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '4px' }}>
                      Employee *
                    </label>
                    <select
                      value={documentMetadata[index]?.employeeId || ''}
                      onChange={(e) => updateMetadata(index, 'employeeId', e.target.value)}
                      disabled={isUploading}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select Employee</option>
                      {employeeOptions.map(employee => (
                        <option key={employee.id} value={employee.id}>{employee.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '4px' }}>
                      Document Type *
                    </label>
                    <select
                      value={documentMetadata[index]?.documentType || ''}
                      onChange={(e) => updateMetadata(index, 'documentType', e.target.value)}
                      disabled={isUploading}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white'
                      }}
                    >
                      <option value="">Select Type</option>
                      {documentTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '4px' }}>
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={documentMetadata[index]?.expiryDate || ''}
                      onChange={(e) => updateMetadata(index, 'expiryDate', e.target.value)}
                      disabled={isUploading}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload Progress */}
      {isUploading && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>Uploading...</span>
            <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>{uploadProgress}%</span>
          </div>
          <div style={{ 
            height: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div 
              style={{ 
                height: '100%',
                width: `${uploadProgress}%`,
                backgroundColor: '#10b981',
                borderRadius: '4px',
                transition: 'width 0.2s ease-in-out'
              }} 
            />
          </div>
        </div>
      )}
      
      {/* Upload Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || isUploading}
          style={{
            backgroundColor: selectedFiles.length === 0 || isUploading ? '#f3f4f6' : '#4f46e5',
            color: selectedFiles.length === 0 || isUploading ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 16px',
            cursor: selectedFiles.length === 0 || isUploading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} Document${selectedFiles.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
};

export default BulkDocumentUpload;
