import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, Building2, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import SidebarToggle from './SidebarToggle';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary-800' : '';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* SidebarToggle component */}
      <SidebarToggle 
        isOpen={isSidebarOpen} 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'flex' : 'hidden'} md:flex fixed md:static z-40 h-full w-64 bg-white border-r border-[#DD1A51] shadow-lg flex-col`}>
        <div className="p-4 flex-shrink-0 flex items-center space-x-2">
          <Users className="h-8 w-8 text-[#DD1A51]" />
          <h1 className="text-xl font-bold text-[#DD1A51]">Cubs Technical</h1>
        </div>
        <nav className="mt-8 flex-grow">
          <ul className="space-y-1">
            {isAdmin ? (
              <>
                <li>
                  <Link
                    to="/"
                    className={`flex items-center px-4 py-3 rounded-lg hover:bg-[#ffe5ed] hover:text-[#b3123e] transition-colors ${isActive('/')}`}
                  >
                    <LayoutDashboard className="h-5 w-5 mr-3" />
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/employees"
                    className={`flex items-center px-4 py-3 rounded-lg hover:bg-[#ffe5ed] hover:text-[#b3123e] transition-colors ${isActive('/employees')}`}
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Employees
                  </Link>
                </li>
                <li>
                  <Link
                    to="/departments"
                    className={`flex items-center px-4 py-3 rounded-lg hover:bg-[#ffe5ed] hover:text-[#b3123e] transition-colors ${isActive('/departments')}`}
                  >
                    <Building2 className="h-5 w-5 mr-3" />
                    Departments
                  </Link>
                </li>
                <li>
                  <Link
                    to="/settings"
                    className={`flex items-center px-4 py-3 rounded-lg hover:bg-[#ffe5ed] hover:text-[#b3123e] transition-colors ${isActive('/settings')}`}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Link>
                </li>
              </>
            ) : (
              <li>
                <Link
                  to="/employee-dashboard"
                  className={`flex items-center px-4 py-3 rounded-lg hover:bg-[#ffe5ed] hover:text-[#b3123e] transition-colors ${isActive('/employee-dashboard')}`}
                >
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  My Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>
        <div className="p-4 flex-shrink-0">
          {user && (
            <div className="mb-4 px-4 py-3 bg-[#ffe5ed] rounded-lg">
              <p className="text-sm font-medium text-[#b3123e]">Logged in as</p>
              <p className="text-[#DD1A51] truncate font-semibold">{user.name || user.email}</p>
              <p className="text-xs text-[#b3123e]">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center text-[#b3123e] hover:text-[#DD1A51] transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-auto">
        <header className="bg-white shadow-sm sticky top-0 z-10 rounded-b-2xl">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
            <h2 className="text-xl font-semibold text-[#DD1A51] flex-1">
              {location.pathname === '/' && 'Dashboard'}
              {location.pathname === '/employees' && 'Employee Management'}
              {location.pathname === '/departments' && 'Department Overview'}
              {location.pathname === '/settings' && 'System Settings'}
              {location.pathname === '/employee-dashboard' && 'My Dashboard'}
              {location.pathname.startsWith('/employees/') && 'Employee Details'}
            </h2>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 bg-[#f8f9fa] overflow-x-auto min-w-0">
          <Outlet />
        </main>
        <footer className="mt-auto text-center text-[#DD1A51] border-t border-[#ffe5ed] pt-6 pb-4 bg-white">
          <p>{new Date().getFullYear()} CUBS Employee Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
