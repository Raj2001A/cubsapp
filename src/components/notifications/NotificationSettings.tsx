import React, { useState } from 'react';

interface NotificationSettingsProps {
  onSave: (settings: NotificationSettingsData) => void;
}

export interface NotificationSettingsData {
  documentExpiry: {
    enabled: boolean;
    daysBeforeExpiry: number[];
    recipients: string[];
    escalationEnabled: boolean;
    escalationDays: number;
    escalationRecipients: string[];
  };
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onSave }) => {
  const [settings, setSettings] = useState<NotificationSettingsData>({
    documentExpiry: {
      enabled: true,
      daysBeforeExpiry: [90, 60, 30, 15, 7],
      recipients: ['hr@example.com'],
      escalationEnabled: true,
      escalationDays: 3,
      escalationRecipients: ['manager@example.com']
    }
  });

  const [newRecipient, setNewRecipient] = useState('');
  const [newEscalationRecipient, setNewEscalationRecipient] = useState('');
  const [newDaysBeforeExpiry, setNewDaysBeforeExpiry] = useState('');

  // Handle checkbox changes
  const handleCheckboxChange = (field: string, value: boolean) => {
    if (field === 'enabled') {
      setSettings({
        ...settings,
        documentExpiry: {
          ...settings.documentExpiry,
          enabled: value
        }
      });
    } else if (field === 'escalationEnabled') {
      setSettings({
        ...settings,
        documentExpiry: {
          ...settings.documentExpiry,
          escalationEnabled: value
        }
      });
    }
  };

  // Handle escalation days change
  const handleEscalationDaysChange = (days: number) => {
    setSettings({
      ...settings,
      documentExpiry: {
        ...settings.documentExpiry,
        escalationDays: days
      }
    });
  };

  // Add a new recipient
  const handleAddRecipient = () => {
    if (!newRecipient || !newRecipient.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setSettings({
      ...settings,
      documentExpiry: {
        ...settings.documentExpiry,
        recipients: [...settings.documentExpiry.recipients, newRecipient]
      }
    });
    setNewRecipient('');
  };

  // Add a new escalation recipient
  const handleAddEscalationRecipient = () => {
    if (!newEscalationRecipient || !newEscalationRecipient.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setSettings({
      ...settings,
      documentExpiry: {
        ...settings.documentExpiry,
        escalationRecipients: [...settings.documentExpiry.escalationRecipients, newEscalationRecipient]
      }
    });
    setNewEscalationRecipient('');
  };

  // Remove a recipient
  const handleRemoveRecipient = (index: number) => {
    setSettings({
      ...settings,
      documentExpiry: {
        ...settings.documentExpiry,
        recipients: settings.documentExpiry.recipients.filter((_, i) => i !== index)
      }
    });
  };

  // Remove an escalation recipient
  const handleRemoveEscalationRecipient = (index: number) => {
    setSettings({
      ...settings,
      documentExpiry: {
        ...settings.documentExpiry,
        escalationRecipients: settings.documentExpiry.escalationRecipients.filter((_, i) => i !== index)
      }
    });
  };

  // Add days before expiry
  const handleAddDaysBeforeExpiry = () => {
    const days = parseInt(newDaysBeforeExpiry);
    
    if (isNaN(days) || days <= 0) {
      alert('Please enter a valid number of days');
      return;
    }
    
    if (!settings.documentExpiry.daysBeforeExpiry.includes(days)) {
      setSettings({
        ...settings,
        documentExpiry: {
          ...settings.documentExpiry,
          daysBeforeExpiry: [...settings.documentExpiry.daysBeforeExpiry, days].sort((a, b) => a - b)
        }
      });
    }
    
    setNewDaysBeforeExpiry('');
  };

  // Remove days before expiry
  const handleRemoveDaysBeforeExpiry = (days: number) => {
    setSettings({
      ...settings,
      documentExpiry: {
        ...settings.documentExpiry,
        daysBeforeExpiry: settings.documentExpiry.daysBeforeExpiry.filter(d => d !== days)
      }
    });
  };

  // Save settings
  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: '0 0 20px', color: '#333' }}>Document Expiry Notifications</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <input
            type="checkbox"
            checked={settings.documentExpiry.enabled}
            onChange={(e) => handleCheckboxChange('enabled', e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontWeight: '500' }}>Enable Document Expiry Notifications</span>
        </label>
        
        {settings.documentExpiry.enabled && (
          <div style={{ marginLeft: '24px' }}>
            <h3 style={{ fontSize: '1rem', color: '#555', marginBottom: '12px' }}>Notification Schedule</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="text"
                  value={newDaysBeforeExpiry}
                  onChange={(e) => setNewDaysBeforeExpiry(e.target.value)}
                  placeholder="Days before expiry"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    marginRight: '8px',
                    width: '150px'
                  }}
                />
                <button
                  onClick={handleAddDaysBeforeExpiry}
                  style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '8px',
                marginBottom: '16px'
              }}>
                {settings.documentExpiry.daysBeforeExpiry.map((days) => (
                  <div 
                    key={days}
                    style={{ 
                      backgroundColor: '#e3f2fd', 
                      color: '#1976d2', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{days} days before</span>
                    <button
                      onClick={() => handleRemoveDaysBeforeExpiry(days)}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#1976d2',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <h3 style={{ fontSize: '1rem', color: '#555', marginBottom: '12px' }}>Recipients</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  placeholder="Email address"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    marginRight: '8px',
                    width: '250px'
                  }}
                />
                <button
                  onClick={handleAddRecipient}
                  style={{
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '8px 12px',
                    cursor: 'pointer'
                  }}
                >
                  Add Recipient
                </button>
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                marginBottom: '16px'
              }}>
                {settings.documentExpiry.recipients.map((email, index) => (
                  <div 
                    key={index}
                    style={{ 
                      backgroundColor: '#f9fafb', 
                      padding: '8px 12px', 
                      borderRadius: '4px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{email}</span>
                    <button
                      onClick={() => handleRemoveRecipient(index)}
                      style={{
                        backgroundColor: '#ffebee',
                        color: '#d32f2f',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <h3 style={{ fontSize: '1rem', color: '#555', marginBottom: '12px' }}>Escalation Path</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <input
                  type="checkbox"
                  checked={settings.documentExpiry.escalationEnabled}
                  onChange={(e) => handleCheckboxChange('escalationEnabled', e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span>Enable Escalation for Urgent Issues</span>
              </label>
              
              {settings.documentExpiry.escalationEnabled && (
                <div style={{ marginLeft: '24px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '6px' }}>
                      Escalate After (days):
                    </label>
                    <input
                      type="number"
                      value={settings.documentExpiry.escalationDays}
                      onChange={(e) => handleEscalationDaysChange(parseInt(e.target.value))}
                      min="1"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        width: '100px'
                      }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '6px' }}>
                      Escalation Recipients:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <input
                        type="email"
                        value={newEscalationRecipient}
                        onChange={(e) => setNewEscalationRecipient(e.target.value)}
                        placeholder="Email address"
                        style={{
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          marginRight: '8px',
                          width: '250px'
                        }}
                      />
                      <button
                        onClick={handleAddEscalationRecipient}
                        style={{
                          backgroundColor: '#fff8e1',
                          color: '#f57f17',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '8px 12px',
                          cursor: 'pointer'
                        }}
                      >
                        Add
                      </button>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px'
                    }}>
                      {settings.documentExpiry.escalationRecipients.map((email, index) => (
                        <div 
                          key={index}
                          style={{ 
                            backgroundColor: '#fff8e1', 
                            padding: '8px 12px', 
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <span>{email}</span>
                          <button
                            onClick={() => handleRemoveEscalationRecipient(index)}
                            style={{
                              backgroundColor: '#ffebee',
                              color: '#d32f2f',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #eee'
      }}>
        <button
          onClick={handleSave}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;
