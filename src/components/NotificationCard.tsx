import React from 'react';
import { Notification } from '../hooks/useEmployeeNotifications';
import { Button } from './ui/Button';
import { X, Check } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationCardProps {
  notification: Notification;
  onDismiss: () => void;
  onRead: () => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onDismiss,
  onRead,
}) => {
  const isExpired = notification.expiresAt
    ? new Date(notification.expiresAt) < new Date()
    : false;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <Check className="w-5 h-5" />;
      case 'error':
        return <X className="w-5 h-5" />;
      default:
        return <div className="w-5 h-5" />;
    }
  };

  return (
    <div
      className={`flex items-center p-4 rounded-lg shadow-sm border transition-all hover:shadow-md ${
        notification.read ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-white'
      }`}
    >
      <div className="flex-shrink-0">
        {getIcon()}
      </div>
      <div className="ml-4 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
        <p className="text-sm text-gray-500 truncate">{notification.message}</p>
        <p className="text-xs text-gray-400">
          {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
        </p>
      </div>
      <div className="ml-4 flex-shrink-0 flex space-x-2">
        {!notification.read && (
          <Button variant="outline" size="sm" onClick={onRead}>
            Mark as Read
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Dismiss
        </Button>
      </div>
    </div>
  );
};
