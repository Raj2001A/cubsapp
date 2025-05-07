import React from 'react';
import { useParams } from 'react-router-dom';
import { useEmployeeDocuments } from '../hooks/useEmployeeDocuments';
import { DocumentCategory } from '../types/documents';
import { DocumentCard } from '../components/DocumentCard';
import Button from '../components/ui/Button';
import { Plus } from 'lucide-react';

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'passport',
  'visa',
  'emiratesId',
  'workPermit',
  'medical',
  'other'
];

export const EmployeeDocuments: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const { data: documents, isLoading } = useEmployeeDocuments(employeeId);

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  const formatName = (str: string): string => {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Documents</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </div>

      <div className="space-y-6">
        {DOCUMENT_CATEGORIES.map((category) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-4">{formatName(category)}</h3>
            <div className="overflow-x-auto">
              <div className="flex gap-4">
                {documents?.filter(doc => doc.category === category).map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    document={doc}
                    onEdit={() => console.log('Edit document', doc.id)}
                    onDelete={() => console.log('Delete document', doc.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
