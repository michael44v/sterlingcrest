import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../components/ui/Logo';
import USDRatesWidget from '../../components/ui/USDRatesWidget';
import toast from 'react-hot-toast';
import { ShieldCheck, Globe, Zap, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Login successful');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
      if (result.user_id) {
        navigate('/verify-email', { state: { user_id: result.user_id, email } });
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-[#0A2D5A]">
      {/* Left Side: Professional Branding / Hero */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-[#0A2D5A] p-16 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Logo color="white" className="mb-12" />
          <h2 className="text-5xl font-black leading-tight mb-6">
            Institutional Grade <br/>
            <span className="text-[#117ACA]">USD Banking</span> <br/>
            for the Digital Age.
          </h2>
          <p className="text-white/60 text-lg max-w-md">
            Secure, fast, and transparent financial services powered by NorthBridge infrastructure.
          </p>
        </div>

        {/* Heavy Widget: Trust Badges / Stats */}
        <div className="relative z-10 grid grid-cols-2 gap-8">
          <USDRatesWidget />
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="text-[#117ACA]" size={20} />
                <p className="text-sm font-bold uppercase tracking-widest text-white/40">Security</p>
              </div>
              <p className="text-xl font-bold">AES-256 Encrypted</p>
              <p className="text-sm text-white/50 mt-1">Institutional security protocols</p>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0A2D5A] bg-gray-400"></div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-[#0A2D5A] bg-[#117ACA] flex items-center justify-center text-[10px] font-bold">+10k</div>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#117ACA] rounded-full blur-[100px]"></div>
          <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-white rounded-full blur-[100px]"></div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden">
            <Logo className="mb-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Welcome back</h1>
            <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="py-1"
            />
            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="py-1"
              />
              <div className="flex justify-end">
                <Link to="/forgot-password" title="Forgot password?" className="text-xs font-bold text-[#117ACA] hover:underline uppercase tracking-wider">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input type="checkbox" id="remember" className="w-5 h-5 rounded border-gray-300 text-[#117ACA] focus:ring-[#117ACA]" />
              <label htmlFor="remember" className="text-sm font-medium text-gray-600">Keep me logged in for 30 days</label>
            </div>

            <Button type="submit" loading={loading} className="w-full py-4 text-lg font-bold shadow-xl shadow-[#117ACA]/20">
              Sign In <ArrowRight className="ml-2" size={20} />
            </Button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-50 px-4 text-gray-400 font-bold tracking-widest">New to NorthBridge?</span></div>
          </div>

          <Link to="/register" title="Create Account">
            <button className="w-full py-4 border-2 border-[#C8DCF0] text-[#0A2D5A] font-black rounded-xl hover:bg-white hover:border-[#117ACA] transition-all">
              CREATE YOUR USD ACCOUNT
            </button>
          </Link>

          <div className="pt-8 flex justify-center gap-6 text-gray-400">
            <Zap size={20} />
            <ShieldCheck size={20} />
            <Globe size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
