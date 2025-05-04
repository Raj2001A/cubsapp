import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, User, FileText, Bell, Settings } from 'lucide-react';

interface SidebarProps {
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: User, label: 'Employees', path: '/employees' },
    { icon: FileText, label: 'Documents', path: '/documents' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="bg-white h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Employee Management</h2>
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="absolute bottom-0 w-full p-4 border-t">
        <button
          onClick={onToggle}
          className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5 mr-3" />
          Hide Sidebar
        </button>
      </div>
    </div>
  );
};
