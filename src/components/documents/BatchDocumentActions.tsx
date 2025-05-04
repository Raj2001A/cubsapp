import React, { useState } from 'react';

import { Document } from '../../types/documents';

interface BatchDocumentActionsProps {
  selectedDocuments: Document[];
  onDownload: (documentIds: string[]) => void;
  onDelete: (documentIds: string[]) => void;
  onCategorize: (documentIds: string[], category: string) => void;
  onClearSelection: () => void;
}

const BatchDocumentActions: React.FC<BatchDocumentActionsProps> = ({
  selectedDocuments,
  onDownload,
  onDelete,
  onCategorize,
  onClearSelection
}) => {
  const [category, setCategory] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Get document IDs
  const documentIds = selectedDocuments.map(doc => doc.id);

  // Handle download
  const handleDownload = () => {
    onDownload(documentIds);
  };

  // Handle delete
  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    onDelete(documentIds);
    setShowConfirmDelete(false);
  };

  // Handle categorize
  const handleCategorize = () => {
    if (category) {
      onCategorize(documentIds, category);
      setCategory('');
    }
  };

  return (
    <div style={{
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '20px',
      display: selectedDocuments.length > 0 ? 'block' : 'none'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ fontWeight: '500', color: '#111827' }}>
          {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
        </div>

        <button
          onClick={onClearSelection}
          style={{
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Clear Selection
        </button>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleDownload}
          style={{
            backgroundColor: '#e0f2fe',
            color: '#0284c7',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>⬇️</span> Download
        </button>

        <button
          onClick={handleDelete}
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <span>🗑️</span> Delete
        </button>

        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem'
            }}
          >
            <option value="">Select Category</option>
            <option value="identity">Identity</option>
            <option value="visa">Visa</option>
            <option value="certification">Certification</option>
            <option value="medical">Medical</option>
            <option value="other">Other</option>
          </select>

          <button
            onClick={handleCategorize}
            disabled={!category}
            style={{
              backgroundColor: category ? '#e0f2fe' : '#f3f4f6',
              color: category ? '#0284c7' : '#9ca3af',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: category ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem'
            }}
          >
            Categorize
          </button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showConfirmDelete && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fee2e2',
          borderRadius: '4px',
          border: '1px solid #f87171'
        }}>
          <p style={{ margin: '0 0 12px', color: '#b91c1c', fontWeight: '500' }}>
            Are you sure you want to delete {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''}?
          </p>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowConfirmDelete(false)}
              style={{
                backgroundColor: '#f3f4f6',
                color: '#4b5563',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Cancel
            </button>

            <button
              onClick={confirmDelete}
              style={{
                backgroundColor: '#b91c1c',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDocumentActions;
