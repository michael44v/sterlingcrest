import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, SendHorizontal, History, User, Globe } from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transfer', path: '/transfer/send', icon: SendHorizontal },
    { name: 'E Transfer', path: '/transfer/send?type=external', icon: Globe },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-chase-border flex justify-around items-center p-2 z-40 md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              isActive ? 'text-chase-blue' : 'text-gray-500 hover:text-chase-navy'
            }`
          }
        >
          <item.icon size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
