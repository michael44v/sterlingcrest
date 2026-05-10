import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import { ShieldCheck, Calendar, Hash, Globe, CreditCard } from 'lucide-react';

const AccountDetails = () => {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await api.get('?action=get_account_details');
        if (response.data.status === 'success') {
          setAccount(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch account', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccount();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-chase-navy">Account Details</h1>
          <p className="text-gray-500">Manage your NorthBridge USD current account</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
          <ShieldCheck size={18} />
          <span className="text-sm font-semibold">Verified Account</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl border border-chase-border shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-chase-light text-chase-blue rounded-xl">
              <Hash size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Number</p>
              <p className="text-xl font-bold text-chase-navy">{account?.account_number}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-chase-light text-chase-blue rounded-xl">
              <Globe size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Routing Number</p>
              <p className="text-xl font-bold text-chase-navy">123456789</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-chase-light text-chase-blue rounded-xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Date Opened</p>
              <p className="text-xl font-bold text-chase-navy">{account?.created_at}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-chase-border shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-chase-light text-chase-blue rounded-xl">
              <CreditCard size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-3xl font-black text-chase-navy">{formatUSD(account?.balance)}</p>
            </div>
          </div>

          <div className="pt-6 border-t border-chase-border">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 text-sm">Ledger Balance</span>
              <span className="font-semibold text-chase-navy">{formatUSD(account?.ledger_balance)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Available Balance</span>
              <span className="font-black text-chase-blue">{formatUSD(account?.balance)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
