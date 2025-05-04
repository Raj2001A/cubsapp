import React from 'react';
import Button from './ui/Button';

interface VisaExpiryInfoProps {
  employee: any;
  onSendEmail: () => void;
  isSending: boolean;
}

const VisaExpiryInfo: React.FC<VisaExpiryInfoProps> = ({ employee, onSendEmail, isSending }) => {
  const expired = employee.daysRemaining < 0;
  return (
    <div className="bg-white rounded shadow p-4 mb-6 flex items-center justify-between">
      <div>
        <div className="font-semibold">Visa Expiry Date:</div>
        <div>{new Date(employee.visaExpiryDate).toLocaleDateString()} ({employee.daysRemaining} days {employee.daysRemaining < 0 ? 'ago' : 'remaining'})</div>
      </div>
      {expired && (
        <Button onClick={onSendEmail} variant="primary" disabled={isSending}>
          {isSending ? 'Sending...' : 'Send Visa Expiry Email'}
        </Button>
      )}
    </div>
  );
};

export default VisaExpiryInfo;
