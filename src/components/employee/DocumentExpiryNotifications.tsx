import React from 'react';
import { Document, DocumentStatus } from '../../types/documents';

interface DocumentExpiryNotificationsProps {
  documents: Document[];
}

const DocumentExpiryNotifications: React.FC<DocumentExpiryNotificationsProps> = ({
  documents
}) => {
  // Filter for documents with expiry dates (primarily visa documents)
  const documentsWithExpiry = documents.filter(doc => doc.expiryDate && doc.name.toLowerCase().includes('visa'));

  // Calculate days until expiry and add status
  const processedDocuments = documentsWithExpiry.map(doc => {
    const today = new Date();
    const expiryDate = new Date(doc.expiryDate || '');
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let status: DocumentStatus;
    if (daysUntilExpiry < 0) {
      status = DocumentStatus.EXPIRED;
    } else if (daysUntilExpiry <= 30) {
      status = DocumentStatus.EXPIRING_SOON;
    } else {
      status = DocumentStatus.VALID;
    }

    return {
      ...doc,
      daysUntilExpiry,
      status
    };
  });

  // Sort by urgency (expired first, then expiring, then valid)
  processedDocuments.sort((a, b) => {
    if (a.status === 'expired' && b.status !== 'expired') return -1;
    if (a.status !== 'expired' && b.status === 'expired') return 1;
    if (a.status === 'expiring' && b.status === 'valid') return -1;
    if (a.status === 'valid' && b.status === 'expiring') return 1;
    return a.daysUntilExpiry - b.daysUntilExpiry;
  });

  // Get the most urgent document for the summary
  const mostUrgentDocument = processedDocuments.length > 0 ? processedDocuments[0] : null;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to get status styles
  const getStatusStyles = (status: DocumentStatus | undefined): {
    container: { backgroundColor: string; borderColor: string };
    text: { color: string };
    icon: string;
    title: string;
  } => {
    // Default to valid if status is undefined
    const documentStatus = status || DocumentStatus.VALID;
    switch (documentStatus) {
      case DocumentStatus.VALID:
        return {
          container: { backgroundColor: '#ecfdf5', borderColor: '#10b981' },
          text: { color: '#10b981' },
          icon: '✓',
          title: 'Valid'
        };
      case DocumentStatus.EXPIRING_SOON:
        return {
          container: { backgroundColor: '#fffbeb', borderColor: '#f59e0b' },
          text: { color: '#f59e0b' },
          icon: '⚠️',
          title: 'Expiring Soon'
        };
      case DocumentStatus.EXPIRED:
        return {
          container: { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
          text: { color: '#ef4444' },
          icon: '⚠️',
          title: 'Expired'
        };
      default:
        return {
          container: { backgroundColor: '#ecfdf5', borderColor: '#10b981' },
          text: { color: '#10b981' },
          icon: '✓',
          title: 'Valid'
        };
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h2 style={{ margin: '0 0 16px', color: '#333', fontSize: '1.25rem' }}>
        Document Expiry Notifications
      </h2>

      {mostUrgentDocument ? (
        <>
          {/* Summary Card */}
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${getStatusStyles(mostUrgentDocument.status).container.borderColor}`,
            backgroundColor: getStatusStyles(mostUrgentDocument.status).container.backgroundColor,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              {getStatusStyles(mostUrgentDocument.status).icon}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '500',
                color: getStatusStyles(mostUrgentDocument.status).text.color,
                marginBottom: '4px'
              }}>
                {getStatusStyles(mostUrgentDocument.status).title}: {mostUrgentDocument.name}
              </div>

              <div style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                {mostUrgentDocument.status === DocumentStatus.EXPIRED ? (
                  <span>Expired on {formatDate(mostUrgentDocument.expiryDate || '')} ({Math.abs(mostUrgentDocument.daysUntilExpiry)} days ago)</span>
                ) : (
                  <span>Expires on {formatDate(mostUrgentDocument.expiryDate || '')} ({mostUrgentDocument.daysUntilExpiry} days remaining)</span>
                )}
              </div>
            </div>

            <div>
              <button
                onClick={() => {/* View document function */}}
                style={{
                  backgroundColor: 'white',
                  color: getStatusStyles(mostUrgentDocument.status).text.color,
                  border: `1px solid ${getStatusStyles(mostUrgentDocument.status).container.borderColor}`,
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                View Document
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: '#4b5563', marginBottom: '12px' }}>
              Document Expiry Timeline
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {processedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    gap: '12px'
                  }}
                >
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: getStatusStyles(doc.status).text.color
                  }} />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', color: '#111827' }}>
                      {doc.name}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {doc.status === DocumentStatus.EXPIRED ? (
                        <span>Expired on {formatDate(doc.expiryDate || '')}</span>
                      ) : (
                        <span>Expires on {formatDate(doc.expiryDate || '')}</span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    backgroundColor: getStatusStyles(doc.status).container.backgroundColor,
                    color: getStatusStyles(doc.status).text.color,
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}>
                    {doc.status === DocumentStatus.EXPIRED ? (
                      <span>Expired ({Math.abs(doc.daysUntilExpiry)} days ago)</span>
                    ) : doc.status === DocumentStatus.EXPIRING_SOON ? (
                      <span>Expiring ({doc.daysUntilExpiry} days left)</span>
                    ) : (
                      <span>Valid ({doc.daysUntilExpiry} days left)</span>
                    )}
                  </div>

                  <button
                    onClick={() => {/* View document function */}}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#4b5563',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 10px',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Renewal Instructions */}
          {processedDocuments.some(doc => doc.status === DocumentStatus.EXPIRING_SOON || doc.status === DocumentStatus.EXPIRED) && (
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ fontSize: '1rem', color: '#4b5563', marginBottom: '12px' }}>
                Document Renewal Instructions
              </h3>

              <ol style={{
                margin: 0,
                paddingLeft: '20px',
                fontSize: '0.875rem',
                color: '#4b5563'
              }}>
                <li style={{ marginBottom: '8px' }}>
                  Contact HR department to initiate the renewal process at least 30 days before expiry.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Prepare required documentation (passport, photos, application forms).
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Submit renewal application through the HR portal or in person.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  Track application status through this portal.
                </li>
                <li>
                  Upload new document once received.
                </li>
              </ol>
            </div>
          )}
        </>
      ) : (
        <div style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 8px', fontSize: '1rem' }}>No document expiry notifications</p>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            All your documents are up to date or don't have expiration dates.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentExpiryNotifications;
