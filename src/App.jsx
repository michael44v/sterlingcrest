import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

// User Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardHome from './pages/dashboard/DashboardHome';
import AccountDetails from './pages/account/AccountDetails';
import VirtualCard from './pages/account/VirtualCard';
import SendMoney from './pages/transfer/SendMoney';
import TransactionHistory from './pages/history/TransactionHistory';
import KYCUpload from './pages/kyc/KYCUpload';
import KYCStatus from './pages/kyc/KYCStatus';
import SavingsGoals from './pages/savings/SavingsGoals';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserList from './pages/admin/UserList';
import KYCQueue from './pages/admin/KYCQueue';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* User Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><AccountDetails /></ProtectedRoute>} />
          <Route path="/account/card" element={<ProtectedRoute><VirtualCard /></ProtectedRoute>} />
          <Route path="/transfer/send" element={<ProtectedRoute><SendMoney /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
          <Route path="/kyc" element={<ProtectedRoute><KYCStatus /></ProtectedRoute>} />
          <Route path="/kyc/upload" element={<ProtectedRoute><KYCUpload /></ProtectedRoute>} />
          <Route path="/savings" element={<ProtectedRoute><SavingsGoals /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserList />} />
            <Route path="kyc" element={<KYCQueue />} />
            <Route path="transactions" element={<div className="p-8 text-gray-400 italic">Transaction Monitor (Placeholder)</div>} />
            <Route path="aml" element={<div className="p-8 text-gray-400 italic">AML Review Queue (Placeholder)</div>} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
