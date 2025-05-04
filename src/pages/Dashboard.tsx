import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext';
import { User } from '../types/user';
import { Users, FileText, BellRing, Clock, AlertTriangle, ChevronRight } from 'lucide-react';

interface DashboardProps {
  user: User;
  onViewEmployee?: (employeeId: string) => void;
}

export default function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate();
  const { employees, searchEmployees } = useEmployees();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    documentsExpiring: 0,
    pendingNotifications: 0
  });

  useEffect(() => {
    // Calculate statistics from employees data
    const calcStats = () => {
      const docsExpiring = employees.reduce((count, emp) => {
        const expiringDocs = emp.documents.filter(doc => 
          doc.status === 'expiring'
        ).length;
        return count + expiringDocs;
      }, 0);

      setStats({
        totalEmployees: employees.length,
        documentsExpiring: docsExpiring,
        pendingNotifications: Math.floor(Math.random() * 10) // Mock data
      });
    };

    if (employees.length > 0) {
      calcStats();
    } else {
      // Fetch employees if not already loaded
      searchEmployees('', 1, 300);
    }
  }, [employees, searchEmployees]);

  return (
    <div className="p-6 min-h-screen"
         style={{ 
           backgroundImage: 'url(/bg2.jpg)', 
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name}</h1>
          <div className="text-sm text-gray-600">
            <Clock className="inline mr-2 h-4 w-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <p className="text-gray-600 mb-4">Role: {user.role || 'Administrator'}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-blue-50 rounded-lg p-5 border border-blue-100 flex items-center">
            <div className="bg-blue-500 text-white p-3 rounded-full mr-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-blue-600">Total Employees</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</h3>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-lg p-5 border border-amber-100 flex items-center">
            <div className="bg-amber-500 text-white p-3 rounded-full mr-4">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-amber-600">Documents Expiring Soon</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.documentsExpiring}</h3>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-5 border border-purple-100 flex items-center">
            <div className="bg-purple-500 text-white p-3 rounded-full mr-4">
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-purple-600">Pending Notifications</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.pendingNotifications}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow hover:shadow-lg transition-all"
          >
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-3" />
              <span>Manage Employees</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center justify-between p-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow hover:shadow-lg transition-all"
          >
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-3" />
              <span>Document Management</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => navigate('/notifications')}
            className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow hover:shadow-lg transition-all"
          >
            <div className="flex items-center">
              <BellRing className="w-5 h-5 mr-3" />
              <span>View Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {stats.documentsExpiring > 0 && (
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center">
            <AlertTriangle className="text-amber-500 mr-3" />
            <p className="text-amber-700">
              There are <strong>{stats.documentsExpiring}</strong> documents expiring soon. 
              <button 
                onClick={() => navigate('/documents')} 
                className="ml-2 text-blue-600 hover:underline"
              >
                Review now
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
