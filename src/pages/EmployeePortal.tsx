import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext';
import { User } from '../types/user';
import { FileText, BellRing, User as UserIcon } from 'lucide-react';

const EmployeePortal: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const { searchEmployees } = useEmployees();

  useEffect(() => {
    // Load employee data when component mounts
    searchEmployees('', 1, 300);
  }, [searchEmployees]);

  return (
    <div className="min-h-screen p-6"
         style={{ 
           backgroundImage: 'url(/bg4.jpg)', 
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Employee Portal</h1>
          <div className="text-sm text-gray-600">
            Welcome, {user.name}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg shadow border border-blue-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="bg-blue-500 text-white p-3 rounded-full inline-flex mb-4">
              <UserIcon className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Profile</h2>
            <p className="text-gray-600 mb-6">View and update your personal information and documents</p>
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <span>View Profile</span>
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg shadow border border-green-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="bg-green-500 text-white p-3 rounded-full inline-flex mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Documents</h2>
            <p className="text-gray-600 mb-6">Access and manage your documents and certificates</p>
            <button
              onClick={() => navigate('/documents')}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <span>View Documents</span>
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-lg shadow border border-purple-200 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1">
            <div className="bg-purple-500 text-white p-3 rounded-full inline-flex mb-4">
              <BellRing className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold mb-3 text-gray-800">Notifications</h2>
            <p className="text-gray-600 mb-6">View your notifications, alerts and important updates</p>
            <button
              onClick={() => navigate('/notifications')}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
            >
              <span>View Notifications</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Recent Activity</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center text-gray-700">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              <span>Your passport is expiring in 30 days</span>
              <span className="ml-auto text-sm text-gray-500">2 days ago</span>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center text-gray-700">
              <BellRing className="h-5 w-5 mr-2 text-purple-500" />
              <span>New announcement from HR department</span>
              <span className="ml-auto text-sm text-gray-500">1 week ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
