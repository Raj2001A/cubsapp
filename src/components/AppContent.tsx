import { Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './layout/Sidebar';
import { User } from '../types/user';
import BackgroundSlideshow from './BackgroundSlideshow';
import '../styles/cubs-theme.css';
import '../styles/animations.css';
import { LogOut, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AppContentProps {
  isAuthenticated: boolean;
  user: User | null;
  onToggleSidebar: () => void;
  children?: React.ReactNode;
}

export default function AppContent({ isAuthenticated, user, onToggleSidebar, children }: AppContentProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <BackgroundSlideshow interval={8000} opacity={0.15}>
      <div className="flex h-screen overflow-hidden bg-transparent cubs-theme">
        <Sidebar onToggle={onToggleSidebar} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="bg-primary-700 text-white py-3 px-4 shadow-md animate-fade-in">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-xl font-bold">CUBS HR Portal</h1>
              {user && (
                <div className="flex items-center space-x-4">
                  <button className="flex items-center bg-primary-600 hover:bg-primary-500 rounded-full p-2 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">3</span>
                  </button>
                  
                  <div className="flex items-center bg-primary-800/50 px-3 py-1.5 rounded-full">
                    <div className="w-8 h-8 rounded-full bg-primary-300 flex items-center justify-center text-white mr-2">
                      {user.name.charAt(0)}
                    </div>
                    <span className="mr-2 font-medium">{user.name}</span>
                  </div>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors"
                    aria-label="Logout"
                  >
                    <LogOut className="w-4 h-4 mr-1.5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <div className="container mx-auto staggered-list animate-slide-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </BackgroundSlideshow>
  );
}
