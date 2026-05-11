import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user_id, email } = location.state || {};

  useEffect(() => {
    if (!user_id) {
      navigate('/login');
    }
  }, [user_id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter the 6-digit code');

    setLoading(true);
    try {
      const response = await axios.post('?action=verify_email', { user_id, otp });
      if (response.data.status === 'success') {
        toast.success('Email verified successfully!');
        navigate('/login');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    toast.success('A new verification code has been sent to your email.');
    // In a real app, call resend API action here
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-chase-navy">
      {/* Left Side: Illustration/Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-chase-navy p-16 text-white relative overflow-hidden">
        <div className="absolute top-12 left-12 z-10">
          <Logo color="white" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 bg-chase-blue rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-chase-blue/50">
            <Mail size={48} className="text-white" />
          </div>
          <h2 className="text-4xl font-black mb-4">Check your inbox.</h2>
          <p className="text-white/60 text-lg">
            We've sent a 6-digit verification code to <span className="text-white font-bold">{email}</span>.
          </p>
        </div>

        {/* Decorative background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 pointer-events-none">
          <div className="w-full h-full border-[100px] border-white rounded-full opacity-5 scale-150"></div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-12">
            <Logo />
          </div>

          <div>
            <Link to="/register" className="inline-flex items-center text-sm font-bold text-chase-blue hover:gap-2 transition-all mb-8 uppercase tracking-widest">
              <ArrowLeft size={16} className="mr-2" /> Back to registration
            </Link>
            <h1 className="text-4xl font-black tracking-tight">Security Verification</h1>
            <p className="text-gray-500 mt-2">Enter the authorization code sent to your email to activate your USD account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-1 sm:gap-2">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength="1"
                  value={otp[i] || ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val) {
                      const newOtp = otp.split('');
                      newOtp[i] = val;
                      const nextOtp = newOtp.join('');
                      setOtp(nextOtp);
                      if (i < 5) document.getElementById(`otp-${i + 1}`).focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !otp[i] && i > 0) {
                      document.getElementById(`otp-${i - 1}`).focus();
                    }
                  }}
                  className="w-12 h-16 sm:w-14 sm:h-20 text-center text-3xl font-black border-2 border-gray-200 rounded-xl focus:border-chase-blue focus:ring-4 focus:ring-chase-blue/10 outline-none transition-all bg-white"
                />
              ))}
            </div>

            <Button type="submit" loading={loading} className="w-full py-4 text-lg font-bold shadow-xl shadow-chase-blue/20">
              Verify Account
            </Button>

            <div className="text-center pt-4">
              <p className="text-gray-500 mb-4 font-medium">Didn't receive the code?</p>
              <button
                type="button"
                onClick={resendOtp}
                className="inline-flex items-center gap-2 px-6 py-2 border-2 border-chase-border rounded-full text-chase-navy font-bold hover:bg-white hover:border-chase-blue transition-all"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Resend Code
              </button>
            </div>
          </form>

          <div className="pt-12 text-center">
            <p className="text-xs text-gray-400 font-medium">
              If you can't find the email in your inbox, please check your <span className="font-bold">Spam</span> folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
