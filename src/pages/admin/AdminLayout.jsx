import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, ShieldCheck, Activity, AlertTriangle, ArrowLeft } from 'lucide-react';

const AdminLayout = () => {
  const { user } = useAuth();

  // Strict role check
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'KYC Queue', path: '/admin/kyc', icon: ShieldCheck },
    { name: 'Transactions', path: '/admin/transactions', icon: Activity },
    { name: 'AML Flags', path: '/admin/aml', icon: AlertTriangle },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-chase-navy text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <span className="font-black text-xl tracking-tighter">ADMIN PANEL</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive ? 'bg-chase-blue text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to User View
          </NavLink>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
