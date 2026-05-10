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
  LogOut
} from 'lucide-react';

const Sidebar = () => {
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
    <aside className="w-64 bg-chase-navy text-white flex flex-col hidden md:flex">
      <div className="p-6 text-xl font-bold border-b border-white/10">
        NorthBridge Bank
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
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
  );
};

export default Sidebar;
