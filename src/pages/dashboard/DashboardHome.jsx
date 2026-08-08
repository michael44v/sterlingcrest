import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatUSD, formatUSD_S, getSymbol } from '../../utils/formatCurrency';
import {
  Eye,
  EyeOff,
  ChevronDown,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  User,
} from 'lucide-react';

/* ─── Skeleton loader ─────────────────────────────── */
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/20 rounded-xl ${className}`} />
);

/* ─── Main component ──────────────────────────────── */
const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('?action=get_dashboard');
        if (response.data.status === 'success') {
          setData(response.data.data);
          if (response.data.data.currency) {
            localStorage.setItem('user_currency', response.data.data.currency);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kycTier = data?.kyc_tier || 1;

  // Group transactions by date for display
  const groupByDate = (transactions) => {
    if (!transactions) return {};
    const groups = {};
    transactions.forEach((tx) => {
      const date = tx.created_at?.split('T')[0] || tx.created_at || 'Today';
      if (!groups[date]) groups[date] = [];
      groups[date].push(tx);
    });
    return groups;
  };

  const groupedTransactions = groupByDate(data?.recent_transactions);
  const dateKeys = Object.keys(groupedTransactions);

  // Simple icon/color mapping for transaction categories
  const getTxStyle = (narration = '') => {
    const n = narration.toLowerCase();
    if (n.includes('bakery') || n.includes('food') || n.includes('eat')) {
      return { bg: '#fef2f2', color: '#ef4444', icon: '🧁' };
    }
    if (n.includes('tv') || n.includes('sub') || n.includes('netflix')) {
      return { bg: '#fff7ed', color: '#f97316', icon: '📺' };
    }
    if (n.includes('transport') || n.includes('uber') || n.includes('taxi')) {
      return { bg: '#eff6ff', color: '#3b82f6', icon: '🚗' };
    }
    if (n.includes('shop') || n.includes('store') || n.includes('mart')) {
      return { bg: '#f0fdf4', color: '#22c55e', icon: '🛒' };
    }
    return { bg: '#f3f4f6', color: '#6b7280', icon: '💳' };
  };

  return (
    <div className="min-h-full bg-white">
      {/* ── Top green gradient area ── */}
      <div
        className="relative px-6 pt-6 pb-8"
        style={{
          background: 'linear-gradient(180deg, #f97316 0%, #fe820e 40%, #ea580c 100%)',
        }}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white"
          >
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white">
            <User size={18} />
          </button>
        </div>

        {/* Account selector */}
        <div className="flex justify-center mb-4">
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 text-white text-sm font-medium hover:bg-white/25 transition-colors">
            Personal
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Balance */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {loading ? (
            <Skeleton className="w-40 h-10" />
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white tracking-tight">
                {showBalance ? formatUSD(data?.balance ?? 0, data?.currency) : `${getSymbol(data?.currency || 'USD')}••••••`}
              </h1>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-white/20 text-white text-lg font-light hover:bg-white/30 transition-colors">
                +
              </button>
            </>
          )}
        </div>

        {/* Bottom stats row */}
        <div className="flex items-center justify-center">
          <div className="flex items-stretch rounded-2xl bg-black/20 backdrop-blur-sm overflow-hidden">
            {loading ? (
              <div className="px-8 py-3">
                <Skeleton className="w-32 h-8" />
              </div>
            ) : (
              <>
                <div className="px-6 py-3 text-center">
                  <p className="text-[11px] text-white/60 mb-0.5">In Spending Spaces</p>
                  <p className="text-base font-bold text-white">
                    {formatUSD_S(data?.total_debit_sum ?? 0, data?.currency)}
                  </p>
                </div>
                <div className="w-px bg-white/15" />
                <div className="px-6 py-3 text-center">
                  <p className="text-[11px] text-white/60 mb-0.5">Total balance</p>
                  <p className="text-base font-bold text-white">
                    {formatUSD_S(data?.balance ?? 0, data?.currency)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── White transactions card ── */}
      <div
        className="relative -mt-5 bg-white rounded-t-3xl px-5 pt-6 pb-10"
        style={{ minHeight: 'calc(100vh - 280px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Transactions</h2>
          <button className="flex items-center gap-1.5 text-sm font-medium text-blue-500 hover:text-blue-600 transition-colors">
            <Search size={15} />
            Search & filter
          </button>
        </div>

        {/* Transactions list */}
        {loading ? (
          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="w-1/3 h-2.5 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="w-14 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : data?.recent_transactions?.length > 0 ? (
          <div className="space-y-6">
            {dateKeys.map((dateKey) => {
              const dayTxs = groupedTransactions[dateKey];
              const dayTotal = dayTxs.reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);
              const label = dateKey === new Date().toISOString().split('T')[0] ? 'Today' : 'Yesterday';

              return (
                <div key={dateKey}>
                  {/* Date header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400 font-medium">{label}</span>
                    <span className="text-sm text-gray-400 font-medium">
                      {formatUSD_S(dayTotal, data?.currency)}
                    </span>
                  </div>

                  {/* Transactions for this date */}
                  <div className="space-y-0">
                    {dayTxs.map((tx, idx) => {
                      const isCredit = tx.type === 'credit';
                      const style = getTxStyle(tx.narration);

                      return (
                        <div
                          key={tx.id}
                          className="flex items-center gap-4 py-3.5 cursor-pointer active:bg-gray-50 transition-colors"
                          style={{
                            borderBottom:
                              idx < dayTxs.length - 1 ? '1px solid #f3f4f6' : 'none',
                          }}
                          onClick={() => navigate('/history')}
                        >
                          {/* Icon */}
                          <div
                            className="w-11 h-11 flex items-center justify-center rounded-xl flex-shrink-0 text-lg"
                            style={{ background: style.bg }}
                          >
                            {style.icon}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[15px] font-semibold text-gray-900 truncate">
                              {tx.narration}
                            </p>
                            <p className="text-[12px] text-gray-400 mt-0.5">
                              {tx.created_at?.split('T')[1]?.slice(0, 5) || '17:34'} {tx.channel?.replace('_', ' ') || 'Eat out'}
                            </p>
                          </div>

                          {/* Amount */}
                          <div className="text-right flex-shrink-0">
                            <p className="text-[15px] font-bold text-gray-900">
                              {formatUSD(tx.amount, data?.currency)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gray-100">
              <ArrowUpRight size={22} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No transactions yet</p>
            <button
              onClick={() => navigate('/deposit')}
              className="mt-3 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              Make your first deposit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;