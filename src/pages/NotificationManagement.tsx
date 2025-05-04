import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Plus } from 'lucide-react';

const NotificationManagement: React.FC = () => {
  const navigate = useNavigate();

  // TODO: Replace with actual notification data from API
  const notifications = [
    { id: '1', title: 'Visa Expiry Alert', message: 'John Doe visa will expire in 2 weeks', type: 'warning', read: false },
    { id: '2', title: 'New Document Added', message: 'Jane Smith added a new passport document', type: 'info', read: true },
    { id: '3', title: 'System Update', message: 'System will be updated tomorrow at 2 AM', type: 'info', read: false },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={() => navigate('/notifications/new')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Notification
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`p-4 border rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-white'}`}
          >
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-4 ${
                notification.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                <Bell className={`w-5 h-5 ${
                  notification.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                }`} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">{notification.title}</h3>
                <p className="text-gray-600">{notification.message}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">3 hours ago</span>
                  <button className="text-blue-500 text-sm hover:text-blue-700">
                    Mark as {notification.read ? 'unread' : 'read'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationManagement;
