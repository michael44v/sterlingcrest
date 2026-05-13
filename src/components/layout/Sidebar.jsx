import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  SendHorizontal,
  Download,
  PiggyBank,
  History,
  CreditCard,
  User,
  ShieldCheck,
  LogOut,
  X
} from 'lucide-react';

const Sidebar = ({ open, onClose }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Send Money', path: '/transfer/send', icon: SendHorizontal },
    { name: 'Fund Account', path: '/deposit', icon: Download },
    { name: 'Savings', path: '/savings', icon: PiggyBank },
    { name: 'History', path: '/history', icon: History },
    { name: 'Account', path: '/account', icon: CreditCard },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'KYC', path: '/kyc', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-chase-navy text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        md:relative md:transform-none
        ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 text-xl font-bold border-b border-white/10 flex items-center justify-between">
          <span>NorthBridge Bank</span>
          <button
            onClick={onClose}
            className="md:hidden p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-chase-blue text-white' : 'hover:bg-white/10'
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
