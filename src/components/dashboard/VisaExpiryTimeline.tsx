import React from 'react';

interface ExpiryData {
  month: string;
  count: number;
}

interface VisaExpiryTimelineProps {
  expiryData: ExpiryData[];
  upcomingExpirations: {
    id: string;
    name: string;
    employeeId: string;
    expiryDate: string;
    company: string;
  }[];
}

const VisaExpiryTimeline: React.FC<VisaExpiryTimelineProps> = ({
  expiryData,
  upcomingExpirations
}) => {
  // Find the maximum count for scaling
  const maxCount = Math.max(...expiryData.map(d => d.count));

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, fontSize: '1rem', color: '#374151' }}>
          Visa Expiry Timeline
        </h3>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          Next 12 months
        </div>
      </div>
      
      {/* Timeline Chart */}
      <div style={{ 
        display: 'flex',
        height: '120px',
        alignItems: 'flex-end',
        gap: '4px',
        marginBottom: '8px',
        paddingLeft: '24px'
      }}>
        {expiryData.map((item, index) => (
          <div 
            key={index} 
            style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1
            }}
          >
            <div style={{ 
              height: `${(item.count / maxCount) * 100}px`,
              width: '100%',
              backgroundColor: index < 3 ? '#ef4444' : 
                              index < 6 ? '#f59e0b' : '#10b981',
              borderRadius: '4px 4px 0 0',
              position: 'relative'
            }}>
              {item.count > 0 && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-20px', 
                  left: '50%', 
                  transform: 'translateX(-50%)',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#4b5563'
                }}>
                  {item.count}
                </div>
              )}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#4b5563', 
              marginTop: '4px',
              textAlign: 'center'
            }}>
              {item.month}
            </div>
          </div>
        ))}
      </div>
      
      {/* Upcoming Expirations Table */}
      <div style={{ marginTop: '24px' }}>
        <h4 style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#4b5563' }}>
          Upcoming Visa Expirations
        </h4>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Employee</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>ID</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Company</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Expiry Date</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingExpirations.map((employee) => {
                const expiryDate = new Date(employee.expiryDate);
                const today = new Date();
                const diffTime = expiryDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let status = '';
                let statusColor = '';
                
                if (diffDays < 0) {
                  status = 'Expired';
                  statusColor = '#ef4444';
                } else if (diffDays <= 30) {
                  status = 'Critical';
                  statusColor = '#ef4444';
                } else if (diffDays <= 60) {
                  status = 'Warning';
                  statusColor = '#f59e0b';
                } else if (diffDays <= 90) {
                  status = 'Upcoming';
                  statusColor = '#10b981';
                }
                
                return (
                  <tr key={employee.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '8px 12px' }}>{employee.name}</td>
                    <td style={{ padding: '8px 12px' }}>{employee.employeeId}</td>
                    <td style={{ padding: '8px 12px' }}>{employee.company}</td>
                    <td style={{ padding: '8px 12px' }}>{new Date(employee.expiryDate).toLocaleDateString()}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: `${statusColor}20`,
                        color: statusColor,
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {status} ({diffDays < 0 ? `${Math.abs(diffDays)} days ago` : `${diffDays} days`})
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {upcomingExpirations.length === 0 && (
          <div style={{ 
            padding: '16px', 
            textAlign: 'center', 
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            borderRadius: '4px'
          }}>
            No upcoming visa expirations in the next 90 days.
          </div>
        )}
      </div>
    </div>
  );
};

export default VisaExpiryTimeline;
