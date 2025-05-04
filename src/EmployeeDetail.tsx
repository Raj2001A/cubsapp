import React, { useState } from 'react';
import DocumentUploadModal from './DocumentUploadModal';
import { downloadDocument, previewDocument } from './services/mockDocumentService';
import { mockEmployees } from './data/mockEmployees';
import NotificationModal from './components/notifications/NotificationModal';

// Document types based on requirements
const DOCUMENT_TYPES = [
  { id: 'visa_copy', label: 'Visa Copy (requires expiry date)' },
  { id: 'passport', label: 'Passport Copy' },
  { id: 'emirates_id', label: 'Emirates ID' },
  { id: 'labour_card', label: 'Labour Card' },
  { id: 'medical_insurance', label: 'Medical Insurance' },
  { id: 'workmen_compensation', label: 'Workmen Compensation' },
  { id: 'iloe', label: 'ILOE' },
  { id: 'cicpa', label: 'CICPA' },
  { id: 'temporary_work_permit', label: 'Temporary Work Permit' },
  { id: 'driving_license', label: 'Driving License' },
  { id: 'other', label: 'Other Certificates' }
];

interface EmployeeDetailProps {
  employeeId: string;
  onBack: () => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employeeId, onBack }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);

  // Find the employee by ID
  const employee = mockEmployees.find(emp => emp.id === employeeId);

  // Handle document upload
  const handleDocumentUpload = (documentData: {
    documentType: string;
    expiryDate?: string;
    file: File;
    notes?: string;
  }) => {
    // In a real app, this would send the data to a backend
    console.log('Uploading document:', documentData);

    // Create a new document object
    const newDocument = {
      id: `new-${Date.now()}`,
      name: DOCUMENT_TYPES.find(type => type.id === documentData.documentType)?.label || documentData.documentType,
      type: 'Uploaded',
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: documentData.expiryDate,
      fileName: documentData.file.name,
      fileSize: `${(documentData.file.size / 1024).toFixed(2)} KB`,
      fileType: documentData.file.type,
      notes: documentData.notes,
      employeeId: employeeId
    };

    // Add to employee documents
    if (employee) {
      // Create a copy of the employee object to avoid direct mutation
      const updatedEmployee = { ...employee };

      // Add the new document to the beginning of the documents array
      updatedEmployee.documents = [newDocument, ...updatedEmployee.documents];

      // Update the documents state
      setDocuments([...updatedEmployee.documents]);

      // Log the updated documents
      console.log('Updated documents:', updatedEmployee.documents);
    }
  };

  if (!employee) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#d32f2f' }}>Employee Not Found</h2>
        <p style={{ marginBottom: '20px' }}>The employee you are looking for does not exist.</p>
        <button
          onClick={onBack}
          style={{
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Back to Employee List
        </button>
      </div>
    );
  }

  // Calculate days until visa expiry
  const getDaysUntilExpiry = (): number => {
    const expiryDate = new Date(employee.visaExpiryDate);
    const today = new Date();

    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get visa status text and style
  const getVisaStatusInfo = () => {
    const daysUntil = getDaysUntilExpiry();

    if (daysUntil < 0) {
      return {
        text: 'Expired',
        style: { backgroundColor: '#ffebee', color: '#d32f2f' }
      };
    }

    if (daysUntil <= 30) {
      return {
        text: 'Expiring Soon',
        style: { backgroundColor: '#fff8e1', color: '#ffa000' }
      };
    }

    return {
      text: 'Active',
      style: { backgroundColor: '#e8f5e9', color: '#388e3c' }
    };
  };

  const visaStatus = getVisaStatusInfo();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button
          onClick={onBack}
          style={{
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginRight: '10px',
            padding: '5px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 style={{ margin: 0, color: '#333' }}>Employee Details</h1>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e0f2f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px',
              fontSize: '24px',
              color: '#00796b',
              fontWeight: 'bold'
            }}>
              {employee.name ? employee.name[0].toUpperCase() : 'E'}
            </div>
            <div>
              <h2 style={{ margin: '0 0 5px 0', color: '#333' }}>{employee.name}</h2>
              <p style={{ margin: 0, color: '#6b7280' }}>{employee.position}</p>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Employee ID
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {employee.employeeId}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Trade
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {employee.trade}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Nationality
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {employee.nationality}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Date of Birth
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {new Date(employee.dateOfBirth).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Join Date
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {new Date(employee.joinDate).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Email
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {employee.email}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Mobile Number
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {employee.mobileNumber}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Home Phone
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {employee.homePhoneNumber}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Company
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {employee.companyName} (ID: {employee.companyId})
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Department
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {employee.department || 'N/A'}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Position
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827' }}>
              {employee.position || 'N/A'}
            </div>
          </div>
          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ width: '200px', padding: '16px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
              Visa Status
            </div>
            <div style={{ flex: 1, padding: '16px', color: '#111827', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  ...visaStatus.style
                }}>
                  {visaStatus.text}
                </span>
                <span style={{ marginLeft: '10px', color: '#6b7280', fontSize: '0.875rem' }}>
                  Expires on {new Date(employee.visaExpiryDate).toLocaleDateString()}
                  {getDaysUntilExpiry() >= 0 ? (
                    <span> ({getDaysUntilExpiry()} days remaining)</span>
                  ) : (
                    <span> (Expired {Math.abs(getDaysUntilExpiry())} days ago)</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setIsNotificationModalOpen(true)}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                Send Reminder
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '1.25rem' }}>Documents</h2>
          <button
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Document
          </button>
        </div>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {(documents.length > 0 ? documents : employee.documents.map(doc => ({ ...doc, employeeId: employee.employeeId }))).map((document) => (
            <li key={document.id} style={{ borderBottom: '1px solid #e5e7eb', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="#1976d2">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{document.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{document.type}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ marginRight: '20px', fontSize: '0.875rem', color: '#6b7280' }}>
                    <div>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</div>
                    {document.expiryDate && (
                      <div>Expires: {new Date(document.expiryDate).toLocaleDateString()}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      style={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                      onClick={() => downloadDocument(document.id, `${document.name}_${employee.name}.pdf`)}
                    >
                      Download
                    </button>
                    <button
                      style={{
                        backgroundColor: '#f5f5f5',
                        color: '#333',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                      onClick={() => previewDocument(document.id)}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        employeeId={employee?.id}
        employeeName={employee?.name}
        onUpload={handleDocumentUpload}
      />

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        employee={employee}
      />
    </div>
  );
};

// No type mismatches found in outline, but review for missing required props or type issues if errors persist
export default EmployeeDetail;
