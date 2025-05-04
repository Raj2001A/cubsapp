import React, { useState } from 'react';
import { Employee } from '../../types/employees';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, employee }) => {
  const [recipients, setRecipients] = useState<string[]>(['hr@cubstechnical.com']);
  const [additionalRecipient, setAdditionalRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Calculate days until visa expiry
  const getDaysUntilExpiry = (): number => {
    if (!employee.visaExpiryDate) return 0;
    
    const expiryDate = new Date(employee.visaExpiryDate);
    const today = new Date();

    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get default message based on visa status
  const getDefaultMessage = (): string => {
    const daysUntil = getDaysUntilExpiry();
    const expiryDate = employee.visaExpiryDate 
      ? new Date(employee.visaExpiryDate).toLocaleDateString() 
      : 'unknown date';

    if (daysUntil < 0) {
      return `This is a notification regarding ${employee.name}'s visa which has expired on ${expiryDate} (${Math.abs(daysUntil)} days ago). Immediate action is required to ensure compliance with visa regulations.`;
    }

    if (daysUntil <= 30) {
      return `This is a notification regarding ${employee.name}'s visa which will expire on ${expiryDate} (in ${daysUntil} days). Please take necessary actions to renew the visa before expiration.`;
    }

    return `This is a notification regarding ${employee.name}'s visa which will expire on ${expiryDate} (in ${daysUntil} days). Please plan accordingly for visa renewal.`;
  };

  // Set default message when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMessage(getDefaultMessage());
    }
  }, [isOpen, employee]);

  const handleAddRecipient = () => {
    if (!additionalRecipient) return;
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(additionalRecipient)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (recipients.includes(additionalRecipient)) {
      setError('This email is already in the recipients list');
      return;
    }
    
    setRecipients([...recipients, additionalRecipient]);
    setAdditionalRecipient('');
    setError(null);
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (recipients.length === 0) {
      setError('Please add at least one recipient');
      return;
    }
    
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would call an API endpoint
      // For now, we'll simulate the API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Sending notification:', {
        employee: employee.name,
        employeeId: employee.id,
        recipients,
        message,
        visaExpiryDate: employee.visaExpiryDate,
        daysUntilExpiry: getDaysUntilExpiry()
      });
      
      setSuccess('Notification sent successfully!');
      
      // Reset form after 2 seconds and close modal
      setTimeout(() => {
        setRecipients(['hr@cubstechnical.com']);
        setAdditionalRecipient('');
        setMessage('');
        setSuccess(null);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to send notification:', err);
      setError('Failed to send notification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Send Visa Reminder</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
          <p style={{ margin: 0, color: '#666' }}>
            <strong>Employee:</strong> {employee.name}
          </p>
          <p style={{ margin: '5px 0 0', color: '#666' }}>
            <strong>Visa Expiry:</strong> {employee.visaExpiryDate 
              ? `${new Date(employee.visaExpiryDate).toLocaleDateString()} (${
                  getDaysUntilExpiry() >= 0 
                    ? `in ${getDaysUntilExpiry()} days` 
                    : `${Math.abs(getDaysUntilExpiry())} days ago`
                })`
              : 'Not available'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555'
              }}
            >
              Recipients*
            </label>
            <div style={{ marginBottom: '10px' }}>
              {recipients.map(email => (
                <div 
                  key={email} 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    padding: '4px 8px',
                    borderRadius: '16px',
                    margin: '0 8px 8px 0',
                    fontSize: '14px'
                  }}
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveRecipient(email)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#1976d2',
                      marginLeft: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                value={additionalRecipient}
                onChange={(e) => setAdditionalRecipient(e.target.value)}
                placeholder="Add recipient email"
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '16px'
                }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddRecipient}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  fontSize: '14px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
                disabled={isSubmitting}
              >
                Add
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="message"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555'
              }}
            >
              Message*
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px',
                minHeight: '120px',
                resize: 'vertical'
              }}
              disabled={isSubmitting}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 15px',
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
                padding: '10px 15px',
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
              {isSubmitting ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationModal;
