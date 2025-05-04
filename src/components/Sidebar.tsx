import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const SIDEBAR_BG = 'bg-white border-r border-[#DD1A51] shadow-lg';
const SIDEBAR_LINK = 'block px-4 py-2 rounded-md transition-colors duration-150 font-medium text-lg';
const SIDEBAR_LINK_ACTIVE = 'bg-[#DD1A51] text-white shadow';
const SIDEBAR_LINK_HOVER = 'hover:bg-[#ffe5ed] hover:text-[#b3123e]';
const SIDEBAR_LINK_INACTIVE = 'text-[#DD1A51]';

interface SidebarProps {
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const isAdmin = user?.role === 'Administrator';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => setIsDesktop(window.innerWidth >= 768);
      handleResize(); // set initial value
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const location = useLocation();
  const isEmployeesPage = location.pathname === '/employees' || location.pathname.startsWith('/employees/');
  
  // Apply special styling for the sidebar when on employee pages
  const sidebarClass = isEmployeesPage 
    ? `${SIDEBAR_BG} z-30 shadow-xl` 
    : SIDEBAR_BG;
  
  const toggleSidebar = () => {
    setOpen(!open);
    // If parent component provided onToggle prop, call it
    if (onToggle) onToggle();
  };

  if (!user) return null; // Defensive: only render if user context is present

  const navLinks = [
    { name: 'Dashboard', to: '/dashboard', icon: '🏠' },
    { name: 'Employees', to: '/employees', icon: '👥', adminOnly: true },
    { name: 'Portal', to: '/employeePortal', icon: '🪪', employeeOnly: true },
    {
      name: 'Settings',
      to: '/settings',
      icon: <svg className="inline-block" width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#DD1A51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Zm7.94-2.5a7.96 7.96 0 0 0-.6-2.29l1.66-1.3a1 1 0 0 0 .24-1.32l-1.58-2.74a1 1 0 0 0-1.25-.46l-1.96.79a8.12 8.12 0 0 0-1.98-1.15l-.3-2.08A1 1 0 0 0 13.02 2h-3.16a1 1 0 0 0-.99.85l-.3 2.08a8.12 8.12 0 0 0-1.98 1.15l-1.96-.8a1 1 0 0 0-1.25.47L2.36 8.36a1 1 0 0 0 .24 1.32l1.66 1.3c-.13.47-.23.96-.29 1.46-.06.5-.09 1.01-.09 1.53s.03 1.03.09 1.53c.06.5.16.99.29 1.46l-1.66 1.3a1 1 0 0 0-.24 1.32l1.58 2.74a1 1 0 0 0 1.25.46l1.96-.79c.6.44 1.25.83 1.98 1.15l.3 2.08a1 1 0 0 0 .99.85h3.16a1 1 0 0 0 .99-.85l.3-2.08c.73-.32 1.38-.71 1.98-1.15l1.96.8a1 1 0 0 0 1.25-.47l1.58-2.74a1 1 0 0 0-.24-1.32l-1.66-1.3c.13-.47.23-.96.29-1.46.06-.5.09-1.01.09-1.53s-.03-1.03-.09-1.53Z"/></svg>,
      adminOnly: false,
      employeeOnly: false,
    },
  ];

  const managementLinks = [
    { name: 'Documents', to: '/documents', icon: '📄' },
    { name: 'Notifications', to: '/notifications', icon: '🔔' },
    { name: 'Smart Management', to: '/smartEmployeeManagement', icon: '💡', adminOnly: true },
  ];

  const handleNavLinkClick = () => {
    if (!isDesktop) setOpen(false);
  };

  return (
    <>
      <button 
        onClick={toggleSidebar} 
        className="md:hidden fixed top-4 left-4 z-50 bg-[#DD1A51] text-white p-2 rounded-md"
        aria-label="Toggle Sidebar"
      >
        {open ? '✕' : '☰'}
      </button>
      <AnimatePresence>
        {(open || isDesktop) && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed md:relative md:block top-0 left-0 h-full w-64 ${sidebarClass} ${isEmployeesPage ? 'z-40' : 'z-30'}`}
          >
            <div className="flex flex-col h-full bg-white border-r border-[#DD1A51] shadow-lg">
              <div className="p-6 flex flex-col items-center justify-center">
                <img src="/companylogo.png" alt="CUBS Group of Companies Logo" className="h-14 mb-2" />
                <span className="text-[#DD1A51] font-bold text-lg text-center">GROUP OF COMPANIES<br /><span className="text-xs text-[#b3123e]">UAE-QATAR-OMAN-KSA</span></span>
              </div>
              <nav className="flex-1 flex flex-col gap-2 p-4" aria-label="Main navigation">
                {navLinks.map(link => {
                  if (link.adminOnly && !isAdmin) return null;
                  if (link.employeeOnly && isAdmin) return null;
                  return (
                    <NavLink
                      key={link.name}
                      to={link.to}
                      className={({ isActive }) =>
                        `${SIDEBAR_LINK} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_INACTIVE} ${SIDEBAR_LINK_HOVER}`
                      }
                      onClick={handleNavLinkClick}
                    >
                      <span className="mr-3">{link.icon}</span>
                      {link.name}
                    </NavLink>
                  );
                })}
                {/* Management Dropdown */}
                <details className="group" open>
                  <summary className="flex items-center px-4 py-3 rounded-2xl cursor-pointer text-lg hover:bg-[#ffe5ed] hover:text-[#b3123e]">
                    <span className="mr-3">🗂️</span>Management
                    <svg className="ml-auto transition-transform group-open:rotate-90" width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#DD1A51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </summary>
                  <div className="ml-7 mt-1 space-y-1">
                    {managementLinks.map(link => {
                      if (link.adminOnly && !isAdmin) return null;
                      return (
                        <NavLink
                          key={link.name}
                          to={link.to}
                          className={({ isActive }) =>
                            `${SIDEBAR_LINK} ${isActive ? SIDEBAR_LINK_ACTIVE : SIDEBAR_LINK_INACTIVE} ${SIDEBAR_LINK_HOVER}`
                          }
                          onClick={handleNavLinkClick}
                        >
                          <span className="mr-3">{link.icon}</span>
                          {link.name}
                        </NavLink>
                      );
                    })}
                  </div>
                </details>
              </nav>
              <div className="mt-auto p-6">
                <div className="text-xs text-[#DD1A51]/80">{user?.name} ({user?.role})</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Overlay for mobile */}
      {open && !isDesktop && (
        <button
          className="fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Sidebar overlay, close sidebar"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') setOpen(false); }}
        />
      )}
    </>
  );
};

export default Sidebar;
