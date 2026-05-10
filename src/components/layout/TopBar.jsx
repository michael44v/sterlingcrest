import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Menu, X } from 'lucide-react';

const TopBar = ({ onMenuClick, sidebarOpen }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-chase-border flex items-center justify-between px-4 md:px-8 z-30 relative">
      <div className="flex items-center gap-3">

        {/* Hamburger / Close — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {sidebarOpen
            ? <X size={20} className="text-gray-600" />
            : <Menu size={20} className="text-gray-600" />
          }
        </button>

        <div className="text-gray-500 text-sm">
          Welcome back,{' '}
          <span className="font-semibold text-chase-navy">{user?.full_name}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
        <div className="w-8 h-8 bg-chase-blue text-white rounded-full flex items-center justify-center text-sm font-bold select-none">
          {user?.full_name?.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default TopBar;