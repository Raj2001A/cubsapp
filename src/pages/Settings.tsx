import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings as SettingsIcon, User, Key, Globe, Lock, LogOut, ChevronRight } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const settingsSections = [
    {
      icon: User,
      title: 'Profile',
      description: 'Manage your account information and preferences'
    },
    {
      icon: Key,
      title: 'Security',
      description: 'Change password and manage security settings'
    },
    {
      icon: Globe,
      title: 'Notifications',
      description: 'Configure notification preferences'
    },
    {
      icon: Lock,
      title: 'Privacy',
      description: 'Manage your privacy settings'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <SettingsIcon className="w-6 h-6 text-gray-400" />
      </div>

      <div className="space-y-6">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;
          return (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/settings/${section.title.toLowerCase()}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-50 rounded-lg mr-4">
                    <Icon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          );
        })}

        <button
          className="w-full p-4 bg-gray-100 rounded-lg text-gray-700 font-medium flex items-center justify-center hover:bg-gray-200"
          onClick={() => navigate('/login')} // Actually needs to call logout function
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
