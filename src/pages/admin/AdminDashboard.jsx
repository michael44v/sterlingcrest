import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Users, ShieldCheck, Activity, DollarSign } from 'lucide-react';
import { formatUSD } from '../../utils/formatCurrency';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('?action=admin_get_analytics');
        if (response.data.status === 'success') {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading Admin Stats...</div>;

  const statCards = [
    { name: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Active Accounts', value: stats?.active_accounts || 0, icon: ShieldCheck, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Total Volume (30d)', value: formatUSD(stats?.total_volume_30d || 0), icon: Activity, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Fees Collected (30d)', value: formatUSD(stats?.total_fees_30d || 0), icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-chase-navy">Admin Overview</h1>
        <p className="text-gray-500">Platform-wide analytics and control</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl border border-chase-border shadow-sm flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <p className="text-2xl font-bold text-chase-navy">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for charts as specified in the spec */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-chase-border shadow-sm h-64 flex items-center justify-center text-gray-400 italic">
          User Growth Chart (Recharts)
        </div>
        <div className="bg-white p-8 rounded-2xl border border-chase-border shadow-sm h-64 flex items-center justify-center text-gray-400 italic">
          Transaction Volume Chart (Recharts)
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
