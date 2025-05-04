import React from 'react';
import { Document } from '../../types/documents';

interface DocumentListItemProps {
  document: Document;
  onViewEmployee: (id: string) => void;
  onDownload: (id: string, name: string) => void;
  onPreview: (id: string) => void;
  getDaysUntilExpiry: (expiryDate: string | undefined) => number | null;
  getStatusBadgeStyle: (expiryDate: string | undefined) => React.CSSProperties;
}

// Memoized document list item component to prevent unnecessary re-renders
const DocumentListItem: React.FC<DocumentListItemProps> = React.memo(
  ({ document, onViewEmployee, onDownload, onPreview, getDaysUntilExpiry, getStatusBadgeStyle }) => {
    const daysUntil = getDaysUntilExpiry(document.expiryDate);

    return (
      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#e3f2fd',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#1976d2">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <div style={{ fontWeight: '500', color: '#111827' }}>{document.name}</div>
            </div>
          </div>
        </td>
        <td style={{ padding: '12px 16px' }}>
          <button
            onClick={() => onViewEmployee(document.employeeId || '')}
            style={{
              backgroundColor: 'transparent',
              color: '#2196f3',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '14px'
            }}
          >
            {document.employeeName}
          </button>
        </td>
        <td style={{ padding: '12px 16px' }}>{document.type}</td>
        <td style={{ padding: '12px 16px' }}>{new Date(document.uploadDate).toLocaleDateString()}</td>
        <td style={{ padding: '12px 16px' }}>
          {document.expiryDate ? (
            <div>
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '500',
                ...getStatusBadgeStyle(document.expiryDate)
              }}>
                {daysUntil !== null && daysUntil < 0
                  ? 'Expired'
                  : daysUntil !== null && daysUntil <= 30
                    ? 'Expiring Soon'
                    : 'Valid'}
              </span>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                {new Date(document.expiryDate).toLocaleDateString()}
                {daysUntil !== null && (
                  <span>
                    {daysUntil < 0
                      ? ` (${Math.abs(daysUntil)} days ago)`
                      : ` (${daysUntil} days left)`}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>No Expiry</span>
          )}
        </td>
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => onDownload(document.id, `${document.name}_${document.employeeName}.pdf`)}
              style={{
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Download
            </button>
            <button
              onClick={() => onPreview(document.id)}
              style={{
                backgroundColor: '#f5f5f5',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 10px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Preview
            </button>
          </div>
        </td>
      </tr>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if any of these properties change
    return (
      prevProps.document.id === nextProps.document.id &&
      prevProps.document.name === nextProps.document.name &&
      prevProps.document.employeeId === nextProps.document.employeeId &&
      prevProps.document.employeeName === nextProps.document.employeeName &&
      prevProps.document.type === nextProps.document.type &&
      prevProps.document.uploadDate === nextProps.document.uploadDate &&
      prevProps.document.expiryDate === nextProps.document.expiryDate
    );
  }
);

export default DocumentListItem;
