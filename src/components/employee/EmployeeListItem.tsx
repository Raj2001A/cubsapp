import React from 'react';
import { Employee, EmployeeVisaStatus } from '../../types/employees';

interface EmployeeListItemProps {
  employee: Employee;
  onViewEmployee: (id: string) => void;
}

// Helper function to get status badge style
const getStatusBadgeStyle = (status: EmployeeVisaStatus | string) => {
  switch (status) {
    case 'active':
      return { backgroundColor: '#ecfdf5', color: '#10b981' };
    case 'expiring':
      return { backgroundColor: '#fff8e1', color: '#ffa000' };
    case 'expired':
      return { backgroundColor: '#ffebee', color: '#d32f2f' };
    default:
      return { backgroundColor: '#f5f5f5', color: '#757575' };
  }
};

// Memoized employee list item component to prevent unnecessary re-renders
const EmployeeListItem: React.FC<EmployeeListItemProps> = React.memo(
  ({ employee, onViewEmployee }) => {
    return (
      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
        <td style={{ padding: '12px 16px' }}>{employee.employeeId}</td>
        <td style={{ padding: '12px 16px' }}>
          <div>
            <div style={{ fontWeight: '500', color: '#111827' }}>{employee.name}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{employee.email}</div>
          </div>
        </td>
        <td style={{ padding: '12px 16px' }}>{employee.trade}</td>
        <td style={{ padding: '12px 16px' }}>{employee.nationality}</td>
        <td style={{ padding: '12px 16px' }}>{employee.companyName}</td>
        <td style={{ padding: '12px 16px' }}>{new Date(employee.joinDate).toLocaleDateString()}</td>
        <td style={{ padding: '12px 16px' }}>
          <span style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: '500',
            ...getStatusBadgeStyle(employee.visaStatus)
          }}>
            {employee.visaStatus === 'active' ? 'Active' :
              employee.visaStatus === 'expiring' ? 'Expiring Soon' :
                'Expired'}
          </span>
        </td>
        <td style={{ padding: '12px 16px' }}>
          <button
            onClick={() => onViewEmployee(employee.id)}
            style={{
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginRight: '8px'
            }}
          >
            View
          </button>
        </td>
      </tr>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if any of these properties change
    return (
      prevProps.employee.id === nextProps.employee.id &&
      prevProps.employee.name === nextProps.employee.name &&
      prevProps.employee.email === nextProps.employee.email &&
      prevProps.employee.trade === nextProps.employee.trade &&
      prevProps.employee.nationality === nextProps.employee.nationality &&
      prevProps.employee.companyName === nextProps.employee.companyName &&
      prevProps.employee.joinDate === nextProps.employee.joinDate &&
      prevProps.employee.visaStatus === nextProps.employee.visaStatus
    );
  }
);

export default EmployeeListItem;
