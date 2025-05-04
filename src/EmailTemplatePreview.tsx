import React from 'react';

interface EmailTemplatePreviewProps {
  templateType: '7days' | '14days' | '30days' | 'expired';
  documentType: string;
  employeeName: string;
  documentName: string;
  expiryDate: string;
}

const EmailTemplatePreview: React.FC<EmailTemplatePreviewProps> = ({
  templateType,
  documentType,
  employeeName,
  documentName,
  expiryDate
}) => {
  const getTemplateTitle = () => {
    switch (templateType) {
      case '7days':
        return `URGENT: ${documentType} Expiring in 7 Days`;
      case '14days':
        return `REMINDER: ${documentType} Expiring in 14 Days`;
      case '30days':
        return `NOTICE: ${documentType} Expiring in 30 Days`;
      case 'expired':
        return `ALERT: ${documentType} Has Expired`;
      default:
        return `Document Expiry Notification`;
    }
  };

  const getTemplateColor = () => {
    switch (templateType) {
      case '7days':
        return '#f44336'; // Red
      case '14days':
        return '#ff9800'; // Orange
      case '30days':
        return '#2196f3'; // Blue
      case 'expired':
        return '#b71c1c'; // Dark Red
      default:
        return '#333333';
    }
  };

  const getTemplateContent = () => {
    const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    switch (templateType) {
      case '7days':
        return (
          <>
            <p>This is an <strong>urgent notification</strong> that the following document is expiring in 7 days:</p>
            <p><strong>Employee:</strong> {employeeName}</p>
            <p><strong>Document:</strong> {documentName}</p>
            <p><strong>Expiry Date:</strong> {formattedDate}</p>
            <p>Please take immediate action to renew this document to avoid compliance issues.</p>
            <p>If this document has already been renewed, please update the system with the new expiry date.</p>
          </>
        );
      case '14days':
        return (
          <>
            <p>This is a reminder that the following document is expiring in 14 days:</p>
            <p><strong>Employee:</strong> {employeeName}</p>
            <p><strong>Document:</strong> {documentName}</p>
            <p><strong>Expiry Date:</strong> {formattedDate}</p>
            <p>Please begin the renewal process to ensure timely completion before expiry.</p>
            <p>If this document has already been renewed, please update the system with the new expiry date.</p>
          </>
        );
      case '30days':
        return (
          <>
            <p>This is an advance notice that the following document will expire in 30 days:</p>
            <p><strong>Employee:</strong> {employeeName}</p>
            <p><strong>Document:</strong> {documentName}</p>
            <p><strong>Expiry Date:</strong> {formattedDate}</p>
            <p>Please plan accordingly to ensure the document is renewed before expiry.</p>
            <p>If this document has already been renewed, please update the system with the new expiry date.</p>
          </>
        );
      case 'expired':
        return (
          <>
            <p>This is an <strong>urgent alert</strong> that the following document has expired:</p>
            <p><strong>Employee:</strong> {employeeName}</p>
            <p><strong>Document:</strong> {documentName}</p>
            <p><strong>Expiry Date:</strong> {formattedDate}</p>
            <p>Immediate action is required to renew this document to maintain compliance.</p>
            <p>If this document has already been renewed, please update the system with the new expiry date immediately.</p>
          </>
        );
      default:
        return (
          <>
            <p>Document expiry notification:</p>
            <p><strong>Employee:</strong> {employeeName}</p>
            <p><strong>Document:</strong> {documentName}</p>
            <p><strong>Expiry Date:</strong> {formattedDate}</p>
          </>
        );
    }
  };

  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      overflow: 'hidden',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        backgroundColor: getTemplateColor(), 
        color: 'white', 
        padding: '16px',
        borderBottom: '1px solid #ddd'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>{getTemplateTitle()}</h3>
      </div>
      <div style={{ padding: '20px', color: '#333', fontSize: '14px', lineHeight: '1.6' }}>
        {getTemplateContent()}
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', fontSize: '12px', color: '#666' }}>
          <p>This is an automated notification from the Employee Document Management System.</p>
          <p>Please do not reply to this email. For assistance, contact the HR department.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatePreview;
