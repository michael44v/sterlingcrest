import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import { Search, UserCircle, MoreVertical } from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('?action=admin_get_users');
        if (response.data.status === 'success') {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div>Loading User List...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-chase-navy">Manage Users</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or account..."
            className="pl-10 pr-4 py-2 bg-white border border-chase-border rounded-lg outline-none focus:border-chase-blue w-80"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-chase-border">
            <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Account Number</th>
              <th className="px-6 py-4">KYC Tier</th>
              <th className="px-6 py-4">Balance</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-chase-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserCircle className="text-gray-400" size={32} />
                    <div>
                      <p className="font-bold text-chase-navy">{u.full_name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-sm">{u.account_number}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-chase-light text-chase-blue">
                    Tier {u.kyc_tier}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-chase-navy">{formatUSD(u.balance)}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                    u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
