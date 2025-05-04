import React from 'react';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate?: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  notes?: string;
}

interface DocumentPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ isOpen, onClose, document }) => {
  if (!isOpen) return null;

  // Calculate document status based on expiry date
  const getDocumentStatus = (expiryDate?: string) => {
    if (!expiryDate) return { text: 'Valid', style: { backgroundColor: '#e8f5e9', color: '#388e3c' } };

    const expiry = new Date(expiryDate);
    const today = new Date();
    
    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Expired', style: { backgroundColor: '#ffebee', color: '#d32f2f' } };
    }
    
    if (diffDays <= 30) {
      return { text: 'Expiring Soon', style: { backgroundColor: '#fff8e1', color: '#ffa000' } };
    }
    
    return { text: 'Valid', style: { backgroundColor: '#e8f5e9', color: '#388e3c' } };
  };

  const status = getDocumentStatus(document.expiryDate);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Document Preview</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#e3f2fd',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1976d2">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '1.25rem' }}>{document.name}</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{document.type}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '0.75rem', fontWeight: '500' }}>FILE NAME</p>
              <p style={{ margin: 0, color: '#111827' }}>{document.fileName}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '0.75rem', fontWeight: '500' }}>FILE SIZE</p>
              <p style={{ margin: 0, color: '#111827' }}>{document.fileSize}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '0.75rem', fontWeight: '500' }}>FILE TYPE</p>
              <p style={{ margin: 0, color: '#111827' }}>{document.fileType}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '0.75rem', fontWeight: '500' }}>UPLOAD DATE</p>
              <p style={{ margin: 0, color: '#111827' }}>{new Date(document.uploadDate).toLocaleDateString()}</p>
            </div>
            {document.expiryDate && (
              <>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '0.75rem', fontWeight: '500' }}>EXPIRY DATE</p>
                  <p style={{ margin: 0, color: '#111827' }}>{new Date(document.expiryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '0.75rem', fontWeight: '500' }}>STATUS</p>
                  <p style={{ margin: 0 }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      ...status.style
                    }}>
                      {status.text}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>

          {document.notes && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ margin: '0 0 4px 0', color: '#6b7280', fontSize: '0.75rem', fontWeight: '500' }}>NOTES</p>
              <p style={{ margin: 0, color: '#111827', padding: '8px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #e5e7eb' }}>{document.notes}</p>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
          <p style={{ margin: '0 0 16px 0', color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>DOCUMENT PREVIEW</p>
          <div style={{ 
            backgroundColor: '#e5e7eb', 
            borderRadius: '4px', 
            padding: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '200px'
          }}>
            <p style={{ color: '#6b7280', textAlign: 'center' }}>
              Preview not available. Please download the document to view its contents.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 15px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              color: '#333',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
