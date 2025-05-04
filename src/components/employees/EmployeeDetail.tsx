import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { employeeApi } from '../../services/api/employeeApi';
import { documentApi } from '../../services/api/documentApi';
import { Employee, EmployeeDocument } from '../../types/employees';
import { mapBackendDocumentToFrontend } from '../../types/documents';
import { useAuth, useIsAdmin } from '../../context/AuthContext';
import DocumentUploadModal from '../documents/DocumentUploadModal';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { employeeDetails } = useAuth();
  const isAdmin = useIsAdmin();

  // Check if the current user is viewing their own profile
  const isOwnProfile = employeeDetails?.id === id;

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // Fetch employee details
        const employeeResponse = await employeeApi.getById(id);
        const employee = (employeeResponse && (employeeResponse as any).data) ? (employeeResponse as any).data : employeeResponse;

        if (employee) {
          setEmployee(employee);

          // Fetch employee documents
          const documentsResponse = await documentApi.getDocumentsByEmployeeId(id);
          // Map backend Document[] to EmployeeDocument[] shape
          const employeeDocuments: EmployeeDocument[] = (documentsResponse || [])
            .map((doc: any) => {
              const mapped = mapBackendDocumentToFrontend(doc);
              // Only include documents that have required EmployeeDocument fields
              // 'uploadedBy' is not present in Document; set as empty string or fallback if needed
              if (mapped && mapped.id && mapped.employeeId && mapped.name && mapped.type && mapped.documentType && mapped.uploadDate && mapped.status && mapped.url) {
                return {
                  id: mapped.id,
                  employeeId: mapped.employeeId,
                  name: mapped.name,
                  type: mapped.type,
                  documentType: mapped.documentType,
                  uploadDate: mapped.uploadDate,
                  expiryDate: mapped.expiryDate,
                  status: mapped.status as 'valid' | 'expiring' | 'expired',
                  fileUrl: mapped.url,
                  uploadedBy: doc.uploaded_by || '',
                } as EmployeeDocument;
              }
              return null;
            })
            .filter(Boolean) as EmployeeDocument[];
          setDocuments(employeeDocuments);

          setError(null);
        } else {
          setError('Employee not found');
        }
      } catch (err) {
        console.error('Failed to fetch employee data:', err);
        setError('Failed to load employee details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployeeData();
  }, [id]);

  // Calculate days until visa expiry
  const getDaysUntilExpiry = (): number | null => {
    if (!employee?.visaExpiryDate) return null;

    const expiryDate = new Date(employee.visaExpiryDate);
    const today = new Date();

    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getVisaStatusClass = (): string => {
    const daysUntil = getDaysUntilExpiry();

    if (daysUntil === null) return 'bg-gray-100 text-gray-800';
    if (daysUntil < 0) return 'bg-red-100 text-red-800';
    if (daysUntil <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getVisaStatusText = (): string => {
    const daysUntil = getDaysUntilExpiry();

    if (daysUntil === null) return 'Unknown';
    if (daysUntil < 0) return 'Expired';
    if (daysUntil <= 30) return 'Expiring Soon';
    return 'Active';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Employee not found</h3>
        <p className="mt-2 text-sm text-gray-500">
          The employee you are looking for does not exist or has been removed.
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          onClick={() => navigate('/employees')}
        >
          Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/employees"
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Employee Details</h1>
        </div>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => navigate(`/employees/edit/${employee.id}`)}
            >
              Edit
            </button>
          )}
          {(isAdmin || isOwnProfile) && (
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Document
            </button>
          )}
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-800 text-2xl font-medium">
                {employee.name[0].toUpperCase()}
              </span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">{employee.name}</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">{employee.position}</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.email}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Employee ID</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.employeeId}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.department}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Position</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.position}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.phone || 'Not provided'}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.address || 'Not provided'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Nationality</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.nationality || 'Not provided'}</dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Passport number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.passportNumber || 'Not provided'}</dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Join date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'Not provided'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Visa status</dt>
              <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getVisaStatusClass()}`}>
                  {getVisaStatusText()}
                </span>
                {employee.visaExpiryDate && (
                  <span className="ml-3 text-sm text-gray-500">
                    Expires on {new Date(employee.visaExpiryDate).toLocaleDateString()}
                    {getDaysUntilExpiry() !== null && getDaysUntilExpiry()! >= 0 && (
                      <span className="ml-1">
                        ({getDaysUntilExpiry()} days remaining)
                      </span>
                    )}
                    {getDaysUntilExpiry() !== null && getDaysUntilExpiry()! < 0 && (
                      <span className="ml-1 text-red-600">
                        (Expired {Math.abs(getDaysUntilExpiry()!)} days ago)
                      </span>
                    )}
                  </span>
                )}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Emergency contact</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {employee.emergencyContact ? (
                  <div>
                    <p>{employee.emergencyContact.name} ({employee.emergencyContact.relationship})</p>
                    <p>{employee.emergencyContact.phone}</p>
                  </div>
                ) : (
                  'Not provided'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Documents</h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {documents.length > 0 ? (
              documents.map((document) => (
                <li key={document.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">{document.name}</h4>
                        <p className="text-sm text-gray-500">{document.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-500">
                        Uploaded: {new Date(document.uploadDate).toLocaleDateString()}
                      </div>
                      {document.expiryDate && (
                        <div className="text-sm text-gray-500">
                          Expires: {new Date(document.expiryDate).toLocaleDateString()}
                        </div>
                      )}
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center">
                <p className="text-sm text-gray-500">No documents found for this employee.</p>
                {(isAdmin || isOwnProfile) && (
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    Upload First Document
                  </button>
                )}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        employeeId={employee?.id}
        visaId={`visa-${employee?.id}`}
        onSuccess={() => {
          // Refresh employee data and documents after upload
          Promise.all([
            employeeApi.getById(employee?.id),
            documentApi.getDocumentsByEmployeeId(employee?.id)
          ]).then(([employeeResponse, documentsData]) => {
            const updatedEmployee = (employeeResponse && (employeeResponse as any).data) ? (employeeResponse as any).data : employeeResponse;
            if (updatedEmployee) setEmployee(updatedEmployee);
            const employeeDocuments: EmployeeDocument[] = (documentsData || [])
              .map((doc: any) => {
                const mapped = mapBackendDocumentToFrontend(doc);
                if (mapped && mapped.id && mapped.employeeId && mapped.name && mapped.type && mapped.documentType && mapped.uploadDate && mapped.status && mapped.url) {
                  return {
                    id: mapped.id,
                    employeeId: mapped.employeeId,
                    name: mapped.name,
                    type: mapped.type,
                    documentType: mapped.documentType,
                    uploadDate: mapped.uploadDate,
                    expiryDate: mapped.expiryDate,
                    status: mapped.status as 'valid' | 'expiring' | 'expired',
                    fileUrl: mapped.url,
                    uploadedBy: doc.uploaded_by || '',
                  } as EmployeeDocument;
                }
                return null;
              })
              .filter(Boolean) as EmployeeDocument[];
            setDocuments(employeeDocuments);
          });
        }}
      />
    </div>
  );
};

export default EmployeeDetail;