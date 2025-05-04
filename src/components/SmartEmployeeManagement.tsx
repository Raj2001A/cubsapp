import React from 'react';
import { User } from '@/types/user';

interface SmartEmployeeManagementProps {
  user: User;
}

const SmartEmployeeManagement: React.FC<SmartEmployeeManagementProps> = ({ user }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Smart Employee Management</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user.name}</h2>
        <p className="text-gray-600 mb-4">
          Use our AI-powered tools to efficiently manage your employee operations.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <h3 className="font-medium text-lg">Document Analysis</h3>
            <p className="text-sm text-gray-500">
              Automatically extract and categorize information from employee documents.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <h3 className="font-medium text-lg">Visa Expiry Alerts</h3>
            <p className="text-sm text-gray-500">
              Get smart notifications before employee visas expire.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <h3 className="font-medium text-lg">Employee Insights</h3>
            <p className="text-sm text-gray-500">
              Gain valuable insights through data analysis of your workforce.
            </p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
            <h3 className="font-medium text-lg">Automated Workflows</h3>
            <p className="text-sm text-gray-500">
              Set up custom workflows for onboarding, document renewals, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartEmployeeManagement;
