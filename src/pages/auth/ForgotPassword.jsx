import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('?action=forgot_password', { email });
      if (response.data.status === 'success') {
        toast.success('Password reset link sent to your email');
        navigate('/login');
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
    <div className="min-h-screen flex items-center justify-center bg-chase-light p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-chase-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-chase-navy">Forgot Password</h1>
          <p className="text-gray-500 mt-2">Enter your email to receive a reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
          <Button type="submit" loading={loading} className="w-full py-3">
            Send Reset Link
          </Button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" title="Login" className="text-chase-blue font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
