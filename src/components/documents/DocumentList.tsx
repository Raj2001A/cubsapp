import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FileText, Search, Plus, Download, Trash2, AlertCircle, Edit2, CheckCircle, Clock, Shield, Lock, FileCheck, RefreshCw } from 'lucide-react';
import { FixedSizeList as List } from 'react-window';
// @ts-ignore
// If you see a type error for 'react-window', install its types:
// npm install --save-dev @types/react-window
// Or add the following to a .d.ts file:
// declare module 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import DocumentService from '../../services/documentService';
import DocumentMetadataModal from './DocumentMetadataModal';
import DocumentUploadModal from './DocumentUploadModal';
import { useAuth } from '../../context/AuthContext';
import { AppError } from '../../utils/errorUtils';
import { AccessLogEntry, DocumentStatus, Document, DocumentMetadata, formatFileSize } from '../../types/document';

const documentService = new DocumentService();

const ROW_HEIGHT = 72; // Height of each row in pixels

// Document Row Component
interface DocumentRowProps {
  data: {
    documents: Document[];
    onDownload: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
    onViewAccessLog: (id: string) => void;
    operationInProgress: { type: string | null; documentId: string | null };
    formatFileSize: (bytes: number | undefined) => string;
    getStatusBadgeClass: (status: string) => string;
  };
  index: number;
  style: React.CSSProperties;
}

