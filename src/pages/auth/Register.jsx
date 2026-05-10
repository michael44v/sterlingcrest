import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

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
      const response = await api.post('?action=register', formData);
      if (response.data.status === 'success') {
        toast.success(response.data.message);
        navigate('/verify-email', { state: { user_id: response.data.data.user_id, email: formData.email } });
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-chase-light p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-chase-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-chase-navy">NorthBridge Bank</h1>
          <p className="text-gray-500 mt-2">Create your USD banking account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@example.com"
            required
          />
          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
            required
          />
          <Input
            label="Password"
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

          <label className="flex items-start gap-2 text-sm text-gray-600 mt-4">
            <input type="checkbox" required className="mt-1 rounded text-chase-blue focus:ring-chase-blue" />
            <span>I agree to the <Link to="/terms" title="Terms" className="text-chase-blue underline">Terms of Service</Link> and <Link to="/privacy" title="Privacy" className="text-chase-blue underline">Privacy Policy</Link></span>
          </label>

          <Button type="submit" loading={loading} className="w-full py-3 mt-4">
            Create Account
          </Button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Already have an account?{' '}
          <Link to="/login" title="Login" className="text-chase-blue font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
