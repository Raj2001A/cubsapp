import React, { useState, useCallback } from 'react';
import DocumentUploadModal from './DocumentUploadModal';
import { downloadDocument, previewDocument } from './services/mockDocumentService';
import { useDocuments } from './context/DocumentContext';
import { useEmployees } from './context/EmployeeContext';
import { Document } from './types/documents';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ResponsiveTable from './components/ui/ResponsiveTable';
import ResponsiveFilters from './components/ui/ResponsiveFilters';
import ResponsiveHeader from './components/ui/ResponsiveHeader';
import { FileText, Upload } from 'lucide-react';

// Document types based on requirements
const DOCUMENT_TYPES = [
  { id: 'visa_copy', label: 'Visa Copy (requires expiry date)' },
  { id: 'passport', label: 'Passport Copy' },
  { id: 'emirates_id', label: 'Emirates ID' },
  { id: 'labour_card', label: 'Labour Card' },
  { id: 'medical_insurance', label: 'Medical Insurance' },
  { id: 'workmen_compensation', label: 'Workmen Compensation' },
  { id: 'iloe', label: 'ILOE' },
  { id: 'cicpa', label: 'CICPA' },
  { id: 'temporary_work_permit', label: 'Temporary Work Permit' },
  { id: 'driving_license', label: 'Driving License' },
  { id: 'other', label: 'Other Certificates' }
];

interface DocumentListProps {
  onViewEmployee: (id: string) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ onViewEmployee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Use the document context instead of local state
  const { documents, isLoading } = useDocuments();

  // Get employees for the document upload modal
  const { employees } = useEmployees();

  // Handle document upload
  const handleDocumentUpload = async (documentData: {
    documentType: string;
    expiryDate?: string;
    file: File;
    notes?: string;
    employeeId?: string;
    employeeName?: string;
  }) => {
    try {
      // In a real app, this would send the data to a backend
      console.log('Uploading document:', documentData);

      // Create a new document object
      const docTypeLabel = DOCUMENT_TYPES.find(type => type.id === documentData.documentType)?.label || documentData.documentType;

      // Replaced with a placeholder since addDocument is not defined in context destructure
      // If you have an addDocument function, add it to the context destructure at line 41
      // For now, just log the new document object
      const newDocument = {
        employeeId: documentData.employeeId || '1',
        employeeName: documentData.employeeName || 'John Doe',
        name: docTypeLabel,
        type: documentData.documentType,
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: documentData.expiryDate,
        fileName: documentData.file.name,
        fileSize: documentData.file.size,
        fileType: documentData.file.type,
        notes: documentData.notes,
        status: documentData.expiryDate ? 'VALID' : undefined
      } as Omit<Document, 'id'>;
      console.log('New document (not saved):', newDocument);

      // Show success message
      alert(`Document "${docTypeLabel}" uploaded successfully for ${documentData.employeeName || 'John Doe'}!`);
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    }
  };

