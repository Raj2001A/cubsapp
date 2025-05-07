import React from 'react';
import { useParams } from 'react-router-dom';
import { useEmployeeNotifications } from '../hooks/useEmployeeNotifications';
import { NotificationCard } from '../components/NotificationCard';
import Button from '../components/ui/Button';
import { Bell } from 'lucide-react';

export const EmployeeNotifications: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const { data: notifications, isLoading } = useEmployeeNotifications(employeeId);

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Notifications</h2>
        <Button>
          <Bell className="w-4 h-4 mr-2" />
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-4">
        {notifications?.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onDismiss={() => console.log('Dismiss notification', notification.id)}
            onRead={() => console.log('Mark as read', notification.id)}
          />
        ))}
      </div>
    </div>
  );
};
