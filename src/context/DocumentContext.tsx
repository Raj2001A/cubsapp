import React, { createContext, useContext, useState, useMemo, ReactNode, useRef, useEffect } from 'react';
import { Document, DocumentStatus, DocumentType } from '../types/document';
import { useUI } from './UIContext';
import { OperationType, ErrorSeverity } from '../types/ui';

interface DocumentContextState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  addDocument: (document: Omit<Document, 'id'> & { file: File; expiryDate: string }) => Promise<Document>;
  updateDocument: (id: string, document: Partial<Document> & { file: File; expiryDate: string; employeeId: string }) => Promise<Document>;
  deleteDocument: (id: string) => Promise<boolean>;
  getDocumentById: (id: string) => Document | undefined;
  searchDocuments: (query: string) => Document[];
  filterDocumentsByType: (type: DocumentType) => Document[];
  filterDocumentsByStatus: (status: DocumentStatus) => Document[];
  filterDocumentsByEmployee: (employeeId: string) => Document[];
  getExpiringDocuments: (daysThreshold: number) => Document[];
  importDocuments: (documents: Document[]) => Promise<boolean>;
  exportDocuments: () => Document[];
  setDocumentsFromEmployees: (employeeDocs: Document[]) => void;
}

const DocumentContext = createContext<DocumentContextState | undefined>(undefined);

interface DocumentProviderProps {
  children: ReactNode;
  isAuthenticated?: boolean;
}

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }: DocumentProviderProps) => {
  const { showToast, addError, setLoading } = useUI();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading] = useState(false);
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  if (process.env.NODE_ENV === 'development' && renderCountRef.current % 5 === 0) {
    console.log('[DocumentProvider] Rendered', {
      documents: documents.length,
      renderCount: renderCountRef.current
    });
  }

  // Allow setting documents from outside (from EmployeeContext)
  const setDocumentsFromEmployees = (employeeDocs: Document[]) => {
    if (JSON.stringify(employeeDocs.map(d => d.id)) !== JSON.stringify(documents.map(d => d.id))) {
      setDocuments(employeeDocs);
    }
  };

  useEffect(() => {
    window.documentContextActions = {
      setDocumentsFromEmployees,
    };
    return () => {
      delete window.documentContextActions;
    };
  }, []);

  const addDocument = async (document: Omit<Document, 'id'> & { file: File; expiryDate: string }): Promise<Document> => {
    try {
      setLoading(OperationType.DOCUMENTS, true);
      
      // Mock implementation - in a real app you would call your API
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        name: document.name,
        type: document.type,
        status: DocumentStatus.VALID,
        uploadDate: new Date().toISOString(),
        expiryDate: document.expiryDate,
        employeeId: document.employeeId,
        url: URL.createObjectURL(document.file)
      };
      
      setDocuments(prev => [...prev, newDoc]);
      showToast('Document added successfully');
      
      return newDoc;
    } catch (error) {
      console.error('Error adding document:', error);
      addError('Failed to add document', ErrorSeverity.ERROR);
      throw error;
    } finally {
      setLoading(OperationType.DOCUMENTS, false);
    }
  };

  const updateDocument = async (id: string, document: Partial<Document> & { file: File; expiryDate: string; employeeId: string }): Promise<Document> => {
    try {
      setLoading(OperationType.DOCUMENTS, true);
      
      // Find existing document
      const existingDoc = documents.find(d => d.id === id);
      if (!existingDoc) {
        throw new Error(`Document with ID ${id} not found`);
      }
      
      // Create updated document
      const updatedDoc: Document = {
        ...existingDoc,
        ...document,
        url: URL.createObjectURL(document.file)
      };
      
      // Update documents state
      setDocuments(prev => prev.map(d => d.id === id ? updatedDoc : d));
      
      showToast('Document updated successfully');
      
      return updatedDoc;
    } catch (error) {
      console.error('Error updating document:', error);
      addError('Failed to update document', ErrorSeverity.ERROR);
      throw error;
    } finally {
      setLoading(OperationType.DOCUMENTS, false);
    }
  };

  const deleteDocument = async (id: string): Promise<boolean> => {
    try {
      setLoading(OperationType.DOCUMENTS, true);
      
      // Find document to delete
      const docToDelete = documents.find(d => d.id === id);
      if (!docToDelete) {
        throw new Error(`Document with ID ${id} not found`);
      }
      
      // Remove document from state
      setDocuments(prev => prev.filter(d => d.id !== id));
      
      showToast('Document deleted successfully');
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      addError('Failed to delete document', ErrorSeverity.ERROR);
      return false;
    } finally {
      setLoading(OperationType.DOCUMENTS, false);
    }
  };

  const getDocumentById = (id: string): Document | undefined => {
    return documents.find(d => d.id === id);
  };

  const searchDocuments = (query: string): Document[] => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return documents;
    
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm) ||
      doc.type.toLowerCase().includes(searchTerm)
    );
  };

  const filterDocumentsByType = (type: DocumentType): Document[] => {
    return documents.filter(doc => doc.type === type);
  };

  const filterDocumentsByStatus = (status: DocumentStatus): Document[] => {
    return documents.filter(doc => doc.status === status);
  };

  const filterDocumentsByEmployee = (employeeId: string): Document[] => {
    return documents.filter(doc => doc.employeeId === employeeId);
  };

  const getExpiringDocuments = (daysThreshold: number): Document[] => {
    const now = new Date();
    const thresholdDate = new Date();
    thresholdDate.setDate(now.getDate() + daysThreshold);
    
    return documents.filter(doc => {
      if (!doc.expiryDate) return false;
      
      const expiryDate = new Date(doc.expiryDate);
      return expiryDate <= thresholdDate && expiryDate >= now;
    });
  };

  const importDocuments = async (docsToImport: Document[]): Promise<boolean> => {
    try {
      setLoading(OperationType.DOCUMENTS, true);
      setDocuments(prev => [...prev, ...docsToImport]);
      
      showToast('Documents imported successfully');
      
      return true;
    } catch (error) {
      console.error('Error importing documents:', error);
      addError('Failed to import documents', ErrorSeverity.ERROR);
      return false;
    } finally {
      setLoading(OperationType.DOCUMENTS, false);
    }
  };

  const exportDocuments = (): Document[] => {
    return documents;
  };

  const contextValue = useMemo<DocumentContextState>(() => ({
    documents,
    isLoading,
    error: null,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocumentById,
    searchDocuments,
    filterDocumentsByType,
    filterDocumentsByStatus,
    filterDocumentsByEmployee,
    getExpiringDocuments,
    importDocuments,
    exportDocuments,
    setDocumentsFromEmployees
  }), [documents, isLoading]);

  return (
    <DocumentContext.Provider value={contextValue}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};
