import React, { useState } from 'react';

interface NotificationConfigProps {
  onSaveConfig: (config: NotificationSettings) => void;
  currentSettings: NotificationSettings;
}

export interface NotificationSettings {
  documentExpiry: {
    enabled: boolean;
    daysBeforeExpiry: number[];
    recipients: string[];
    escalationEnabled: boolean;
    escalationDays: number;
    escalationRecipients: string[];
  };
  employeeOnboarding: {
    enabled: boolean;
    recipients: string[];
  };
  systemAlerts: {
    enabled: boolean;
    recipients: string[];
  };
}

const NotificationConfig: React.FC<NotificationConfigProps> = ({
  onSaveConfig,
  currentSettings
}) => {
  const [settings, setSettings] = useState<NotificationSettings>(currentSettings);
  const [newRecipient, setNewRecipient] = useState('');
  const [newEscalationRecipient, setNewEscalationRecipient] = useState('');
  const [newDaysBeforeExpiry, setNewDaysBeforeExpiry] = useState('');
  const [activeTab, setActiveTab] = useState<'document' | 'onboarding' | 'system'>('document');

  // Handle checkbox changes
  const handleCheckboxChange = (path: string[], value: boolean) => {
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    // Navigate to the nested property
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Set the value
    current[path[path.length - 1]] = value;
    
    setSettings(newSettings);
  };

  // Handle number input changes
  const handleNumberChange = (path: string[], value: number) => {
    const newSettings = { ...settings };
    let current: any = newSettings;
    
    // Navigate to the nested property
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    
    // Set the value
    current[path[path.length - 1]] = value;
    
    setSettings(newSettings);
  };

  // Add a new recipient
  const handleAddRecipient = (type: 'normal' | 'escalation') => {
    const email = type === 'normal' ? newRecipient : newEscalationRecipient;
    
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    const newSettings = { ...settings };
    
    if (type === 'normal') {
      if (activeTab === 'document') {
        newSettings.documentExpiry.recipients = [...newSettings.documentExpiry.recipients, email];
      } else if (activeTab === 'onboarding') {
        newSettings.employeeOnboarding.recipients = [...newSettings.employeeOnboarding.recipients, email];
      } else if (activeTab === 'system') {
        newSettings.systemAlerts.recipients = [...newSettings.systemAlerts.recipients, email];
      }
      setNewRecipient('');
    } else {
      newSettings.documentExpiry.escalationRecipients = [...newSettings.documentExpiry.escalationRecipients, email];
      setNewEscalationRecipient('');
    }
    
    setSettings(newSettings);
  };

  // Remove a recipient
  const handleRemoveRecipient = (type: 'normal' | 'escalation', index: number) => {
    const newSettings = { ...settings };
    
    if (type === 'normal') {
      if (activeTab === 'document') {
        newSettings.documentExpiry.recipients = newSettings.documentExpiry.recipients.filter((_, i) => i !== index);
      } else if (activeTab === 'onboarding') {
        newSettings.employeeOnboarding.recipients = newSettings.employeeOnboarding.recipients.filter((_, i) => i !== index);
      } else if (activeTab === 'system') {
        newSettings.systemAlerts.recipients = newSettings.systemAlerts.recipients.filter((_, i) => i !== index);
      }
    } else {
      newSettings.documentExpiry.escalationRecipients = newSettings.documentExpiry.escalationRecipients.filter((_, i) => i !== index);
    }
    
    setSettings(newSettings);
  };

  // Add days before expiry
  const handleAddDaysBeforeExpiry = () => {
    const days = parseInt(newDaysBeforeExpiry);
    
    if (isNaN(days) || days <= 0) {
      alert('Please enter a valid number of days');
      return;
    }
    
    const newSettings = { ...settings };
    
    if (!newSettings.documentExpiry.daysBeforeExpiry.includes(days)) {
      newSettings.documentExpiry.daysBeforeExpiry = [...newSettings.documentExpiry.daysBeforeExpiry, days].sort((a, b) => a - b);
      setSettings(newSettings);
    }
    
    setNewDaysBeforeExpiry('');
  };

  // Remove days before expiry
  const handleRemoveDaysBeforeExpiry = (days: number) => {
    const newSettings = { ...settings };
    newSettings.documentExpiry.daysBeforeExpiry = newSettings.documentExpiry.daysBeforeExpiry.filter(d => d !== days);
    setSettings(newSettings);
  };

  // Save configuration
  const handleSaveConfig = () => {
    onSaveConfig(settings);
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: '0 0 20px', color: '#333' }}>Notification Settings</h2>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #eee',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('document')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'document' ? '#e3f2fd' : 'transparent',
            color: activeTab === 'document' ? '#1976d2' : '#666',
            border: 'none',
            borderBottom: activeTab === 'document' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'document' ? '500' : 'normal'
          }}
        >
          Document Expiry
        </button>
        <button
          onClick={() => setActiveTab('onboarding')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'onboarding' ? '#e3f2fd' : 'transparent',
            color: activeTab === 'onboarding' ? '#1976d2' : '#666',
            border: 'none',
            borderBottom: activeTab === 'onboarding' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'onboarding' ? '500' : 'normal'
          }}
        >
          Employee Onboarding
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
          System Alerts
        </button>
      </div>
      
      {/* Document Expiry Tab */}
      {activeTab === 'document' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <input
                type="checkbox"
                checked={settings.documentExpiry.enabled}
                onChange={(e) => handleCheckboxChange(['documentExpiry', 'enabled'], e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontWeight: '500' }}>Enable Document Expiry Notifications</span>
            </label>
            
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
                    onClick={() => handleAddRecipient('normal')}
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
                        onClick={() => handleRemoveRecipient('normal', index)}
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
                    onChange={(e) => handleCheckboxChange(['documentExpiry', 'escalationEnabled'], e.target.checked)}
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
                        onChange={(e) => handleNumberChange(['documentExpiry', 'escalationDays'], parseInt(e.target.value))}
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
                          onClick={() => handleAddRecipient('escalation')}
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
                              onClick={() => handleRemoveRecipient('escalation', index)}
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
          </div>
        </div>
      )}
      
      {/* Employee Onboarding Tab */}
      {activeTab === 'onboarding' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <input
                type="checkbox"
                checked={settings.employeeOnboarding.enabled}
                onChange={(e) => handleCheckboxChange(['employeeOnboarding', 'enabled'], e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontWeight: '500' }}>Enable Employee Onboarding Notifications</span>
            </label>
            
            <div style={{ marginLeft: '24px' }}>
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
                    onClick={() => handleAddRecipient('normal')}
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
                  {settings.employeeOnboarding.recipients.map((email, index) => (
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
                        onClick={() => handleRemoveRecipient('normal', index)}
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
          </div>
        </div>
      )}
      
      {/* System Alerts Tab */}
      {activeTab === 'system' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <input
                type="checkbox"
                checked={settings.systemAlerts.enabled}
                onChange={(e) => handleCheckboxChange(['systemAlerts', 'enabled'], e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontWeight: '500' }}>Enable System Alert Notifications</span>
            </label>
            
            <div style={{ marginLeft: '24px' }}>
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
                    onClick={() => handleAddRecipient('normal')}
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
                  {settings.systemAlerts.recipients.map((email, index) => (
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
                        onClick={() => handleRemoveRecipient('normal', index)}
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
              
              <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '12px', 
                borderRadius: '4px',
                marginBottom: '16px',
                fontSize: '0.875rem',
                color: '#666'
              }}>
                <p style={{ margin: '0 0 8px', fontWeight: '500' }}>System Alerts Include:</p>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  <li>Database backup failures</li>
                  <li>System performance issues</li>
                  <li>Security alerts</li>
                  <li>Disk space warnings</li>
                  <li>Application errors</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #eee'
      }}>
        <button
          onClick={handleSaveConfig}
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

export default NotificationConfig;
