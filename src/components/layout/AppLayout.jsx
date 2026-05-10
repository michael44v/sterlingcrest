import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import ChatBot from '../ui/ChatBot';
import { useState } from 'react';

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
  sidebarOpen={sidebarOpen}
  onMenuClick={() => setSidebarOpen(!sidebarOpen)}
/>

        <main className="p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
        <ChatBot />
        <MobileNav />
      </div>
    </div>
  );
};

export default AppLayout;
