import React, { useState } from 'react';
import NotificationSettings, { NotificationSettingsType } from './NotificationSettings';
import EmailTemplatePreview from './EmailTemplatePreview';
import EnhancedNotificationSettings from './components/notifications/NotificationSettings';
import SystemMaintenance from './components/system/SystemMaintenance';

// Default notification settings
const defaultSettings: NotificationSettingsType = {
  enabled: true,
  emailNotifications: true,
  reminderDays: [7, 30],
  recipients: ['admin@example.com', 'hr@example.com'],
  documentTypes: {
    visa: true
  }
};

interface NotificationManagementProps {
  onBack: () => void;
}

const NotificationManagement: React.FC<NotificationManagementProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<NotificationSettingsType>(defaultSettings);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'7days' | '14days' | '30days' | 'expired'>('30days');
  const [activeTab, setActiveTab] = useState<'notifications' | 'system'>('notifications');

  // Mock data for upcoming expirations
  const upcomingExpirations = [
    {
      id: '1',
      employeeId: '2',
      employeeName: 'Jane Smith',
      documentType: 'Visa',
      documentName: 'Work Visa',
      expiryDate: '2024-04-15',
      daysRemaining: 30
    },
    {
      id: '2',
      employeeId: '3',
      employeeName: 'Mike Johnson',
      documentType: 'Visa',
      documentName: 'Work Visa',
      expiryDate: '2024-01-10',
      daysRemaining: -20
    },
    {
      id: '3',
      employeeId: '4',
      employeeName: 'Sarah Williams',
      documentType: 'Visa',
      documentName: 'Work Visa',
      expiryDate: '2024-02-05',
      daysRemaining: 7
    },
    {
      id: '4',
      employeeId: '5',
      employeeName: 'David Brown',
      documentType: 'Visa',
      documentName: 'Work Visa',
      expiryDate: '2024-02-12',
      daysRemaining: 14
    }
  ];

  const handleSaveSettings = (newSettings: NotificationSettingsType) => {
    setSettings(newSettings);
    // In a real app, this would save to a backend
    console.log('Saving notification settings:', newSettings);
  };

  const getStatusBadgeStyle = (daysRemaining: number) => {
    if (daysRemaining < 0) return { backgroundColor: '#ffebee', color: '#d32f2f' };
    if (daysRemaining <= 7) return { backgroundColor: '#ffebee', color: '#d32f2f' };
    if (daysRemaining <= 14) return { backgroundColor: '#fff3e0', color: '#e65100' };
    if (daysRemaining <= 30) return { backgroundColor: '#fff8e1', color: '#ffa000' };
    return { backgroundColor: '#e8f5e9', color: '#388e3c' };
  };

  const handleSendTestEmail = () => {
    // In a real app, this would send a test email
    alert('Test email sent to recipients');
  };

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
        <h1 style={{ margin: 0, color: '#333' }}>Notification Management</h1>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #eee',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'notifications' ? '#e3f2fd' : 'transparent',
            color: activeTab === 'notifications' ? '#1976d2' : '#666',
            border: 'none',
            borderBottom: activeTab === 'notifications' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'notifications' ? '500' : 'normal'
          }}
        >
          Notification Management
        </button>
        <button
          onClick={() => setActiveTab('system')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'system' ? '#e3f2fd' : 'transparent',
            color: activeTab === 'system' ? '#1976d2' : '#666',
            border: 'none',
            borderBottom: activeTab === 'system' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'system' ? '500' : 'normal'
          }}
        >
          System Backup & Maintenance
        </button>
      </div>

      {activeTab === 'notifications' && (
        <>
        <div style={{ marginBottom: '30px' }}>
          <EnhancedNotificationSettings
            onSave={(newSettings) => {
              console.log('Saving enhanced notification settings:', newSettings);
              alert('Notification settings saved successfully!');
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '30px'
        }}>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#333', marginTop: 0, marginBottom: '16px' }}>
            Notification Settings
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Status:</span>
              <span style={{
                padding: '4px 8px',
                borderRadius: '9999px',
                backgroundColor: settings.enabled ? '#e8f5e9' : '#ffebee',
                color: settings.enabled ? '#388e3c' : '#d32f2f',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Email Notifications:</span>
              <span>{settings.emailNotifications ? 'Yes' : 'No'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Document Types:</span>
              <span>
                {settings.documentTypes.visa ? 'Visa Documents' : 'None'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Reminder Days:</span>
              <span>{settings.reminderDays.map(day => `${day} days`).join(', ') || 'None'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '500', color: '#333' }}>Recipients:</span>
              <span>{settings.recipients.length} email(s)</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Edit Settings
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#333', marginTop: 0, marginBottom: '16px' }}>
            Email Templates
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
              Preview Template:
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '0.875rem',
                backgroundColor: 'white'
              }}
            >
              <option value="30days">30 Days Before Expiry</option>
              <option value="14days">14 Days Before Expiry</option>
              <option value="7days">7 Days Before Expiry</option>
              <option value="expired">Already Expired</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleSendTestEmail}
              style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Send Test Email
            </button>
          </div>
        </div>
        </div>

        <div style={{ marginBottom: '30px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#333', marginTop: 0, marginBottom: '16px' }}>
            Email Template Preview
          </h2>

          <EmailTemplatePreview
            templateType={selectedTemplate}
            documentType="Visa"
            employeeName="Jane Smith"
            documentName="Work Visa"
            expiryDate="2024-04-15"
          />

          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '4px', fontSize: '0.875rem', color: '#666' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>Note:</p>
            <p style={{ margin: '0' }}>As requested, expiry reminders are only configured for visa documents. Other document types will not trigger expiry notifications.</p>
          </div>
        </div>
        </div>

        <div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', color: '#333', marginTop: 0, marginBottom: '16px' }}>
            Upcoming Document Expirations
          </h2>

          {upcomingExpirations.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Employee</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Document</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Expiry Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingExpirations.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px' }}>{doc.employeeName}</td>
                    <td style={{ padding: '12px 16px' }}>{doc.documentName}</td>
                    <td style={{ padding: '12px 16px' }}>{new Date(doc.expiryDate).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        ...getStatusBadgeStyle(doc.daysRemaining)
                      }}>
                        {doc.daysRemaining < 0
                          ? `Expired ${Math.abs(doc.daysRemaining)} days ago`
                          : `Expires in ${doc.daysRemaining} days`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px 0' }}>
              No upcoming document expirations.
            </p>
          )}
        </div>
        </div>

        <NotificationSettings
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSaveSettings}
          initialSettings={settings}
        />
        </>
      )}

      {activeTab === 'system' && (
        <div style={{ marginBottom: '30px' }}>
          <SystemMaintenance
            onBackupNow={() => {
              console.log('Backup initiated');
            }}
            onOptimizeDatabase={() => {
              console.log('Database optimization initiated');
            }}
            onClearCache={() => {
              console.log('Cache clearing initiated');
            }}
            onViewLogs={() => {
              console.log('Viewing system logs');
              alert('System logs would be displayed here in a real implementation.');
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;
