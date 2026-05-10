import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

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
    setLoading(true);
    try {
      const response = await api.post('?action=verify_email', { user_id, otp });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-chase-light p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-chase-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-chase-navy">Verify Email</h1>
          <p className="text-gray-500 mt-2">Enter the 6-digit code sent to<br/><span className="font-semibold text-gray-700">{email}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full max-w-[200px] text-center text-3xl tracking-[0.5em] font-bold py-3 border-2 border-gray-300 rounded-xl focus:border-chase-blue outline-none transition-all"
              placeholder="000000"
              required
            />
          </div>

          <Button type="submit" loading={loading} className="w-full py-3">
            Verify & Continue
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-chase-blue font-medium hover:underline"
              onClick={() => toast.success('New code sent!')}
            >
              Resend verification code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
