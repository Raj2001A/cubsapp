import React from 'react';

interface StatisticsCardsProps {
  totalEmployees: number;
  activeVisas: number;
  expiringVisas: number;
  expiredVisas: number;
  documentCompliance: number;
  newHires: number;
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({
  totalEmployees,
  activeVisas,
  expiringVisas,
  expiredVisas,
  documentCompliance,
  newHires
}) => {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* Total Employees Card */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
          Total Employees
        </div>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '8px'
        }}>
          {totalEmployees}
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: '0.875rem',
          color: '#10b981'
        }}>
          <span style={{ marginRight: '4px' }}>↑</span>
          <span>{newHires} new this month</span>
        </div>
      </div>

      {/* Visa Status Card */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
          Visa Status
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
              {activeVisas}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Active</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {expiringVisas}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Expiring</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
              {expiredVisas}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Expired</div>
          </div>
        </div>
        <div style={{ 
          height: '4px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '2px',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: '#10b981',
              width: `${(activeVisas / totalEmployees) * 100}%`
            }} 
          />
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: '#f59e0b',
              width: `${(expiringVisas / totalEmployees) * 100}%`
            }} 
          />
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: '#ef4444',
              width: `${(expiredVisas / totalEmployees) * 100}%`
            }} 
          />
        </div>
      </div>

      {/* Document Compliance Card */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
          Document Compliance
        </div>
        <div style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: documentCompliance >= 90 ? '#10b981' : 
                 documentCompliance >= 70 ? '#f59e0b' : '#ef4444',
          marginBottom: '8px'
        }}>
          {documentCompliance}%
        </div>
        <div style={{ 
          height: '8px', 
          backgroundColor: '#f3f4f6', 
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: documentCompliance >= 90 ? '#10b981' : 
                              documentCompliance >= 70 ? '#f59e0b' : '#ef4444',
              width: `${documentCompliance}%`
            }} 
          />
        </div>
      </div>

      {/* Action Items Card */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
          Action Items
        </div>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '8px',
            backgroundColor: '#fee2e2',
            borderRadius: '4px',
            color: '#b91c1c',
            fontSize: '0.875rem',
            alignItems: 'center'
          }}>
            <span>{expiredVisas} expired visas</span>
            <button style={{ 
              backgroundColor: '#ef4444', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}>
              View
            </button>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '8px',
            backgroundColor: '#fef3c7',
            borderRadius: '4px',
            color: '#92400e',
            fontSize: '0.875rem',
            alignItems: 'center'
          }}>
            <span>{expiringVisas} expiring visas</span>
            <button style={{ 
              backgroundColor: '#f59e0b', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}>
              View
            </button>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            color: '#4b5563',
            fontSize: '0.875rem',
            alignItems: 'center'
          }}>
            <span>{newHires} new employees to onboard</span>
            <button style={{ 
              backgroundColor: '#6b7280', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}>
              View
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsCards;
