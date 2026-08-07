import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import {
  Search,
  UserCircle,
  MoreVertical,
  Send,
  DollarSign,
  Ban,
  CheckCircle,
  ArrowUpCircle,
  UserPlus,
  Database,
  KeyRound,
  Lock,
  Calendar
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [activeUser, setActiveUser] = useState(null);
  const [modalType, setModalType] = useState(null); // 'balance', 'message', 'status', 'tier', 'create_user', 'seed', 'reset_credentials'
  const [formData, setFormData] = useState({
    amount: '',
    type: 'credit',
    narration: '',
    title: '',
    message: '',
    status: 'active',
    tier: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    pin: '',
    initial_balance: '0',
    kyc_tier: '1',
    base_date: ''
  });
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_create_user', {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        pin: formData.pin,
        kyc_tier: formData.kyc_tier,
        status: formData.status,
        initial_balance: formData.initial_balance
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to create user account');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSeedTransactions = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_seed_transactions', {
        user_id: activeUser.id,
        base_date: formData.base_date
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to seed transaction history');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCredentials = async (e) => {
    e.preventDefault();
    if (!formData.password && !formData.pin) {
      toast.error('Please enter a new password or PIN');
      return;
    }
    setSubmitting(true);
    try {
      let success = true;
      if (formData.password) {
        const resPass = await api.post('?action=admin_reset_password', {
          user_id: activeUser.id,
          password: formData.password
        });
        if (resPass.data.status !== 'success') {
          toast.error(resPass.data.message);
          success = false;
        }
      }
      if (formData.pin) {
        const resPin = await api.post('?action=admin_reset_pin', {
          user_id: activeUser.id,
          pin: formData.pin
        });
        if (resPin.data.status !== 'success') {
          toast.error(resPin.data.message);
          success = false;
        }
      }
      if (success) {
        toast.success('Credentials updated successfully!');
        setModalType(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error('Failed to reset credentials');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.account_number?.includes(search)
  );

  if (loading && !users.length) return <div>Loading User List...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-chase-navy">Manage Users</h1>
          <p className="text-gray-500 text-sm">Create, suspend, fund, and seed accounts.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <Button
            onClick={() => {
              setFormData({
                full_name: '',
                email: '',
                phone: '',
                password: '',
                pin: '',
                kyc_tier: '1',
                status: 'active',
                initial_balance: '0'
              });
              setModalType('create_user');
            }}
            className="flex items-center gap-2 w-full sm:w-auto px-4 py-2.5 bg-chase-blue text-white rounded-lg font-bold"
          >
            <UserPlus size={18} /> Create User Account
          </Button>
          <div className="relative w-full sm:w-80">
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
                      u.status === 'active' ? 'bg-green-100 text-green-700' :
                      u.status === 'suspended' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => { setActiveUser(u); setModalType('balance'); setFormData({ ...formData, amount: '', narration: '', type: 'credit' }) }}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Add / Adjust Money"
                      >
                        <DollarSign size={18} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('seed'); setFormData({ ...formData, base_date: new Date().toISOString().split('T')[0] }) }}
                        className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors" title="Seed Realistic Transaction History"
                      >
                        <Database size={18} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('reset_credentials'); setFormData({ ...formData, password: '', pin: '' }) }}
                        className="p-2 hover:bg-pink-50 text-pink-600 rounded-lg transition-colors" title="Reset Password / PIN"
                      >
                        <KeyRound size={18} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('status'); }}
                        className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors" title="Set Status"
                      >
                        <Lock size={18} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('message'); setFormData({ ...formData, title: '', message: '' }) }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Send Message"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Account Modal */}
      {modalType === 'create_user' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-chase-navy mb-4">Create User Account</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="e.g. John Doe"
                required
                value={formData.full_name}
                onChange={e => setFormData({ ...formData, full_name: e.target.value })}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. john@example.com"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g. +44 7911 123456"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password (will be stored plaintext)"
                  placeholder="Password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
                <Input
                  label="Transaction PIN"
                  placeholder="4-digit PIN"
                  required
                  maxLength={4}
                  value={formData.pin}
                  onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">KYC Tier</label>
                  <select
                    className="w-full p-2.5 border border-chase-border rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                    value={formData.kyc_tier}
                    onChange={e => setFormData({ ...formData, kyc_tier: e.target.value })}
                  >
                    <option value="0">Tier 0 (Unverified)</option>
                    <option value="1">Tier 1 (Basic)</option>
                    <option value="2">Tier 2 (Verified)</option>
                    <option value="3">Tier 3 (Premium)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">Initial Status</label>
                  <select
                    className="w-full p-2.5 border border-chase-border rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="frozen">Frozen</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <Input
                  label="Initial Balance (GBP)"
                  type="number"
                  placeholder="0.00"
                  value={formData.initial_balance}
                  onChange={e => setFormData({ ...formData, initial_balance: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
                <Button type="submit" className="flex-1" loading={submitting}>Create Account</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Adjust Balance Modal */}
      {modalType === 'balance' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-chase-navy mb-4">Add / Adjust Money: {activeUser?.full_name}</h2>
            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'credit' })}
                  className={`py-2 rounded-lg font-bold border-2 transition-all ${formData.type === 'credit' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-100 text-gray-400'}`}
                >
                  ADD MONEY
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
                label="Amount (GBP)"
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
                <Button type="submit" className="flex-1 font-bold" loading={submitting}>Apply</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seed Transaction History Modal */}
      {modalType === 'seed' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-chase-navy mb-2">Seed Transaction History</h2>
            <p className="text-sm text-gray-500 mb-4">
              This will automatically populate <strong>{activeUser?.full_name}</strong>'s statement with a realistic multi-day transactional sequence, spreading back from the selected base date.
            </p>
            <form onSubmit={handleSeedTransactions} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-chase-navy">Base / Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full p-3 border border-chase-border rounded-lg focus:border-chase-blue outline-none transition-colors text-sm"
                    required
                    value={formData.base_date}
                    onChange={e => setFormData({ ...formData, base_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-xs text-purple-800 space-y-1">
                <p className="font-bold">Generated sequence includes:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Initial Wire Credit (+£1,500.00)</li>
                  <li>Kat's Bakery Debit (-£48.62)</li>
                  <li>Bundle TV Subscription Debit (-£9.99)</li>
                  <li>Monthly Salary Credit (+£2,500.00)</li>
                  <li>Amazon UK Debit (-£124.50)</li>
                  <li>Starling Transfer Debit (-£114.47)</li>
                  <li>Refund Amazon Credit (+£82.20)</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
                <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold" loading={submitting}>
                  Seed History
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Credentials Modal */}
      {modalType === 'reset_credentials' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-chase-navy mb-2">Reset Credentials</h2>
            <p className="text-sm text-gray-500 mb-4">
              Update password or transaction PIN for <strong>{activeUser?.full_name}</strong>. Leave blank if unchanged.
            </p>
            <form onSubmit={handleResetCredentials} className="space-y-4">
              <Input
                label="New Password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
              <Input
                label="New Transaction PIN"
                placeholder="Enter 4-digit PIN"
                maxLength={4}
                value={formData.pin}
                onChange={e => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              />
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
                <Button type="submit" className="flex-1 font-bold" loading={submitting}>Update</Button>
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
                <Button type="submit" className="flex-1 animate-none font-bold" loading={submitting}>Send Notification</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {modalType === 'status' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-amber-100 text-amber-600`}>
              <Lock size={32} />
            </div>
            <h2 className="text-xl font-bold text-chase-navy mb-2">Update Account Status</h2>
            <p className="text-gray-500 mb-6">
              Update the status of <strong>{activeUser?.full_name}</strong>'s bank account.
            </p>
            <div className="space-y-2 mb-6">
              {['active', 'suspended', 'frozen', 'closed'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleUpdateStatus(st)}
                  className={`w-full py-3 rounded-xl border font-bold capitalize transition-all ${
                    activeUser?.status === st
                      ? 'bg-chase-blue border-chase-blue text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={submitting}
                >
                  {st}
                </button>
              ))}
            </div>
            <Button variant="secondary" className="w-full" onClick={() => setModalType(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
