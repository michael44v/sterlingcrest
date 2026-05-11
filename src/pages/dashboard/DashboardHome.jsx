import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowDownLeft,
  ChevronRight,
  TrendingUp,
  Shield,
} from 'lucide-react';

/* ─── Skeleton loader ─────────────────────────────── */
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
);

/* ─── Quick action card ───────────────────────────── */
const ActionCard = ({ icon: Icon, label, sublabel, path, accent }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 shadow-sm"
    >
      <div
        className="w-10 h-10 flex items-center justify-center rounded-xl"
        style={{ background: accent + '18', border: `1px solid ${accent}33` }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
};

/* ─── Stat mini card ──────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, delta, accent }) => (
  <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="w-7 h-7 flex items-center justify-center rounded-lg" style={{ background: accent + '18' }}>
        <Icon size={14} style={{ color: accent }} />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
    {delta !== undefined && (
      <p className="text-[11px] font-medium flex items-center gap-1 text-emerald-600">
        <TrendingUp size={10} />
        {delta}
      </p>
    )}
  </div>
);

/* ─── Main component ──────────────────────────────── */
const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('?action=get_dashboard');
        if (response.data.status === 'success') {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const kycTier = data?.kyc_tier || 1;
  const tierColors = { 1: '#f59e0b', 2: '#3b82f6', 3: '#10b981' };
  const tierLabels = { 1: 'Basic', 2: 'Verified', 3: 'Premium' };
  const tierColor = tierColors[kycTier] ?? '#f59e0b';

  const quickActions = [
    { icon: SendHorizontal, label: 'Send',    sublabel: 'Transfer money',   path: '/transfer/send', accent: '#3b82f6' },
    { icon: Download,       label: 'Deposit', sublabel: 'Add funds',        path: '/deposit',       accent: '#10b981' },
    { icon: PiggyBank,      label: 'Savings', sublabel: 'Goals & deposits', path: '/savings',       accent: '#f59e0b' },
    { icon: CreditCard,     label: 'Card',    sublabel: 'Virtual card',     path: '/account/card',  accent: '#8b5cf6' },
  ];

  return (
    <div className="min-h-full bg-gray-50">
      <div className="px-4 sm:px-6 space-y-5 pb-10 max-w-2xl mx-auto pt-5">

        {/* ── Hero balance card — keeps its dark gradient as a visual anchor ── */}
        <div
          className="relative rounded-3xl overflow-hidden p-7"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #1d4ed8 100%)',
            boxShadow: '0 8px 32px rgba(30,64,175,0.25)',
          }}
        >
          {/* inner glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 10% 60%, rgba(255,255,255,0.08) 0%, transparent 50%),
                radial-gradient(circle at 90% 10%, rgba(255,255,255,0.06) 0%, transparent 45%)
              `,
            }}
          />

          <div className="relative flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-medium tracking-widest uppercase mb-1 text-white/60">
                Total Balance
              </p>
              {loading ? (
                <div className="animate-pulse bg-white/20 rounded-xl w-48 h-10 mt-1" />
              ) : (
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl font-black tracking-tight text-white">
                    {showBalance ? formatUSD(data?.balance ?? 0) : '$ ••••••'}
                  </h2>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition-colors text-white flex-shrink-0"
                  >
                    {showBalance ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              )}
            </div>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
              }}
            >
              <Shield size={11} />
              {tierLabels[kycTier]} · Tier {kycTier}
            </div>
          </div>

          {/* Account number */}
          {loading ? (
            <div className="animate-pulse bg-white/20 rounded-xl w-44 h-9" />
          ) : (
            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                <span className="text-sm font-mono tracking-wider text-white/70">
                  {data?.account_number ?? '—'}
                </span>
                <button
                  onClick={() => copyToClipboard(data?.account_number)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <Copy size={14} />
                </button>
              </div>
              {copied && (
                <span className="text-xs font-semibold text-emerald-300">Copied</span>
              )}
            </div>
          )}

          {/* decorative orbs */}
          <div className="absolute -bottom-14 -right-14 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)' }} />
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
        </div>

        {/* ── Stat mini-cards ── */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Received"
              value={formatUSD(data?.total_credit_sum ?? 0)}
              icon={ArrowDownLeft}
              delta="+12.4% vs last month"
              accent="#10b981"
            />
            <StatCard
              label="Spent"
              value={formatUSD(data?.total_debit_sum ?? 0)}
              icon={ArrowUpRight}
              accent="#ef4444"
            />
          </div>
        )}

        {/* ── Quick actions ── */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-1 text-gray-400">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((a) => (
              <ActionCard key={a.label} {...a} />
            ))}
          </div>
        </div>

        {/* ── Recent transactions ── */}
        <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Recent Transactions</h3>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              View all <ChevronRight size={13} />
            </button>
          </div>

          {loading ? (
            <div className="p-5 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="w-10 h-10 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-3/4 h-3" />
                    <Skeleton className="w-1/3 h-2.5" />
                  </div>
                  <Skeleton className="w-16 h-4" />
                </div>
              ))}
            </div>
          ) : data?.recent_transactions?.length > 0 ? (
            <div>
              {data.recent_transactions.map((tx, idx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    style={{
                      borderBottom:
                        idx < data.recent_transactions.length - 1
                          ? '1px solid #f3f4f6'
                          : 'none',
                    }}
                    onClick={() => navigate('/history')}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0"
                      style={{
                        background: isCredit ? '#d1fae5' : '#fee2e2',
                      }}
                    >
                      {isCredit
                        ? <ArrowDownLeft size={17} className="text-emerald-600" />
                        : <ArrowUpRight size={17} className="text-red-500" />
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{tx.narration}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 uppercase tracking-wide">
                        {tx.channel?.replace('_', ' ')} · {tx.created_at}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-sm font-bold"
                        style={{ color: isCredit ? '#059669' : '#ef4444' }}
                      >
                        {isCredit ? '+' : '-'}{formatUSD(tx.amount)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{formatUSD(tx.balance_after)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-gray-100">
                <SendHorizontal size={22} className="text-gray-300" />
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

        {/* ── KYC upgrade CTA ── */}
        {!loading && kycTier < 3 && (
          <div
            className="flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer hover:bg-amber-50 transition-colors border border-amber-100 bg-white shadow-sm"
            onClick={() => navigate('/kyc')}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-amber-50">
                <Shield size={17} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Upgrade your account</p>
                <p className="text-xs text-gray-400 mt-0.5">Complete KYC to unlock higher limits</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-amber-400 flex-shrink-0" />
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardHome;