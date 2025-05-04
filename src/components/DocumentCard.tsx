import React from 'react';
import { Document } from '../hooks/useEmployeeDocuments';
import { Button } from './ui/Button';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentCardProps {
  document: Document;
  onEdit: () => void;
  onDelete: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onEdit,
  onDelete,
}) => {
  const isExpired = document.expiryDate
    ? new Date(document.expiryDate) < new Date()
    : false;

  return (
    <div
      className={`flex items-center p-4 rounded-lg shadow-sm border transition-all hover:shadow-md ${
        isExpired ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center">
          <span className="text-xl font-medium">{document.type.charAt(0).toUpperCase()}</span>
        </div>
      </div>
      <div className="ml-4 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{document.name}</p>
        <p className="text-sm text-gray-500 truncate">{document.category}</p>
        {document.expiryDate && (
          <p
            className={`text-sm ${
              isExpired ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            Expires: {format(new Date(document.expiryDate), 'MMM d, yyyy')}
          </p>
        )}
      </div>
      <div className="ml-4 flex-shrink-0 flex space-x-2">
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Pencil className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
};