  // Get filtered documents using context functions
  const getFilteredDocuments = () => {
    let filteredDocs = documents;

    // Apply search term if entered
    if (searchTerm) {
      filteredDocs = documents.filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Apply filter type
    if (filterType === 'expiring') {
      filteredDocs = documents.filter(doc => doc.expiryDate && new Date(doc.expiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000);
    } else if (filterType === 'expired') {
      filteredDocs = documents.filter(doc => doc.expiryDate && new Date(doc.expiryDate).getTime() - new Date().getTime() < 0);
    }

    return filteredDocs;
  };

  const filteredDocuments = getFilteredDocuments();

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortBy === 'employee') {
      return sortOrder === 'asc'
        ? (a.employeeName || '').localeCompare(b.employeeName || '')
        : (b.employeeName || '').localeCompare(a.employeeName || '');
    }
    if (sortBy === 'type') {
      return sortOrder === 'asc'
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type);
    }
    if (sortBy === 'uploadDate') {
      return sortOrder === 'asc'
        ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
        : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
    if (sortBy === 'expiryDate') {
      // Handle documents without expiry date
      if (!a.expiryDate && !b.expiryDate) return 0;
      if (!a.expiryDate) return sortOrder === 'asc' ? 1 : -1;
      if (!b.expiryDate) return sortOrder === 'asc' ? -1 : 1;

      return sortOrder === 'asc'
        ? new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
        : new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
    }
    return 0;
  });

  // Calculate days until expiry - memoized to prevent unnecessary recalculations
  const getDaysUntilExpiry = useCallback((expiryDate: string | undefined): number | null => {
    if (!expiryDate) return null;

    const expiry = new Date(expiryDate);
    const today = new Date();

    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, []);

  // Get status badge style based on days until expiry - memoized to prevent unnecessary recalculations
  const getStatusBadgeStyle = useCallback((expiryDate: string | undefined): React.CSSProperties => {
    if (!expiryDate) return { backgroundColor: '#f5f5f5', color: '#757575' };

    const daysUntil = getDaysUntilExpiry(expiryDate);

    if (daysUntil === null) return { backgroundColor: '#f5f5f5', color: '#757575' };
    if (daysUntil < 0) return { backgroundColor: '#ffebee', color: '#d32f2f' };
    if (daysUntil <= 30) return { backgroundColor: '#fff8e1', color: '#ffa000' };
    return { backgroundColor: '#e8f5e9', color: '#388e3c' };
  }, [getDaysUntilExpiry]);

  // Define header actions
  const headerActions = [
    {
      label: 'Upload Document',
      onClick: () => setIsUploadModalOpen(true),
      primary: true,
      disabled: isLoading,
      icon: <Upload className="h-4 w-4" />
    }
  ];

  // Define filter options
  const filterOptions = [
    {
      id: 'search',
      label: 'Search',
      type: 'search' as const
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'all', label: 'All Documents' },
        { value: 'expiring', label: 'Expiring Soon (30 days)' },
        { value: 'expired', label: 'Expired' }
      ]
    },
    {
      id: 'sort',
      label: 'Sort By',
      type: 'select' as const,
      options: [
        { value: 'uploadDate-desc', label: 'Upload Date (Newest)' },
        { value: 'uploadDate-asc', label: 'Upload Date (Oldest)' },
        { value: 'expiryDate-asc', label: 'Expiry Date (Soonest)' },
        { value: 'expiryDate-desc', label: 'Expiry Date (Latest)' },
        { value: 'name-asc', label: 'Document Name (A-Z)' },
        { value: 'name-desc', label: 'Document Name (Z-A)' },
        { value: 'employee-asc', label: 'Employee Name (A-Z)' },
        { value: 'employee-desc', label: 'Employee Name (Z-A)' },
        { value: 'type-asc', label: 'Document Type (A-Z)' },
        { value: 'type-desc', label: 'Document Type (Z-A)' }
      ]
    }
  ];

  // Handle filter changes
  const handleFilterChange = (filterId: string, value: string) => {
    if (filterId === 'search') {
      setSearchTerm(value);
    } else if (filterId === 'status') {
      setFilterType(value);
    } else if (filterId === 'sort') {
      const [newSortBy, newSortOrder] = value.split('-');
      setSortBy(newSortBy);
      setSortOrder(newSortOrder);
    }
  };

  return (
    <div className="p-4">
      {/* Responsive Header */}
      <ResponsiveHeader
        title="Documents"
        actions={headerActions}
      />

      {/* Responsive Filters */}
      <ResponsiveFilters
        filters={filterOptions}
        onFilterChange={handleFilterChange}
        filterValues={{
          search: searchTerm,
          status: filterType,
          sort: `${sortBy}-${sortOrder}`
        }}
      />

      {/* Responsive Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-10">
            <LoadingSpinner size="medium" message="Loading documents..." />
          </div>
        ) : (
          <ResponsiveTable
            columns={[
              {
                id: 'document',
                header: 'Document',
                accessor: (doc: Document) => (
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-50 rounded flex items-center justify-center mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="font-medium text-gray-900">{doc.name}</div>
                  </div>
                ),
                minWidth: '200px'
              },
              {
                id: 'employee',
                header: 'Employee',
                accessor: (doc: Document) => (
                  <button
                    onClick={() => onViewEmployee(doc.employeeId || '')}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {doc.employeeName}
                  </button>
                ),
                minWidth: '150px',
                hideOnMobile: false
              },
              {
                id: 'type',
                header: 'Type',
                accessor: (doc: Document) => <span>{doc.type}</span>,
                minWidth: '120px',
                hideOnMobile: true
              },
              {
                id: 'uploadDate',
                header: 'Upload Date',
                accessor: (doc: Document) => (
                  <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                ),
                minWidth: '120px',
                hideOnMobile: true
              },
              {
                id: 'expiryStatus',
                header: 'Expiry Status',
                accessor: (doc: Document) => {
                  const daysUntil = getDaysUntilExpiry(doc.expiryDate);
                  return doc.expiryDate ? (
                    <div>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          ...getStatusBadgeStyle(doc.expiryDate)
                        }}
                      >
                        {daysUntil !== null && daysUntil < 0
                          ? 'Expired'
                          : daysUntil !== null && daysUntil <= 30
                            ? 'Expiring Soon'
                            : 'Valid'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(doc.expiryDate).toLocaleDateString()}
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
                    <span className="text-gray-500 text-sm">No Expiry</span>
                  );
                },
                minWidth: '150px',
                hideOnMobile: false
              },
              {
                id: 'actions',
                header: 'Actions',
                accessor: (doc: Document) => (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadDocument(doc.id, `${doc.name}_${doc.employeeName}.pdf`)}
                      className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => previewDocument(doc.id)}
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                ),
                minWidth: '180px',
                hideOnMobile: false
              }
            ]}
            data={sortedDocuments}
            keyExtractor={(doc: Document) => doc.id}
            emptyMessage="No documents found matching your search."
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleDocumentUpload}
        employees={employees.map(emp => ({ id: emp.id, name: emp.name }))}
      />
    </div>
  );
};

export default DocumentList;
