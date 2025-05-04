import React from 'react';

interface NotificationBadgeProps {
  count: number;
  onClick: () => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, onClick }) => {
  if (count === 0) return null;

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        cursor: 'pointer',
        padding: '8px 12px',
        backgroundColor: count > 0 ? '#ffebee' : 'transparent',
        color: '#d32f2f',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '0.875rem',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
      <span>
        {count} Document{count !== 1 ? 's' : ''} Expiring
      </span>
    </div>
  );
};

export default NotificationBadge;
