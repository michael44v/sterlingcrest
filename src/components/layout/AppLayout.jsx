import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ChatBot from '../ui/ChatBot';

const AppLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="p-4 md:p-8">
          {children}
        </main>
        <ChatBot />
      </div>
    </div>
  );
};

export default AppLayout;
