import React, { useState } from 'react';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: NotificationSettingsType) => void;
  initialSettings: NotificationSettingsType;
}

export interface NotificationSettingsType {
  enabled: boolean;
  emailNotifications: boolean;
  reminderDays: number[];
  recipients: string[];
  documentTypes: {
    visa: boolean;
  };
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings
}) => {
  const [settings, setSettings] = useState<NotificationSettingsType>(initialSettings);
  const [newRecipient, setNewRecipient] = useState('');
  const [recipientError, setRecipientError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleEnabled = () => {
    setSettings({
      ...settings,
      enabled: !settings.enabled
    });
  };

  const handleToggleEmailNotifications = () => {
    setSettings({
      ...settings,
      emailNotifications: !settings.emailNotifications
    });
  };

  const handleToggleDocumentType = (type: keyof NotificationSettingsType['documentTypes']) => {
    setSettings({
      ...settings,
      documentTypes: {
        ...settings.documentTypes,
        [type]: !settings.documentTypes[type]
      }
    });
  };

  const handleToggleReminderDay = (day: number) => {
    const newReminderDays = settings.reminderDays.includes(day)
      ? settings.reminderDays.filter(d => d !== day)
      : [...settings.reminderDays, day].sort((a, b) => a - b);

    setSettings({
      ...settings,
      reminderDays: newReminderDays
    });
  };

  const handleAddRecipient = () => {
    if (!newRecipient) {
      setRecipientError('Please enter an email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(newRecipient)) {
      setRecipientError('Please enter a valid email address');
      return;
    }

    if (settings.recipients.includes(newRecipient)) {
      setRecipientError('This email is already in the list');
      return;
    }

    setSettings({
      ...settings,
      recipients: [...settings.recipients, newRecipient]
    });
    setNewRecipient('');
    setRecipientError('');
  };

  const handleRemoveRecipient = (email: string) => {
    setSettings({
      ...settings,
      recipients: settings.recipients.filter(r => r !== email)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onSave(settings);
      setIsSubmitting(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '700px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Notification Settings</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={handleToggleEnabled}
                  style={{ marginRight: '8px' }}
                  disabled={isSubmitting}
                />
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#333' }}>
                  Enable document expiry notifications
                </span>
              </label>
            </div>

            {settings.enabled && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', color: '#333', marginBottom: '12px' }}>
                    Notification Method
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={handleToggleEmailNotifications}
                        style={{ marginRight: '8px' }}
                        disabled={isSubmitting}
                      />
                      <span style={{ fontSize: '0.875rem', color: '#555' }}>
                        Email notifications
                      </span>
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', color: '#333', marginBottom: '12px' }}>
                    Document Types to Monitor
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.documentTypes.visa}
                        onChange={() => handleToggleDocumentType('visa')}
                        style={{ marginRight: '8px' }}
                        disabled={isSubmitting}
                      />
                      <span style={{ fontSize: '0.875rem', color: '#555' }}>Visa Documents</span>
                    </label>
                  </div>
                  <p style={{ marginTop: '8px', fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                    Note: Expiry reminders are only available for visa documents as requested.
                  </p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.125rem', color: '#333', marginBottom: '12px' }}>
                    Reminder Days
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '12px' }}>
                    Send notifications when documents are about to expire in:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[7, 14, 30, 60, 90].map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleReminderDay(day)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          backgroundColor: settings.reminderDays.includes(day) ? '#e0f2f1' : 'white',
                          color: settings.reminderDays.includes(day) ? '#00796b' : '#333',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                        disabled={isSubmitting}
                      >
                        {day} days
                      </button>
                    ))}
                  </div>
                </div>

                {settings.emailNotifications && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.125rem', color: '#333', marginBottom: '12px' }}>
                      Email Recipients
                    </h3>
                    <div style={{ display: 'flex', marginBottom: '12px' }}>
                      <input
                        type="email"
                        value={newRecipient}
                        onChange={(e) => {
                          setNewRecipient(e.target.value);
                          if (recipientError) setRecipientError('');
                        }}
                        placeholder="Enter email address"
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '4px 0 0 4px',
                          border: recipientError ? '1px solid #e53e3e' : '1px solid #ddd',
                          fontSize: '0.875rem'
                        }}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={handleAddRecipient}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '0 4px 4px 0',
                          border: 'none',
                          backgroundColor: '#4CAF50',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                        disabled={isSubmitting}
                      >
                        Add
                      </button>
                    </div>
                    {recipientError && (
                      <p style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '-8px', marginBottom: '12px' }}>
                        {recipientError}
                      </p>
                    )}

                    <div>
                      {settings.recipients.length > 0 ? (
                        <ul style={{
                          listStyle: 'none',
                          padding: '8px',
                          margin: 0,
                          backgroundColor: '#f9fafb',
                          borderRadius: '4px',
                          maxHeight: '150px',
                          overflowY: 'auto'
                        }}>
                          {settings.recipients.map(email => (
                            <li
                              key={email}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '6px 0',
                                borderBottom: '1px solid #eee'
                              }}
                            >
                              <span style={{ fontSize: '0.875rem' }}>{email}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveRecipient(email)}
                                style={{
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  color: '#e53e3e',
                                  cursor: 'pointer',
                                  fontSize: '0.875rem'
                                }}
                                disabled={isSubmitting}
                              >
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ color: '#666', fontSize: '0.875rem' }}>
                          No recipients added yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 16px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: 'white',
                color: '#333',
                fontSize: '14px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 16px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: '#4CAF50',
                color: 'white',
                fontSize: '14px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettings;
