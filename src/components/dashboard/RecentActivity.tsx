import React from 'react';

interface ActivityItem {
  id: string;
  type: 'new_employee' | 'document_upload' | 'visa_update' | 'employee_update';
  description: string;
  timestamp: string;
  employee?: {
    id: string;
    name: string;
  };
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  // Function to get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'new_employee':
        return (
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#dcfce7', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
            </svg>
          </div>
        );
      case 'document_upload':
        return (
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#e0f2fe', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#0ea5e9'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.01l1.41 1.41L11 14.84V19h2v-4.16l1.59 1.59L16 15.01 12.01 11 8 15.01z" fill="currentColor" />
            </svg>
          </div>
        );
      case 'visa_update':
        return (
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#fef3c7', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#f59e0b'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor" />
            </svg>
          </div>
        );
      case 'employee_update':
        return (
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#f3e8ff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#a855f7'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor" />
            </svg>
          </div>
        );
      default:
        return (
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            backgroundColor: '#f3f4f6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#6b7280'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor" />
            </svg>
          </div>
        );
    }
  };

  // Function to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#374151' }}>
        Recent Activity
      </h3>
      
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {activities.map(activity => (
          <div 
            key={activity.id} 
            style={{ 
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start'
            }}
          >
            {getActivityIcon(activity.type)}
            
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', color: '#111827' }}>
                {activity.description}
                {activity.employee && (
                  <span style={{ fontWeight: '500' }}> {activity.employee.name}</span>
                )}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                {formatTimestamp(activity.timestamp)}
              </div>
            </div>
            
            {activity.employee && (
              <button
                style={{
                  backgroundColor: '#f9fafb',
                  color: '#4b5563',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                View
              </button>
            )}
          </div>
        ))}
        
        {activities.length === 0 && (
          <div style={{ 
            padding: '16px', 
            textAlign: 'center', 
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            borderRadius: '4px'
          }}>
            No recent activity.
          </div>
        )}
      </div>
      
      {activities.length > 0 && (
        <div style={{ 
          marginTop: '16px', 
          textAlign: 'center'
        }}>
          <button
            style={{
              backgroundColor: 'transparent',
              color: '#4b5563',
              border: 'none',
              padding: '8px',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            View All Activity
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
