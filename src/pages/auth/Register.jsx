import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Logo from '../../components/ui/Logo';
import toast from 'react-hot-toast';
import { UserCheck, ShieldCheck, CreditCard, ArrowRight, Check } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      return toast.error('Passwords do not match');
    }

    setLoading(true);
    try {
      const res = await axios.get('', {
        params: {
          action: 'register',
          ...formData
        }
      });

      if (res.data.status === 'success') {
        toast.success('Registration successful. Please verify your email.');
        navigate('/verify-email', { state: { user_id: res.data.data.user_id, email: formData.email } });
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-chase-navy">
      {/* Left Side: Onboarding Content */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-chase-navy p-16 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Logo color="white" className="mb-12" />
          <h2 className="text-5xl font-black leading-tight mb-8">
            Your Gateway to <br/>
            Global <span className="text-chase-blue">USD Prosperity</span>.
          </h2>

          <div className="space-y-6 mt-12">
            {[
              { icon: UserCheck, title: "Instant Verification", desc: "Get started in minutes with our AI-powered KYC process." },
              { icon: ShieldCheck, title: "Military-Grade Security", desc: "Your assets are protected by world-class encryption protocols." },
              { icon: CreditCard, title: "Virtual USD Card", desc: "Spend globally with your own virtual Mastercard/Visa." }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="p-3 bg-chase-blue rounded-xl">
                  <feature.icon size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{feature.title}</h4>
                  <p className="text-white/60 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10">
          <div className="flex gap-4 items-center">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-chase-navy bg-gray-300"></div>
              ))}
            </div>
            <p className="text-white/60 text-sm font-medium">
              Joined by <span className="text-white font-bold">10,000+</span> professionals worldwide.
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-chase-blue rounded-full blur-[120px] opacity-30"></div>
      </div>

      {/* Right Side: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-xl space-y-8 py-12">
          <div className="lg:hidden">
            <Logo className="mb-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Create your account</h1>
            <p className="text-gray-500 mt-2">Join NorthBridge and start your USD banking journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Full Name (As per Govt ID)"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              required
            />
            <Input
              label="Login Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            <Input
              label="Confirm Password"
              name="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />

            <div className="md:col-span-2 flex items-start gap-3 py-2">
              <input type="checkbox" id="terms" required className="mt-1 w-5 h-5 rounded border-gray-300 text-chase-blue focus:ring-chase-blue" />
              <label htmlFor="terms" className="text-sm text-gray-600 leading-snug">
                I agree to the <Link to="/terms" className="text-chase-blue font-bold">Terms of Service</Link> and <Link to="/privacy" className="text-chase-blue font-bold">Privacy Policy</Link>, and consent to NorthBridge verifying my identity.
              </label>
            </div>

            <div className="md:col-span-2 pt-2">
              <Button type="submit" loading={loading} className="w-full py-4 text-lg font-bold shadow-xl shadow-chase-blue/20">
                Begin Onboarding <ArrowRight className="ml-2" size={20} />
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-gray-500 font-medium">
              Already have an account? <Link to="/login" className="text-chase-blue font-extrabold hover:underline">Sign in here</Link>
            </p>
          </div>

          {/* Trust badges footer */}
          <div className="pt-8 border-t border-gray-200 flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-2 font-bold text-xs tracking-tighter italic">PCI-DSS COMPLIANT</div>
            <div className="flex items-center gap-2 font-bold text-xs tracking-tighter italic">ISO 27001</div>
            <div className="flex items-center gap-2 font-bold text-xs tracking-tighter italic">GDPR READY</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
