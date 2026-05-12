import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import { Search, UserCircle, MoreVertical, Send, DollarSign, Ban, CheckCircle, ArrowUpCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [activeUser, setActiveUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'balance', 'message', 'status', 'tier'
  const [formData, setFormData] = useState({ amount: '', type: 'credit', narration: '', title: '', message: '', status: '', tier: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('?action=admin_get_users');
      if (response.data.status === 'success') {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_adjust_balance', {
        user_id: activeUser.id,
        amount: formData.amount,
        type: formData.type,
        narration: formData.narration
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to adjust balance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_send_notification', {
        user_id: activeUser.id,
        title: formData.title,
        message: formData.message
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        setModalType(null);
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTier = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_upgrade_tier', {
        user_id: activeUser.id,
        tier: formData.tier
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update tier');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_update_user_status', {
        user_id: activeUser.id,
        status: status
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.account_number.includes(search)
  );

  if (loading && !users.length) return <div>Loading User List...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-chase-navy">Manage Users</h1>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or account..."
            className="pl-10 pr-4 py-2 bg-white border border-chase-border rounded-lg outline-none focus:border-chase-blue w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
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
              {filteredUsers.map((u) => (
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
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setActiveUser(u); setModalType('balance'); setFormData({ ...formData, amount: '', narration: '' }) }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Adjust Balance"
                      >
                        <DollarSign size={18} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('message'); setFormData({ ...formData, title: '', message: '' }) }}
                        className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors" title="Send Message"
                      >
                        <Send size={18} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('tier'); setFormData({ ...formData, tier: u.kyc_tier }) }}
                        className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors" title="Manage Tier"
                      >
                        <ArrowUpCircle size={18} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('status'); }}
                        className={`p-2 rounded-lg transition-colors ${u.status === 'active' ? 'hover:bg-red-50 text-red-600' : 'hover:bg-green-50 text-green-600'}`}
                        title={u.status === 'active' ? 'Suspend' : 'Activate'}
                      >
                        {u.status === 'active' ? <Ban size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balance Adjustment Modal */}
      {modalType === 'balance' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-chase-navy mb-4">Adjust Balance: {activeUser?.full_name}</h2>
            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'credit' })}
                  className={`py-2 rounded-lg font-bold border-2 transition-all ${formData.type === 'credit' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-100 text-gray-400'}`}
                >
                  ADD FUNDS
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'debit' })}
                  className={`py-2 rounded-lg font-bold border-2 transition-all ${formData.type === 'debit' ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-100 text-gray-400'}`}
                >
                  DEDUCT
                </button>
              </div>
              <Input
                label="Amount (USD)"
                type="number"
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
              <Input
                label="Narration"
                placeholder="e.g. Manual Adjustment"
                value={formData.narration}
                onChange={e => setFormData({ ...formData, narration: e.target.value })}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
                <Button type="submit" className="flex-1" loading={submitting}>Submit</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {modalType === 'message' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-chase-navy mb-4">Message: {activeUser?.full_name}</h2>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <Input
                label="Title"
                placeholder="Message subject"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-chase-navy">Message</label>
                <textarea
                  className="w-full p-3 border border-chase-border rounded-lg h-32 focus:border-chase-blue outline-none transition-colors"
                  placeholder="Enter your message..."
                  required
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
                <Button type="submit" className="flex-1" loading={submitting}>Send Notification</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tier Management Modal */}
      {modalType === 'tier' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <ArrowUpCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-chase-navy mb-2">Manage KYC Tier: {activeUser?.full_name}</h2>
            <p className="text-gray-500 mb-6">Manually adjust the user's KYC verification tier.</p>

            <form onSubmit={handleUpdateTier} className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({ ...formData, tier: t })}
                    className={`py-3 rounded-xl font-black border-2 transition-all ${
                      Number(formData.tier) === t
                      ? 'bg-chase-blue border-chase-blue text-white shadow-lg'
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    T{t}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
                <Button type="submit" className="flex-1" loading={submitting}>Update Tier</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {modalType === 'status' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${activeUser?.status === 'active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {activeUser?.status === 'active' ? <Ban size={32} /> : <CheckCircle size={32} />}
            </div>
            <h2 className="text-xl font-bold text-chase-navy mb-2">
              {activeUser?.status === 'active' ? 'Suspend Account?' : 'Activate Account?'}
            </h2>
            <p className="text-gray-500 mb-6">
              Are you sure you want to {activeUser?.status === 'active' ? 'suspend' : 'activate'} <strong>{activeUser?.full_name}</strong>'s account?
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
              <Button
                className={`flex-1 ${activeUser?.status === 'active' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                loading={submitting}
                onClick={() => handleUpdateStatus(activeUser?.status === 'active' ? 'suspended' : 'active')}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
