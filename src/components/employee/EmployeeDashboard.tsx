import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Mail,
  Upload,
  FileText,
  Trash2
} from 'lucide-react';
import type { EmployeeDocument } from '../../types';

const mockEmployeeData = {
  documents: [
    {
      id: '1',
      name: 'Work Visa.pdf',
      type: 'application/pdf',
      uploadedAt: '2024-01-15',
      category: 'visa'
    },
    {
      id: '2',
      name: 'Passport.pdf',
      type: 'application/pdf',
      uploadedAt: '2024-01-10',
      category: 'passport'
    },
    {
      id: '3',
      name: 'Employment Contract.pdf',
      type: 'application/pdf',
      uploadedAt: '2023-12-20',
      category: 'contract'
    }
  ] as EmployeeDocument[]
};

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<EmployeeDocument[]>(mockEmployeeData.documents);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newDocuments: EmployeeDocument[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      uploadedAt: new Date().toISOString().split('T')[0],
      category: 'other'
    }));

    setDocuments(prev => [...prev, ...newDocuments]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Employee Dashboard</h2>
          
          {/* Profile Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{user?.name || 'Not set'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email || 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Documents</h3>
            
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer mb-6
                ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">
                {isDragActive
                  ? 'Drop the files here...'
                  : 'Drag and drop files here, or click to select files'}
              </p>
            </div>

            {/* Documents List */}
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded on {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;