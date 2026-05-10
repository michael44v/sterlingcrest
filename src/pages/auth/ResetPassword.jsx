import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../components/ui/Logo';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (otp.length !== 6) {
      return toast.error('Please enter the 6-digit reset code');
    }

    setLoading(true);
    try {
      // Use otp as token
      const response = await axios.post('?action=reset_password', { token: otp, password });
      if (response.data.status === 'success') {
        toast.success('Password reset successfully');
        navigate('/login');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-chase-navy">
      {/* Left Side */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-chase-navy p-16 text-white relative overflow-hidden">
        <div className="absolute top-12 left-12 z-10">
          <Logo color="white" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 bg-chase-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-chase-blue/50">
            <Lock size={48} className="text-white" />
          </div>
          <h2 className="text-4xl font-black mb-4">Set New Password.</h2>
          <p className="text-white/60 text-lg">
            Ensure your new password is strong and contains a mix of characters for maximum security.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-chase-blue/20 via-transparent to-transparent opacity-50"></div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-12">
            <Logo />
          </div>

          <div>
            <Link to="/forgot-password" title="Back to forgot password" className="inline-flex items-center text-sm font-bold text-chase-blue hover:gap-2 transition-all mb-8 uppercase tracking-widest">
              <ArrowLeft size={16} className="mr-2" /> Back
            </Link>
            <h1 className="text-4xl font-black tracking-tight">Reset Password</h1>
            <p className="text-gray-500 mt-2">
              We've sent a 6-digit reset code to <span className="text-chase-navy font-bold">{email || 'your email'}</span>.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="6-Digit Reset Code"
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                required
                className="text-center text-2xl tracking-[0.3em] font-black py-3"
              />
              <Input
                label="New Secure Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button type="submit" loading={loading} className="w-full py-4 text-lg font-bold shadow-xl shadow-chase-blue/20">
              Update Password
            </Button>
          </form>

          <div className="pt-8 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
              <CheckCircle2 size={18} className="text-green-500" /> Minimum 8 characters
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
              <CheckCircle2 size={18} className="text-green-500" /> Mix of letters, numbers & symbols
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
