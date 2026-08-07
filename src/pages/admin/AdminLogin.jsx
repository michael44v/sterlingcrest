import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ShieldAlert, ArrowRight, Lock, Mail } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    // Standard login to authenticate
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // Fetch user role from localStorage to see if it is an admin
      const storedUser = localStorage.getItem('user');
      const userObj = storedUser ? JSON.parse(storedUser) : null;
      if (userObj && (userObj.role === 'admin' || userObj.role === 'super_admin')) {
        toast.success('Admin authentication successful');
        // Reload or update router state to allow layout mounting
        window.location.reload();
      } else {
        // Log out standard user since they used the admin portal
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        toast.error('Access Denied: You do not have administrator privileges');
      }
    } else {
      toast.error(result.message || 'Invalid administrator credentials');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100 font-sans">
      {/* Abstract Background Accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">Starling Crest</h1>
          <p className="text-xs font-bold tracking-widest text-emerald-500 uppercase mt-1">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email field */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">
              Security Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                required
                placeholder="admin@starlingcrestfinance.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold tracking-wider text-slate-400 uppercase mb-2">
              System Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-slate-600 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Authenticate Securely
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
          <p className="text-xs text-slate-500">
            Authorized administrative personnel only. All access attempts are logged and monitored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
