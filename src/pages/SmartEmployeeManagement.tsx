import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types/user';
import { ChevronRight } from 'lucide-react';

const SmartEmployeeManagement: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();

  // TODO: Replace with actual smart management features from API
  const smartFeatures = [
    {
      title: 'Visa Expiry Tracking',
      description: 'Automatically track and notify about visa expirations',
      count: 12,
      path: '/visa-expiry',
    },
    {
      title: 'Document Management',
      description: 'Smart document categorization and organization',
      count: 45,
      path: '/documents',
    },
    {
      title: 'Employee Analytics',
      description: 'Insights and statistics about your team',
      count: 8,
      path: '/analytics',
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Smart Employee Management</h1>
        <div className="text-gray-600">Welcome, {user.name}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {smartFeatures.map((feature) => (
          <div
            key={feature.title}
            className="bg-white p-6 rounded-lg shadow flex flex-col"
          >
            <h2 className="text-lg font-semibold mb-2">{feature.title}</h2>
            <p className="text-gray-600 mb-4">{feature.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-blue-600 font-semibold">{feature.count} items</span>
              <button
                onClick={() => navigate(feature.path)}
                className="text-blue-600 hover:text-blue-800"
              >
                View Details
                <ChevronRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartEmployeeManagement;
