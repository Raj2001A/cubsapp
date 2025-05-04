import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeService, EmployeeDocument } from './services/employeeService';
import { ErrorSeverity, OperationType } from './types/ui';
import EmployeeProfileForm from './components/EmployeeProfileForm';
import EmployeeDocuments from './components/EmployeeDocuments';
import VisaExpiryInfo from './components/VisaExpiryInfo';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useUI } from './context/UIContext';

const EmployeeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setLoading, addError, showToast } = useUI();
  const [mounted, setMounted] = useState(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => setMounted(false);
  }, []);

  // Redirect if no ID is provided
  useEffect(() => {
    if (!id || id === 'undefined') {
      addError('No employee selected', ErrorSeverity.WARNING, undefined, 'Please select an employee from the list to view details');
      navigate('/employees');
    }
  }, [id, navigate, addError]);

  const [employee, setEmployee] = useState<any>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);


  // Memoized error handler
  const handleError = useCallback((message: string, severity: ErrorSeverity = ErrorSeverity.ERROR) => {
    setErrorState(message);
    addError(message, severity);
    showToast(message, severity === ErrorSeverity.ERROR ? 'error' : 'warning');
  }, [addError, showToast]);

  // Enhanced fetch function with retry and caching
  const fetchEmployeeData = useCallback(async () => {
    if (!id || id === 'undefined') return;
    
    setIsLoading(true);
    setErrorState(null);
    
    try {
      // Validate employee ID
      if (!id || typeof id !== 'string' || id === 'undefined') {
        throw new Error('Invalid employee ID');
      }

      // Add loading state for individual components
      setLoading(OperationType.FETCH_EMPLOYEES, true);

      // Fetch data with retry mechanism
      let retryCount = 0;
      const maxRetries = 3;
      while (retryCount < maxRetries) {
        try {
          // Fetch employee details and documents in parallel
          const [emp, docs] = await Promise.all([
            employeeService.getById(id),
            employeeService.getDocuments(id)
          ]);

          if (mounted) {
            setEmployee(emp);
            setDocuments(docs);
            setErrorState(null);
          }
          break;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw error;
          }
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load employee details';
      handleError(errorMessage);
    } finally {
      if (mounted) {
        setIsLoading(false);
        setLoading(OperationType.FETCH_EMPLOYEES, false);
      }
    }
  }, [id, mounted, setLoading, handleError]);

  // Initial data fetch
  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchEmployeeData();
    }
  }, [id, fetchEmployeeData]);

  // Retry on error
  useEffect(() => {
    if (errorState && mounted) {
      const timer = setTimeout(() => {
        fetchEmployeeData();
      }, 5000); // Retry after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [errorState, mounted, fetchEmployeeData]);

  const handleUpdate = async (updated: any) => {
    if (!id || id === 'undefined') {
      handleError('Cannot update employee: No employee ID provided');
      return;
    }

    if (!updated || Object.keys(updated).length === 0) {
      handleError('No changes to update');
      return;
    }

    try {
      setLoading(OperationType.UPDATE_EMPLOYEE, true);

      const updatedEmployee = await employeeService.update(id, updated);
      
      if (mounted) {
        setEmployee(updatedEmployee);
        showToast('Employee updated successfully', 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update employee';
      handleError(errorMessage);
    } finally {
      if (mounted) {
        setLoading(OperationType.UPDATE_EMPLOYEE, false);
      }
    }
  };

  const handleDelete = async () => {
    if (!id) {
      addError('Cannot delete employee: No employee ID provided', ErrorSeverity.ERROR);
      return;
    }
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      setLoading(OperationType.DELETE_EMPLOYEE, true);
      await employeeService.delete(id);
      navigate('/employees');
    } catch (error) {
      addError('Failed to delete employee', ErrorSeverity.ERROR, undefined, error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(OperationType.DELETE_EMPLOYEE, false);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: string, expiryDate?: string) => {
    if (!id) {
      addError('Cannot upload document: No employee ID provided', ErrorSeverity.ERROR);
      return;
    }
    
    try {
      setLoading(OperationType.ADD_DOCUMENT, true);
      
      // Call the enhanced uploadDocument function with document type and optional expiry date
      const doc = await employeeService.uploadDocument(id, file, documentType, expiryDate);
      
      if (doc) {
        setDocuments((docs) => [...docs, doc]);
        
        // If this is a visa document with expiry date, update employee visa status
        if (documentType === 'visa_copy' && expiryDate && employee) {
          // Update employee object with new visa expiry if applicable
          const visaExpiryDate = expiryDate;
          if (!employee.visaExpiryDate || new Date(visaExpiryDate) > new Date(employee.visaExpiryDate)) {
            const updatedEmployee = {...employee, visaExpiryDate};
            setEmployee(updatedEmployee);
            // Optionally update the employee in the database
            await employeeService.update(id, {visaExpiryDate});
          }
        }
      }
    } catch (error) {
      addError('Failed to upload document', ErrorSeverity.ERROR, undefined, error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(OperationType.ADD_DOCUMENT, false);
    }
  };

  const handleDocumentDelete = async (docId: string) => {
    if (!id) {
      addError('Cannot delete document: No employee ID provided', ErrorSeverity.ERROR);
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      setLoading(OperationType.DELETE_DOCUMENT, true);
      
      // Use enhanced deleteDocument function that returns a result object
      const result = await deleteDocument(id, docId);
      
      if (result.success) {
        // Update local state to remove the deleted document
        setDocuments((docs) => docs.filter((d) => d.id !== docId));
      } else {
        // Display error message from the result
        addError(
          `Failed to delete document: ${result.message || 'Unknown error'}`,
          ErrorSeverity.ERROR,
          OperationType.DELETE_DOCUMENT
        );
      }
    } catch (error) {
      addError('Failed to delete document', ErrorSeverity.ERROR, undefined, error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(OperationType.DELETE_DOCUMENT, false);
    }
  };

  const handleSendVisaEmail = async () => {
    if (!id) {
      addError('Cannot send visa email: No employee ID provided', ErrorSeverity.ERROR);
      return;
    }
    try {
      setIsSendingEmail(true);
      await sendVisaExpiryEmail(id);
      alert('Visa expiry email sent!');
    } catch (error) {
      addError('Failed to send visa expiry email', ErrorSeverity.ERROR, undefined, error instanceof Error ? error.message : String(error));
    } finally {
      setIsSendingEmail(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" message="Loading employee details..." />;
  }

  if (!employee) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-4 flex items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-[#DD1A51] rounded-md shadow-sm text-sm font-medium text-[#DD1A51] bg-white hover:bg-[#ffe5ed] focus:outline-none focus:ring-2 focus:ring-[#DD1A51]"
            onClick={() => navigate('/employees')}
          >
            &larr; Back to Employee List
          </button>
        </div>
        <div className="text-center text-red-600 p-8 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-2">Employee Not Found</h2>
          <p>The employee you're looking for doesn't exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-4 flex items-center gap-4">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-[#DD1A51] rounded-md shadow-sm text-sm font-medium text-[#DD1A51] bg-white hover:bg-[#ffe5ed] focus:outline-none focus:ring-2 focus:ring-[#DD1A51]"
          onClick={() => navigate('/employees')}
        >
          &larr; Back to Employee List
        </button>
        <h1 className="text-2xl font-bold">Employee Details</h1>
      </div>
      <EmployeeProfileForm employee={employee} onUpdate={handleUpdate} onDelete={handleDelete} />
      <VisaExpiryInfo employee={employee} onSendEmail={handleSendVisaEmail} isSending={isSendingEmail} />
      
      {/* Enhanced document management component with horizontal scrolling */}
      <EmployeeDocuments 
        documents={documents} 
        onUpload={handleDocumentUpload} 
        onDelete={handleDocumentDelete} 
      />
    </div>
  );
};

export default EmployeeDetailsPage;
