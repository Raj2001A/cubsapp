import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, AlertCircle, FileText } from 'lucide-react';
import {
  DocumentType,
  DocumentStatus,
  EXPIRY_TRACKED_DOCUMENTS,
  getDocumentTypeLabel
} from '../../types/document';
import DocumentService from '../../services/documentService';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
  visaId: string;
  onSuccess: () => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  visaId,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>(DocumentType.PASSPORT_COPY);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>('');
  const [documentNumber, setDocumentNumber] = useState<string>('');
  const [issuingAuthority, setIssuingAuthority] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const documentService = new DocumentService();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!documentType) {
      setError('Please select a document type');
      return;
    }

    // Validate expiry date for documents that require it
    if (EXPIRY_TRACKED_DOCUMENTS.includes(documentType) && !expiryDate) {
      setError(`Please enter an expiry date for this ${documentType === DocumentType.VISA_COPY ? 'visa' : 'document'}`);
      return;
    }

    // Validate that expiry date is in the future
    if (expiryDate) {
      const expiryDateObj = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expiryDateObj < today) {
        setError('Expiry date cannot be in the past');
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Prepare metadata
      const metadata = {
        documentType,
        status: DocumentStatus.VALID,
        description: description || selectedFile.name,
        employeeId,
        expiryDate: expiryDate || undefined,
        issueDate: issueDate || undefined,
        documentNumber: documentNumber || undefined,
        issuingAuthority: issuingAuthority || undefined
      };

      // Upload document
      await documentService.uploadDocument(visaId, selectedFile, {
        metadata,
        compress: true,
        encrypt: true,
        virusScan: true,
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      });

      // Reset form and close modal
      setSelectedFile(null);
      setDocumentType(DocumentType.PASSPORT_COPY);
      setExpiryDate('');
      setIssueDate('');
      setDocumentNumber('');
      setIssuingAuthority('');
      setDescription('');
      setUploadProgress(0);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Upload Document</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
            disabled={isUploading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
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

            <div className="mb-4">
              <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
                Document Type *
              </label>
              <select
                id="documentType"
                name="documentType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                required
              >
                {Object.values(DocumentType).map((type) => (
                  <option key={type} value={type}>
                    {getDocumentTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document File *
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-md p-6 ${
                  isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                } hover:border-primary-500 transition-colors cursor-pointer`}
              >
                <input {...getInputProps()} />
                {selectedFile ? (
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-primary-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500">
                      Drag and drop a file here, or click to select a file
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      PDF, JPG, PNG, DOC, DOCX up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  {EXPIRY_TRACKED_DOCUMENTS.includes(documentType) ? (
                    <>
                      Expiry Date <span className="text-red-500">*</span>
                      {documentType === DocumentType.VISA_COPY && (
                        <span className="ml-1 text-xs text-blue-600">(Required for visa documents)</span>
                      )}
                    </>
                  ) : (
                    'Expiry Date (optional)'
                  )}
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required={EXPIRY_TRACKED_DOCUMENTS.includes(documentType)}
                  min={new Date().toISOString().split('T')[0]} // Can't expire in the past
                />
              </div>
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
                  Issue Date
                </label>
                <input
                  type="date"
                  id="issueDate"
                  name="issueDate"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Can't be issued in the future
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label htmlFor="documentNumber" className="block text-sm font-medium text-gray-700">
                  Document Number
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  name="documentNumber"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="issuingAuthority" className="block text-sm font-medium text-gray-700">
                  Issuing Authority
                </label>
                <input
                  type="text"
                  id="issuingAuthority"
                  name="issuingAuthority"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={issuingAuthority}
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              className="mr-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>

        {/* Upload Progress */}
        {isUploading && (
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Uploading document...</span>
              <span className="text-sm text-gray-500">{uploadProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadModal;