const DocumentRow: React.FC<DocumentRowProps> = React.memo(({ data, index, style }) => {
  const document = data.documents[index];
  const isOperationInProgress = (type: string, documentId: string) =>
    data.operationInProgress.type === type && data.operationInProgress.documentId === documentId;

  return (
    <div style={style} className="flex items-center border-b border-gray-200">
      <div className="flex-1 px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{document.name}</div>
            <div className="text-sm text-gray-500">v{document.version}</div>
          </div>
        </div>
      </div>
      <div className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{document.type}</div>
      </div>
      <div className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{data.formatFileSize(document.size)}</div>
        {document.metadata?.compressionRatio && (
          <div className="text-xs text-gray-500">
            Compressed: {(document.metadata.compressionRatio * 100).toFixed(0)}%
          </div>
        )}
      </div>
      <div className="px-6 py-4 whitespace-nowrap">
        <div>
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${data.getStatusBadgeClass(document.metadata?.status || DocumentStatus.VALID)}`}>
            {document.metadata?.status ? document.metadata.status.charAt(0).toUpperCase() + document.metadata.status.slice(1) : 'Valid'}
          </span>
          {document.metadata?.expiryDate && (
            <div className="mt-1 text-xs">
              {new Date(document.metadata.expiryDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {document.isEncrypted && (
            <Lock className="h-4 w-4 text-primary-600" />
          )}
          {document.metadata?.virusScanStatus === 'clean' && (
            <Shield className="h-4 w-4 text-green-600" />
          )}
          <FileCheck className="h-4 w-4 text-primary-600" />
          {document.metadata?.documentType && (
            <div className="text-xs text-gray-500">
              {document.metadata.documentType}
            </div>
          )}
        </div>
      </div>
      <div className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(document.uploadDate).toLocaleDateString()}
      </div>
      <div className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="text-primary-600 hover:text-primary-900 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => data.onDownload(document.id)}
            disabled={isOperationInProgress('download', document.id)}
          >
            {isOperationInProgress('download', document.id) ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            ) : (
              <Download className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            className="text-primary-600 hover:text-primary-900"
            onClick={() => data.onEdit(document.id)}
          >
            <Edit2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="text-primary-600 hover:text-primary-900 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => data.onViewAccessLog(document.id)}
            disabled={isOperationInProgress('access-log', document.id)}
          >
            {isOperationInProgress('access-log', document.id) ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            ) : (
              <Clock className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => data.onDelete(document.id)}
            disabled={isOperationInProgress('delete', document.id)}
          >
            {isOperationInProgress('delete', document.id) ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

DocumentRow.displayName = 'DocumentRow';

const DocumentList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [isMetadataModalOpen, setIsMetadataModalOpen] = useState<boolean>(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const { user } = useAuth();
  const [showAccessLog, setShowAccessLog] = useState<string | null>(null);
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [operationInProgress, setOperationInProgress] = useState<{ type: string | null; documentId: string | null }>({ type: null, documentId: null });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();

  const handleUploadSuccess = useCallback(() => {
    // Refresh the documents list
    loadDocuments();
  }, []);

  const handleOpenUploadModal = useCallback((employeeId?: string) => {
    setSelectedEmployeeId(employeeId);
    setIsUploadModalOpen(true);
  }, []);

  const handleDownloadDocument = useCallback(async (documentId: string) => {
    setOperationInProgress({ type: 'download', documentId });
    setError(null);

    try {
      // Use the document service to download from B2
      await documentService.downloadDocument(documentId, user?.id || 'unknown');
    } catch (error) {
      console.error('Download failed:', error);
      setError(error instanceof AppError ? error.message : 'Failed to download document');
    } finally {
      setOperationInProgress({ type: null, documentId: null });
    }
  }, [user?.id]);

  const handleDeleteDocument = useCallback(async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setOperationInProgress({ type: 'delete', documentId });
    setError(null);

    try {
      await documentService.deleteDocument(documentId, user?.id || 'unknown');
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Delete failed:', error);
      setError(error instanceof AppError ? error.message : 'Failed to delete document');
    } finally {
      setOperationInProgress({ type: null, documentId: null });
    }
  }, [user?.id]);

  const handleEditMetadata = useCallback((documentId: string) => {
    setSelectedDocumentId(documentId);
    setIsMetadataModalOpen(true);
  }, []);

  const handleViewAccessLog = useCallback(async (documentId: string) => {
    setOperationInProgress({ type: 'access-log', documentId });
    setError(null);

    try {
      const log = await documentService.getDocumentAccessLog(documentId);
      setAccessLog(log);
      setShowAccessLog(documentId);
    } catch (error) {
      console.error('Failed to load access log:', error);
      setError(error instanceof AppError ? error.message : 'Failed to load access log');
    } finally {
      setOperationInProgress({ type: null, documentId: null });
    }
  }, []);

  const handleMetadataSave = useCallback(async (documentId: string, metadata: DocumentMetadata) => {
    try {
      setOperationInProgress({ type: 'metadata-save', documentId });
      await documentService.updateDocumentMetadata(documentId, metadata);
      setIsMetadataModalOpen(false);
      setSelectedDocumentId(null);
      loadDocuments();
    } catch (error) {
      setError('Failed to save metadata');
    } finally {
      setOperationInProgress({ type: null, documentId: null });
    }
  }, []);

  const loadDocuments = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const docs = await documentService.getDocumentsByVisaId('visa-123');
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setError('Failed to load documents. Please try again later.');
    } finally {
      if (showLoadingIndicator) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    loadDocuments(false);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Memoize filtered documents
  const filteredDocuments = useMemo(() =>
    documents.filter(document => {
      const matchesSearch = document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        document.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filterType === 'all' || document.type === filterType;
      const matchesStatus = filterStatus === 'all' || document.metadata?.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    }),
    [documents, searchTerm, filterType, filterStatus]
  );

  // Use the formatFileSize utility from the unified Document interface
  const formatFileSizeCallback = useCallback((bytes: number | undefined) => {
    return formatFileSize(bytes);
  }, []);

  const getStatusBadgeClass = useCallback((status: string) => {
    switch (status) {
      case DocumentStatus.VALID:
        return 'bg-green-100 text-green-800';
      case DocumentStatus.EXPIRING_SOON:
        return 'bg-yellow-100 text-yellow-800';
      case DocumentStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      case DocumentStatus.PENDING:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Document Management</h1>
        <div className="flex space-x-2">
          <button
            type="button"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={() => handleOpenUploadModal()}
          >
            <Plus className="h-5 w-5 mr-2" />
            Upload Document
          </button>
        </div>
      </div>

      {error && (
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
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search documents
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="sm:w-48">
              <label htmlFor="type" className="sr-only">
                Filter by type
              </label>
              <select
                id="type"
                name="type"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="application/pdf">PDF</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="application/msword">DOC</option>
                <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">DOCX</option>
              </select>
            </div>
            <div className="sm:w-48">
              <label htmlFor="status" className="sr-only">
                Filter by status
              </label>
              <select
                id="status"
                name="status"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="valid">Valid</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-hidden">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                      ? 'Try adjusting your search or filter criteria'
                      : 'Get started by uploading a new document'}
                  </p>
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all' ? (
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => {
                          setSearchTerm('');
                          setFilterType('all');
                          setFilterStatus('all');
                        }}
                      >
                        Clear filters
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        onClick={() => handleOpenUploadModal()}
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Upload Document
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Document
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Security
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Upload Date
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                  <div style={{ height: 'calc(100vh - 400px)', minHeight: '400px' }}>
                    <AutoSizer>
                      {({ height, width }) => (
                        <List
                          height={height}
                          itemCount={filteredDocuments.length}
                          itemSize={ROW_HEIGHT}
                          width={width}
                          itemData={{
                            documents: filteredDocuments,
                            onDownload: handleDownloadDocument,
                            onDelete: handleDeleteDocument,
                            onEdit: handleEditMetadata,
                            onViewAccessLog: handleViewAccessLog,
                            operationInProgress,
                            formatFileSize: formatFileSizeCallback,
                            getStatusBadgeClass
                          }}
                        >
                          {DocumentRow}
                        </List>
                      )}
                    </AutoSizer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        employeeId={selectedEmployeeId}
        visaId="visa-123"
        onSuccess={handleUploadSuccess}
      />

      {/* Upload Progress */}
      <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-md w-64">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Uploading document...</span>
          <span className="text-sm text-gray-500">0%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-300"
            style={{ width: '0%' }}
          />
        </div>
      </div>

      {/* Access Log Modal */}
      {showAccessLog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Document Access Log</h3>
            </div>
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {accessLog.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No access logs found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This document has not been accessed yet.
                  </p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {accessLog.map((entry, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entry.ipAddress || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={() => setShowAccessLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metadata Modal */}
      {selectedDocumentId && (
        <DocumentMetadataModal
          documentId={selectedDocumentId}
          isOpen={isMetadataModalOpen}
          onClose={() => {
            setIsMetadataModalOpen(false);
            setSelectedDocumentId(null);
          }}
          onSave={handleMetadataSave}
        />
      )}

      {/* Email Status Notifications */}
      <div className="rounded-md p-4 bg-green-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">Email sent successfully</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentList;