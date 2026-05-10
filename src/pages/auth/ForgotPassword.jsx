import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../components/ui/Logo';
import toast from 'react-hot-toast';
import { KeyRound, ArrowLeft, Send } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('?action=forgot_password', { email });
      if (response.data.status === 'success') {
        toast.success('Security code sent to your email');
        // Navigate to reset password with email
        navigate('/reset-password', { state: { email } });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-chase-navy">
      {/* Left Side: Illustration */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 bg-chase-navy p-16 text-white relative overflow-hidden">
        <div className="absolute top-12 left-12 z-10">
          <Logo color="white" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 bg-white/10 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-12 backdrop-blur-xl border border-white/20">
            <KeyRound size={48} className="text-chase-blue -rotate-12" />
          </div>
          <h2 className="text-4xl font-black mb-4">Password Recovery</h2>
          <p className="text-white/60 text-lg">
            Don't worry, it happens. We'll help you regain access to your USD account securely.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 border border-white rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 border border-white rounded-full opacity-50"></div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-12">
            <Logo />
          </div>

          <div>
            <Link to="/login" className="inline-flex items-center text-sm font-bold text-chase-blue hover:gap-2 transition-all mb-8 uppercase tracking-widest">
              <ArrowLeft size={16} className="mr-2" /> Back to login
            </Link>
            <h1 className="text-4xl font-black tracking-tight">Forgot Password?</h1>
            <p className="text-gray-500 mt-2">Enter your registered email address and we'll send you a 6-digit code to reset your password.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Recovery Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="py-1"
            />

            <Button type="submit" loading={loading} className="w-full py-4 text-lg font-bold shadow-xl shadow-chase-blue/20">
              Send Recovery Code <Send className="ml-2" size={18} />
            </Button>
          </form>

          <div className="pt-8 border-t border-gray-200">
            <div className="bg-chase-light/50 p-6 rounded-2xl border border-chase-border/50">
              <h4 className="text-sm font-black uppercase tracking-widest text-chase-navy mb-2">Need help?</h4>
              <p className="text-sm text-gray-500">
                If you no longer have access to this email, please contact our 24/7 priority support at <span className="text-chase-blue font-bold">support@northbridge.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
