import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import DocumentService from '../../services/documentService';

import { DocumentMetadata, DocumentStatus } from '../../types/documents';

interface DocumentMetadataModalProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (documentId: string, metadata: DocumentMetadata) => void;
}

const documentService = new DocumentService();

const DocumentMetadataModal: React.FC<DocumentMetadataModalProps> = ({
  documentId,
  isOpen,
  onClose,
  onSave
}) => {
  const [metadata, setMetadata] = useState<DocumentMetadata>({});
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDocumentMetadata();
    }
  }, [isOpen, documentId]);

  const loadDocumentMetadata = async () => {
    try {
      setIsLoading(true);
      const document = await documentService.getDocumentById(documentId);
      if (document?.metadata) {
        setMetadata(document.metadata);
      }
    } catch (error) {
      console.error('Failed to load document metadata:', error);
      setError('Failed to load document metadata');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await documentService.updateDocumentMetadata(documentId, metadata);
      onSave(documentId, metadata);
      onClose();
    } catch (error) {
      console.error('Failed to save document metadata:', error);
      setError('Failed to save document metadata');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !metadata.tags?.includes(newTag.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Edit Document Metadata</h3>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-500"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {error && (
          <div className="px-6 py-4 bg-red-50">
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

        <div className="px-6 py-4 space-y-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                rows={3}
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={metadata.description || ''}
                onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={metadata.status || DocumentStatus.VALID}
              onChange={(e) => setMetadata(prev => ({ ...prev, status: e.target.value as DocumentStatus }))}
            >
              <option value={DocumentStatus.VALID}>Valid</option>
              <option value={DocumentStatus.EXPIRED}>Expired</option>
              <option value={DocumentStatus.PENDING}>Pending</option>
            </select>
          </div>

          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                id="expiryDate"
                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={metadata.expiryDate || ''}
                onChange={(e) => setMetadata(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="tags"
                className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full min-w-0 rounded-none rounded-l-md sm:text-sm border-gray-300"
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-r-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleAddTag}
              >
                Add
              </button>
            </div>
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 inline-flex items-center p-0.5 hover:bg-primary-200 rounded-full focus:outline-none"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentMetadataModal;