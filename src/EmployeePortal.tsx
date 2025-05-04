import React, { useState } from 'react';
import { previewDocument } from './services/mockDocumentService';
import { mockEmployees } from './data/mockEmployees';
import DocumentExpiryNotifications from './components/employee/DocumentExpiryNotifications';

interface EmployeePortalProps {
  employeeId: string;
  onLogout: () => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ employeeId, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'visa'>('profile');

  // Find the employee from mock data
  const employee = mockEmployees.find(emp => emp.id === employeeId);

  if (!employee) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#e53e3e',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2>Employee not found</h2>
        <p>The employee information could not be found.</p>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginTop: '16px'
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ margin: 0, color: '#333' }}>Employee Portal</h1>
          <p style={{ margin: '4px 0 0', color: '#666' }}>Welcome, {employee.name}</p>
        </div>
        <button
          onClick={onLogout}
          style={{
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Logout
        </button>
      </div>

      {/* Employee Summary Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#e0f2f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: '#00796b',
          fontWeight: 'bold'
        }}>
          {employee.name ? employee.name[0].toUpperCase() : 'E'}
        </div>
        <div>
          <h2 style={{ margin: '0 0 8px', color: '#333' }}>{employee.name}</h2>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div>
              <p style={{ margin: '0 0 4px', color: '#666', fontSize: '0.875rem' }}>Employee ID</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{employee.employeeId}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', color: '#666', fontSize: '0.875rem' }}>Trade</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{employee.trade}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 4px', color: '#666', fontSize: '0.875rem' }}>Company</p>
              <p style={{ margin: 0, fontWeight: '500' }}>{employee.companyName.split(',')[0]}</p>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '500',
            backgroundColor: employee.visaStatus === 'active' ? '#e8f5e9' :
                            employee.visaStatus === 'expiring' ? '#fff8e1' : '#ffebee',
            color: employee.visaStatus === 'active' ? '#388e3c' :
                  employee.visaStatus === 'expiring' ? '#ffa000' : '#d32f2f'
          }}>
            Visa: {employee.visaStatus === 'active' ? 'Active' :
                  employee.visaStatus === 'expiring' ? 'Expiring Soon' : 'Expired'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '10px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        gap: '20px'
      }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            backgroundColor: activeTab === 'profile' ? '#e0f2f1' : 'transparent',
            color: activeTab === 'profile' ? '#00796b' : '#6b7280',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'profile' ? 'bold' : 'normal'
          }}
        >
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          style={{
            backgroundColor: activeTab === 'documents' ? '#e0f2f1' : 'transparent',
            color: activeTab === 'documents' ? '#00796b' : '#6b7280',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'documents' ? 'bold' : 'normal'
          }}
        >
          My Documents
        </button>
        <button
          onClick={() => setActiveTab('visa')}
          style={{
            backgroundColor: activeTab === 'visa' ? '#e0f2f1' : 'transparent',
            color: activeTab === 'visa' ? '#00796b' : '#6b7280',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: activeTab === 'visa' ? 'bold' : 'normal'
          }}
        >
          Visa Status
        </button>
      </div>

      {/* Content Area */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#333', marginTop: 0, marginBottom: '16px' }}>
              Personal Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', color: '#555', marginBottom: '12px' }}>Basic Details</h3>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Full Name
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.name}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Employee ID
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.employeeId}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Trade
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.trade}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Nationality
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.nationality}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Date of Birth
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {new Date(employee.dateOfBirth).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Join Date
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {new Date(employee.joinDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', color: '#555', marginBottom: '12px' }}>Contact Information</h3>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Email
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.email}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Mobile Number
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.mobileNumber}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Home Phone
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.homePhoneNumber || 'N/A'}
                  </div>
                </div>

                <h3 style={{ fontSize: '1rem', color: '#555', marginTop: '24px', marginBottom: '12px' }}>Company Information</h3>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Company
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.companyName}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Department
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.department || 'N/A'}
                  </div>
                </div>
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                  <div style={{ width: '150px', padding: '12px', backgroundColor: '#f9fafb', fontWeight: '500', color: '#6b7280' }}>
                    Position
                  </div>
                  <div style={{ flex: 1, padding: '12px', color: '#111827' }}>
                    {employee.position || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#333', marginTop: 0, marginBottom: '16px' }}>
              My Documents
            </h2>

            {employee.documents && employee.documents.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Document</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Type</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Upload Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Expiry Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.documents.map(document => (
                    <tr key={document.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px' }}>{document.name}</td>
                      <td style={{ padding: '12px 16px' }}>{document.type}</td>
                      <td style={{ padding: '12px 16px' }}>{new Date(document.uploadDate).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {document.name.toLowerCase().includes('visa') && document.expiryDate ?
                          new Date(document.expiryDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <button
                            onClick={() => previewDocument(document.id)}
                            style={{
                              backgroundColor: '#f5f5f5',
                              color: '#333',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            View Document
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                color: '#6b7280'
              }}>
                <p style={{ margin: 0, fontSize: '1rem' }}>No documents available.</p>
                <p style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>
                  Your documents will appear here once they are uploaded by the HR department.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'visa' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', color: '#333', marginTop: 0, marginBottom: '16px' }}>
              Visa Information
            </h2>

            <DocumentExpiryNotifications
              documents={employee.documents || []}
            />

            <div style={{
              padding: '24px',
              backgroundColor: employee.visaStatus === 'active' ? '#e8f5e9' :
                              employee.visaStatus === 'expiring' ? '#fff8e1' : '#ffebee',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                  color: employee.visaStatus === 'active' ? '#388e3c' :
                        employee.visaStatus === 'expiring' ? '#ffa000' : '#d32f2f',
                }}>
                  {employee.visaStatus === 'active' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                    </svg>
                  ) : employee.visaStatus === 'expiring' ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    color: employee.visaStatus === 'active' ? '#388e3c' :
                          employee.visaStatus === 'expiring' ? '#ffa000' : '#d32f2f',
                    fontSize: '1.125rem'
                  }}>
                    {employee.visaStatus === 'active' ? 'Your visa is active' :
                     employee.visaStatus === 'expiring' ? 'Your visa is expiring soon' :
                     'Your visa has expired'}
                  </h3>
                  <p style={{
                    margin: '4px 0 0',
                    color: employee.visaStatus === 'active' ? '#1b5e20' :
                          employee.visaStatus === 'expiring' ? '#f57f17' : '#b71c1c',
                    fontSize: '0.875rem'
                  }}>
                    {employee.visaStatus === 'active' ? 'Your visa is valid and up to date.' :
                     employee.visaStatus === 'expiring' ? 'Please contact HR to renew your visa.' :
                     'Your visa has expired. Please contact HR immediately.'}
                  </p>
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '500', color: '#555' }}>Visa Expiry Date:</span>
                  <span style={{ fontWeight: '600', color: '#333' }}>{new Date(employee.visaExpiryDate).toLocaleDateString()}</span>
                </div>

                {employee.visaStatus !== 'active' && (
                  <div style={{
                    backgroundColor: employee.visaStatus === 'expiring' ? '#fffde7' : '#ffebee',
                    padding: '12px',
                    borderRadius: '4px',
                    marginTop: '16px',
                    fontSize: '0.875rem',
                    color: employee.visaStatus === 'expiring' ? '#f57f17' : '#b71c1c'
                  }}>
                    {employee.visaStatus === 'expiring' ? (
                      <>
                        <p style={{ margin: '0 0 8px', fontWeight: '500' }}>Action Required:</p>
                        <p style={{ margin: 0 }}>
                          Your visa will expire soon. Please contact the HR department to initiate the renewal process.
                          Ensure you have all necessary documents ready for submission.
                        </p>
                      </>
                    ) : (
                      <>
                        <p style={{ margin: '0 0 8px', fontWeight: '500' }}>Urgent Action Required:</p>
                        <p style={{ margin: 0 }}>
                          Your visa has expired. Please contact the HR department immediately to resolve this issue.
                          Working with an expired visa may have legal implications.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>


            </div>

            <h3 style={{ fontSize: '1rem', color: '#555', marginBottom: '12px' }}>Visa Document</h3>
            {employee.documents && employee.documents.some(doc => doc.name.toLowerCase().includes('visa')) ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Document</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Upload Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Expiry Date</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employee.documents
                    .filter(doc => doc.name.toLowerCase().includes('visa'))
                    .map(document => (
                      <tr key={document.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px 16px' }}>{document.name}</td>
                        <td style={{ padding: '12px 16px' }}>{new Date(document.uploadDate).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}>
                          {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div>
                            <button
                              onClick={() => previewDocument(document.id)}
                              style={{
                                backgroundColor: '#f5f5f5',
                                color: '#333',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '6px 10px',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              View Document
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                color: '#6b7280'
              }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  No visa documents available. Please contact HR if you need a copy of your visa.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePortal;
