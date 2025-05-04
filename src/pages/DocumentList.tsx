import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Download, Eye, X, Filter } from 'lucide-react';

// Document type definition
interface Document {
  id: string;
  name: string;
  type: string;
  expiryDate?: string;
  employeeName?: string;
}

const DocumentList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // TODO: Replace with actual document data from API
  const documents: Document[] = [
    { id: '1', name: 'John Doe Passport', type: 'passport', expiryDate: '2025-12-31', employeeName: 'John Doe' },
    { id: '2', name: 'Jane Smith Visa', type: 'visa', expiryDate: '2024-06-15', employeeName: 'Jane Smith' },
    { id: '3', name: 'Bob Johnson Emirates ID', type: 'emirates_id', employeeName: 'Bob Johnson' },
    { id: '4', name: 'Sarah Lee License', type: 'license', expiryDate: '2026-03-22', employeeName: 'Sarah Lee' },
    { id: '5', name: 'Mike Brown Certificate', type: 'certificate', employeeName: 'Mike Brown' },
    { id: '6', name: 'Anna Davis Contract', type: 'contract', employeeName: 'Anna Davis' },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.employeeName && doc.employeeName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    return matchesSearch && doc.type === filter;
  });

  const documentTypes = [
    { value: 'all', label: 'All Documents' },
    { value: 'passport', label: 'Passports' },
    { value: 'visa', label: 'Visas' },
    { value: 'emirates_id', label: 'Emirates IDs' },
    { value: 'license', label: 'Licenses' },
    { value: 'certificate', label: 'Certificates' },
    { value: 'contract', label: 'Contracts' }
  ];

  return (
    <div className="p-6 min-h-screen"
         style={{ 
           backgroundImage: 'url(/bg2.jpg)', 
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Document Management</h1>
          <button
            onClick={() => navigate('/documents/new')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Document
          </button>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search documents by name or employee..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="md:w-1/3">
            <div className="flex items-center">
              <Filter className="text-gray-400 w-4 h-4 mr-2" />
              <select
                className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredDocuments.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No documents found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">{doc.name}</div>
                      <div className="text-sm text-gray-500">{doc.employeeName}</div>
                    </div>
                  </div>
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {doc.type.replace('_', ' ')}
                  </div>
                </div>
                
                {doc.expiryDate && (
                  <div className="mt-4 text-sm">
                    <span className="text-gray-600">Expires: </span>
                    <span className={`font-medium ${new Date(doc.expiryDate) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                      {new Date(doc.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="mt-4 flex space-x-3 border-t pt-4">
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;
