import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ShieldCheck, Clock, XCircle, ArrowUpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const KYCStatus = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const response = await api.get('?action=get_kyc_status');
        if (response.data.status === 'success') {
          setStatus(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch KYC status', error);
      } finally {
        setLoading(false);
      }
    };
    fetchKYC();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-chase-navy">KYC Status</h1>
        <p className="text-gray-500">Identity verification and account tiers</p>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border shadow-sm overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-center gap-8 bg-chase-light/30">
          <div className={`p-6 rounded-full ${
            status?.kyc_tier >= 3 ? 'bg-green-100 text-green-600' : 'bg-chase-light text-chase-blue'
          }`}>
            {status?.kyc_tier >= 3 ? <ShieldCheck size={64} /> : <Clock size={64} />}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-chase-navy">Tier {status?.kyc_tier || 0} Account</h2>
            <p className="text-gray-600 mt-1">
              {status?.kyc_tier >= 3
                ? 'Your account is fully verified with maximum limits.'
                : 'Upgrade your account to unlock higher transaction limits.'}
            </p>
          </div>
          {status?.kyc_tier < 3 && (
            <Button onClick={() => navigate('/kyc/upload')}>
              Upgrade Now
            </Button>
          )}
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { tier: 1, label: 'Basic', limit: '$1000/day', status: 'Active' },
            { tier: 2, label: 'Verified', limit: '$250,000/day', status: status?.kyc_tier >= 2 ? 'Active' : 'Locked' },
            { tier: 3, label: 'Premium', limit: '$1,000,000/day', status: status?.kyc_tier >= 3 ? 'Active' : 'Locked' },
          ].map((t) => (
            <div key={t.tier} className={`p-6 rounded-xl border ${
              status?.kyc_tier >= t.tier ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
            }`}>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Tier {t.tier}</p>
              <h3 className="text-lg font-bold text-chase-navy">{t.label}</h3>
              <p className="text-2xl font-black text-chase-blue mt-2">{t.limit}</p>
              <div className="mt-4 flex items-center gap-2">
                {status?.kyc_tier >= t.tier ? (
                  <ShieldCheck size={16} className="text-green-600" />
                ) : (
                  <Clock size={16} className="text-gray-400" />
                )}
                <span className={`text-sm font-semibold ${
                  status?.kyc_tier >= t.tier ? 'text-green-700' : 'text-gray-400'
                }`}>
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KYCStatus;
