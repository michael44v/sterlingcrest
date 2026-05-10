import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatUSD } from '../../utils/formatCurrency';
import {
  Eye,
  EyeOff,
  Copy,
  SendHorizontal,
  Download,
  PiggyBank,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import Button from '../../components/ui/Button';

const DashboardHome = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('?action=get_dashboard');
        if (response.data.status === 'success') {
          setData(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // In a real app, show a toast
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Balance Card */}
      <div className="bg-chase-navy text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/60 text-sm font-medium">Available Balance</p>
              <div className="flex items-center gap-4 mt-1">
                <h2 className="text-4xl font-bold">
                  {showBalance ? formatUSD(data?.balance || 0) : '••••••••'}
                </h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              Tier {data?.kyc_tier || 1}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 w-fit px-4 py-2 rounded-xl border border-white/10">
            <span className="text-white/60 text-sm font-mono">{data?.account_number || '0000000000'}</span>
            <button
              onClick={() => copyToClipboard(data?.account_number)}
              className="hover:text-chase-blue transition-colors"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>

        {/* Abstract background circles */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-chase-blue opacity-20 rounded-full"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white opacity-5 rounded-full"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: 'Send', icon: SendHorizontal, path: '/transfer/send' },
          { name: 'Fund', icon: Download, path: '/deposit' },
          { name: 'Savings', icon: PiggyBank, path: '/savings' },
          { name: 'Card', icon: CreditCard, path: '/account' },
        ].map((action) => (
          <button
            key={action.name}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-white rounded-2xl border border-chase-border hover:shadow-md hover:border-chase-blue transition-all group"
          >
            <div className="p-3 bg-chase-light text-chase-blue rounded-xl group-hover:bg-chase-blue group-hover:text-white transition-colors">
              <action.icon size={24} />
            </div>
            <span className="font-semibold text-chase-navy">{action.name}</span>
          </button>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl border border-chase-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-chase-border flex justify-between items-center">
          <h3 className="text-lg font-bold text-chase-navy">Recent Transactions</h3>
          <button className="text-chase-blue text-sm font-semibold hover:underline">View All</button>
        </div>
        <div className="divide-y divide-chase-border">
          {data?.recent_transactions?.length > 0 ? (
            data.recent_transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-chase-navy">{tx.narration}</p>
                    <p className="text-xs text-gray-500 uppercase tracking-tighter">{tx.channel.replace('_', ' ')} • {tx.created_at}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatUSD(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-400">Balance: {formatUSD(tx.balance_after)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-400 italic">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
