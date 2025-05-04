import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Calendar, Clock } from 'lucide-react';
import DocumentService from '../../services/documentService';
import { Document, DocumentStatus, DocumentType, getDocumentTypeLabel, getDaysUntilExpiry } from '../../types/documents';

interface DocumentExpiryRemindersProps {
  limit?: number;
}

const DocumentExpiryReminders: React.FC<DocumentExpiryRemindersProps> = ({ limit = 5 }) => {
  const [expiringDocuments, setExpiringDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const documentService = new DocumentService();

  useEffect(() => {
    const fetchExpiringDocuments = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get all documents
        const allDocuments = await documentService.getDocumentsByVisaId('visa-123');
        
        // Utility to map legacy string status to DocumentStatus enum
        function mapStatusToEnum(status: string | undefined): DocumentStatus | undefined {
          switch (status) {
            case 'valid':
              return DocumentStatus.VALID;
            case 'expired':
              return DocumentStatus.EXPIRED;
            case 'pending':
              return DocumentStatus.PENDING;
            case 'expiring':
              return DocumentStatus.EXPIRING_SOON;
            default:
              return undefined;
          }
        }

        const expiring = allDocuments
          .map(doc => {
            // Map legacy status string to enum if necessary
            if (doc.metadata && typeof doc.metadata.status === 'string') {
              return {
                ...doc,
                metadata: {
                  ...doc.metadata,
                  status: mapStatusToEnum(doc.metadata.status)
                }
              };
            }
            return doc;
          })
          .filter(doc => {
            if (!doc.metadata?.expiryDate) return false;
            // Ensure expiryDate is a string, as getDaysUntilExpiry expects string | undefined
            const expiryDate = typeof doc.metadata.expiryDate === 'string' ? doc.metadata.expiryDate : undefined;
            const daysUntil = getDaysUntilExpiry(expiryDate);
            return daysUntil !== null && daysUntil <= 30; // Show documents expiring in 30 days or already expired
          })
          .sort((a, b) => {
            // Sort by days until expiry (ascending)
            const expiryDateA = typeof a.metadata?.expiryDate === 'string' ? a.metadata.expiryDate : undefined;
            const expiryDateB = typeof b.metadata?.expiryDate === 'string' ? b.metadata.expiryDate : undefined;
            const daysA = getDaysUntilExpiry(expiryDateA) || 0;
            const daysB = getDaysUntilExpiry(expiryDateB) || 0;
            return daysA - daysB;
          })
          .slice(0, limit);
        
        setExpiringDocuments(expiring);
      } catch (error) {
        console.error('Failed to fetch expiring documents:', error);
        setError('Failed to load document expiry information');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExpiringDocuments();
  }, [limit]);

  const getExpiryStatusClass = (daysUntil: number | null) => {
    if (daysUntil === null) return 'text-gray-500';
    if (daysUntil < 0) return 'text-red-600';
    if (daysUntil <= 7) return 'text-red-600';
    if (daysUntil <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getExpiryStatusText = (daysUntil: number | null) => {
    if (daysUntil === null) return 'No expiry date';
    if (daysUntil < 0) return `Expired ${Math.abs(daysUntil)} days ago`;
    if (daysUntil === 0) return 'Expires today';
    if (daysUntil === 1) return 'Expires tomorrow';
    return `Expires in ${daysUntil} days`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (expiringDocuments.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents expiring soon</h3>
        <p className="mt-1 text-sm text-gray-500">
          All documents are valid for more than 30 days.
        </p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {expiringDocuments.map((document, index) => {
          const expiryDate = typeof document.metadata?.expiryDate === 'string' ? document.metadata.expiryDate : undefined;
          const daysUntil = getDaysUntilExpiry(expiryDate);
          const statusClass = getExpiryStatusClass(daysUntil);
          const statusText = getExpiryStatusText(daysUntil);
          const isLast = index === expiringDocuments.length - 1;
          
          return (
            <li key={document.id}>
              <div className={`relative pb-8 ${!isLast ? 'border-l border-gray-200 ml-4' : ''}`}>
                <div className="relative flex items-start space-x-3">
                  <div>
                    <div className={`relative px-1 ${statusClass}`}>
                      <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center ring-8 ring-white">
                        <Clock className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <Link
                          to={`/documents?id=${document.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600"
                        >
                          {document.metadata?.documentType 
                            ? getDocumentTypeLabel(document.metadata.documentType as DocumentType) 
                            : document.name}
                        </Link>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-500">
                        {document.metadata?.documentNumber 
                          ? `#${document.metadata.documentNumber}` 
                          : document.name}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-700">
                      <p className={statusClass}>{statusText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DocumentExpiryReminders;
