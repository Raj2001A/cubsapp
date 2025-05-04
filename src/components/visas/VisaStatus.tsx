import React from 'react';
import { EmployeeVisaStatus } from '../../types/employees';

interface VisaStatusProps {
  status?: EmployeeVisaStatus;
}

const VisaStatus: React.FC<VisaStatusProps> = ({ status }) => {
  // Get status badge style
  const getStatusBadgeStyle = () => {
    switch (status) {
      case EmployeeVisaStatus.ACTIVE:
        return { backgroundColor: '#e8f5e9', color: '#388e3c' };
      case EmployeeVisaStatus.EXPIRING:
        return { backgroundColor: '#fff8e1', color: '#ffa000' };
      case EmployeeVisaStatus.EXPIRED:
        return { backgroundColor: '#ffebee', color: '#d32f2f' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#757575' };
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (status) {
      case EmployeeVisaStatus.ACTIVE:
        return 'Active';
      case EmployeeVisaStatus.EXPIRING:
        return 'Expiring Soon';
      case EmployeeVisaStatus.EXPIRED:
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const badgeStyle = getStatusBadgeStyle();
  const statusText = getStatusText();

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '500',
      ...badgeStyle
    }}>
      {statusText}
    </span>
  );
};

export default VisaStatus;
