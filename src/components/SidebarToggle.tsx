import React from 'react';
import { Menu, X } from 'lucide-react';

interface SidebarToggleProps {
  isOpen: boolean;
  onClick: () => void;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ isOpen, onClick }) => {
  return (
    <button 
      className="fixed top-4 left-4 z-[9999] p-3 bg-white rounded-md shadow-xl border-2 border-[#DD1A51] text-[#DD1A51] hover:bg-[#ffe5ed] transition-all duration-300"
      onClick={onClick}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );
};

export default SidebarToggle;
