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
  Calendar,
  Edit3,
  UploadCloud,
  Eye,
  Trash2
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
    base_date: '',
    state: '',
    zipcode: '',
    account_type: 'Savings Account',
    occupation: '',
    date_of_birth: '',
    sex: '',
    currency: 'USD'
  });

  const [editFormData, setEditFormData] = useState({
    user_id: '',
    full_name: '',
    email: '',
    phone: '',
    status: 'active',
    kyc_tier: '1',
    account_number: '',
    balance: '0',
    ledger_balance: '0',
    swift_code: '',
    routing_code: '',
    max_transfer_limit: '',
    profile_picture_url: '',
    state: '',
    zipcode: '',
    account_type: 'Savings Account',
    occupation: '',
    date_of_birth: '',
    sex: '',
    currency: 'USD'
  });

  const [seedTransactions, setSeedTransactions] = useState([]);

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

  const handleDeleteUser = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_delete_user', {
        user_id: activeUser.id
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to delete user account');
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
        initial_balance: formData.initial_balance,
        state: formData.state,
        zipcode: formData.zipcode,
        account_type: formData.account_type,
        occupation: formData.occupation,
        date_of_birth: formData.date_of_birth,
        sex: formData.sex,
        currency: formData.currency
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

  const handleProfilePictureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData(prev => ({ ...prev, profile_picture_url: reader.result }));
        toast.success("Profile picture loaded! Save details to persist.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenEditModal = (user) => {
    setActiveUser(user);
    setEditFormData({
      user_id: user.id,
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      status: user.status || 'active',
      kyc_tier: String(user.kyc_tier ?? '1'),
      account_number: user.account_number || '',
      balance: String(user.balance ?? '0'),
      ledger_balance: String(user.ledger_balance ?? '0'),
      swift_code: user.swift_code || '',
      routing_code: user.routing_code || '',
      max_transfer_limit: user.max_transfer_limit !== null ? String(user.max_transfer_limit) : '',
      profile_picture_url: user.profile_picture_url || '',
      state: user.state || '',
      zipcode: user.zipcode || '',
      account_type: user.account_type || 'Savings Account',
      occupation: user.occupation || '',
      date_of_birth: user.date_of_birth || '',
      sex: user.sex || '',
      currency: user.currency || 'USD'
    });
    setModalType('edit_user_details');
  };

  const handleUpdateUserDetails = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_update_user_details', editFormData);
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        setModalType(null);
        fetchUsers();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update user details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenSeedModal = (u) => {
    setActiveUser(u);
    setFormData({ ...formData, base_date: new Date().toISOString().split('T')[0] });
    setSeedTransactions([
      { type: 'credit', channel: 'deposit', amount: 1500.00, narration: 'Initial Wire Transfer Credit', days_offset: -6 },
      { type: 'debit', channel: 'internal_transfer', amount: 48.62, narration: "Kat's Bakery", days_offset: -5 },
      { type: 'debit', channel: 'fee', amount: 9.99, narration: 'Bundle TV Subscription', days_offset: -4 },
      { type: 'credit', channel: 'deposit', amount: 2500.00, narration: 'Monthly Salary Credit', days_offset: -3 },
      { type: 'debit', channel: 'internal_transfer', amount: 124.50, narration: 'Amazon UK Marketplace', days_offset: -2 },
      { type: 'debit', channel: 'internal_transfer', amount: 114.47, narration: 'Starling Transfer to Vault', days_offset: -1 },
      { type: 'credit', channel: 'deposit', amount: 82.20, narration: 'Refund Amazon UK', days_offset: 0 }
    ]);
    setModalType('seed');
  };

  const handleSeedTransactions = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_seed_transactions', {
        user_id: activeUser.id,
        base_date: formData.base_date,
        transactions: seedTransactions
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
                initial_balance: '0',
                state: '',
                zipcode: '',
                account_type: 'Savings Account',
                occupation: '',
                date_of_birth: '',
                sex: '',
                currency: 'USD'
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
                <th className="px-4 md:px-6 py-4">User</th>
                <th className="px-6 py-4 hidden sm:table-cell">Account Number</th>
                <th className="px-6 py-4 hidden md:table-cell">KYC Tier</th>
                <th className="px-4 md:px-6 py-4">Balance</th>
                <th className="px-6 py-4 hidden sm:table-cell">Status</th>
                <th className="px-4 md:px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chase-border">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      {u.profile_picture_url ? (
                        <img
                          src={u.profile_picture_url}
                          alt={u.full_name}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-gray-200"
                        />
                      ) : (
                        <UserCircle className="text-gray-400 shrink-0" size={32} />
                      )}
                      <div>
                        <p className="font-bold text-chase-navy text-sm md:text-base leading-tight">{u.full_name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-none">{u.email}</p>

                        {/* Mobile supplementary details inline */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 sm:hidden">
                          <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                            {u.account_number}
                          </span>
                          <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                            T{u.kyc_tier}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            u.status === 'active' ? 'bg-green-50 text-green-700' :
                            u.status === 'suspended' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {u.status}
                          </span>
                        </div>
                        {/* Tablet-only KYC Tier */}
                        <div className="hidden sm:block md:hidden mt-1">
                          <span className="text-[10px] font-bold bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">
                            Tier {u.kyc_tier}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm hidden sm:table-cell">{u.account_number}</td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-chase-light text-chase-blue">
                      Tier {u.kyc_tier}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 font-bold text-chase-navy text-sm md:text-base">
                    {formatUSD(u.balance)}
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      u.status === 'active' ? 'bg-green-100 text-green-700' :
                      u.status === 'suspended' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex justify-end gap-1 md:gap-1.5 flex-wrap max-w-[120px] md:max-w-none ml-auto">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1.5 md:p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors" title="View Details & Edit"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('balance'); setFormData({ ...formData, amount: '', narration: '', type: 'credit' }) }}
                        className="p-1.5 md:p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors" title="Add / Adjust Money"
                      >
                        <DollarSign size={16} />
                      </button>
                      <button
                        onClick={() => handleOpenSeedModal(u)}
                        className="p-1.5 md:p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors" title="Seed Realistic Transaction History"
                      >
                        <Database size={16} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('reset_credentials'); setFormData({ ...formData, password: '', pin: '' }) }}
                        className="p-1.5 md:p-2 hover:bg-pink-50 text-pink-600 rounded-lg transition-colors" title="Reset Password / PIN"
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('status'); }}
                        className="p-1.5 md:p-2 hover:bg-amber-50 text-amber-600 rounded-lg transition-colors" title="Set Status"
                      >
                        <Lock size={16} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('message'); setFormData({ ...formData, title: '', message: '' }) }}
                        className="p-1.5 md:p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Send Message"
                      >
                        <Send size={16} />
                      </button>
                      <button
                        onClick={() => { setActiveUser(u); setModalType('delete'); }}
                        className="p-1.5 md:p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors" title="Delete User"
                      >
                        <Trash2 size={16} />
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="State"
                  placeholder="e.g. California"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                />
                <Input
                  label="Zipcode"
                  placeholder="e.g. 90210"
                  value={formData.zipcode}
                  onChange={e => setFormData({ ...formData, zipcode: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">Account Type</label>
                  <select
                    className="w-full p-2.5 border border-chase-border rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                    value={formData.account_type}
                    onChange={e => setFormData({ ...formData, account_type: e.target.value })}
                  >
                    <option value="Savings Account">Savings Account</option>
                    <option value="Checking Account">Checking Account</option>
                    <option value="Current Account">Current Account</option>
                    <option value="Business Account">Business Account</option>
                  </select>
                </div>
                <Input
                  label="Occupation"
                  placeholder="e.g. Software Engineer"
                  value={formData.occupation}
                  onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
                <div>
                  <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">Sex</label>
                  <select
                    className="w-full p-2.5 border border-chase-border rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                    value={formData.sex}
                    onChange={e => setFormData({ ...formData, sex: e.target.value })}
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">Account Currency</label>
                <select
                  className="w-full p-2.5 border border-chase-border rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="CHF">CHF (CHF)</option>
                  <option value="SGD">SGD (S$)</option>
                </select>
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
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-chase-navy mb-2">Seed Transaction History: {activeUser?.full_name}</h2>
            <p className="text-sm text-gray-500 mb-4">
              Configure exactly 7 transactions to seed into the statement. Seeding will <strong>not</strong> modify the user's current account balance.
            </p>
            <form onSubmit={handleSeedTransactions} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-chase-navy">Base / Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full p-3 border border-chase-border rounded-lg focus:border-chase-blue outline-none transition-colors text-sm bg-white"
                    required
                    value={formData.base_date}
                    onChange={e => setFormData({ ...formData, base_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto p-3 bg-gray-50 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-chase-navy uppercase tracking-wider mb-2">Edit Seeding Sequence</h4>
                {seedTransactions.map((tx, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full">Transaction #{idx + 1}</span>
                      <select
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white font-bold text-gray-700 outline-none focus:border-chase-blue"
                        value={tx.type}
                        onChange={e => {
                          const updated = [...seedTransactions];
                          updated[idx].type = e.target.value;
                          setSeedTransactions(updated);
                        }}
                      >
                        <option value="credit">CREDIT (+)</option>
                        <option value="debit">DEBIT (-)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Narration</label>
                        <input
                          type="text"
                          required
                          className="w-full text-xs p-2 border border-gray-300 rounded outline-none focus:border-chase-blue"
                          value={tx.narration}
                          onChange={e => {
                            const updated = [...seedTransactions];
                            updated[idx].narration = e.target.value;
                            setSeedTransactions(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Amount (GBP)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          min="0.01"
                          className="w-full text-xs p-2 border border-gray-300 rounded outline-none font-bold focus:border-chase-blue"
                          value={tx.amount}
                          onChange={e => {
                            const updated = [...seedTransactions];
                            updated[idx].amount = parseFloat(e.target.value) || 0;
                            setSeedTransactions(updated);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Channel / Type</label>
                        <select
                          className="w-full text-xs p-2 border border-gray-300 rounded bg-white outline-none focus:border-chase-blue"
                          value={tx.channel}
                          onChange={e => {
                            const updated = [...seedTransactions];
                            updated[idx].channel = e.target.value;
                            setSeedTransactions(updated);
                          }}
                        >
                          <option value="deposit">Deposit</option>
                          <option value="internal_transfer">Local Transfer</option>
                          <option value="external_transfer">International Transfer</option>
                          <option value="fee">Fee</option>
                          <option value="adjustment">Adjustment</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Days Offset (e.g. -5 means 5 days ago)</label>
                        <input
                          type="number"
                          required
                          className="w-full text-xs p-2 border border-gray-300 rounded outline-none focus:border-chase-blue"
                          value={tx.days_offset}
                          onChange={e => {
                            const updated = [...seedTransactions];
                            updated[idx].days_offset = parseInt(e.target.value) || 0;
                            setSeedTransactions(updated);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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

      {/* Edit User Details Modal */}
      {modalType === 'edit_user_details' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-chase-navy mb-4">Edit User Account: {activeUser?.full_name}</h2>
            <form onSubmit={handleUpdateUserDetails} className="space-y-6">

              {/* Profile Picture Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="relative group w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-orange-500 shadow-md bg-white flex items-center justify-center">
                  {editFormData.profile_picture_url ? (
                    <img
                      src={editFormData.profile_picture_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="text-gray-300 w-20 h-20" />
                  )}
                  <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <UploadCloud size={20} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureUpload}
                    />
                  </label>
                </div>
                <div className="space-y-2 flex-1 w-full">
                  <h4 className="text-sm font-bold text-chase-navy">User Profile Picture</h4>
                  <p className="text-xs text-gray-500">Upload a JPG or PNG (simulates Cloudinary upload). The picture shows instantly below and across the platform.</p>
                  <div className="flex gap-2">
                    <label className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5">
                      <UploadCloud size={14} /> Upload Picture
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePictureUpload}
                      />
                    </label>
                    {editFormData.profile_picture_url && (
                      <button
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, profile_picture_url: '' })}
                        className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded text-xs font-bold transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Or enter direct image URL..."
                    className="w-full p-2 border border-gray-300 rounded text-xs outline-none focus:border-chase-blue mt-1"
                    value={editFormData.profile_picture_url}
                    onChange={e => setEditFormData({ ...editFormData, profile_picture_url: e.target.value })}
                  />
                </div>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  required
                  value={editFormData.full_name}
                  onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                />
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                />
                <Input
                  label="Phone Number"
                  required
                  value={editFormData.phone}
                  onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                />
                <Input
                  label="Account Number"
                  required
                  value={editFormData.account_number}
                  onChange={e => setEditFormData({ ...editFormData, account_number: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Account Balance (GBP)"
                  type="number"
                  step="0.01"
                  required
                  value={editFormData.balance}
                  onChange={e => setEditFormData({ ...editFormData, balance: e.target.value })}
                />
                <Input
                  label="Ledger Balance (GBP)"
                  type="number"
                  step="0.01"
                  required
                  value={editFormData.ledger_balance}
                  onChange={e => setEditFormData({ ...editFormData, ledger_balance: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="SWIFT Code"
                  placeholder="e.g. STRCGB2L"
                  value={editFormData.swift_code}
                  onChange={e => setEditFormData({ ...editFormData, swift_code: e.target.value })}
                />
                <Input
                  label="Routing Code"
                  placeholder="e.g. 10-20-30"
                  value={editFormData.routing_code}
                  onChange={e => setEditFormData({ ...editFormData, routing_code: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">KYC Tier</label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                    value={editFormData.kyc_tier}
                    onChange={e => setEditFormData({ ...editFormData, kyc_tier: e.target.value })}
                  >
                    <option value="0">Tier 0 (Unverified)</option>
                    <option value="1">Tier 1 (Basic)</option>
                    <option value="2">Tier 2 (Verified)</option>
                    <option value="3">Tier 3 (Premium)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">Account Status</label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                    value={editFormData.status}
                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="frozen">Frozen</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <Input
                  label="Manual Transfer Limit (GBP)"
                  placeholder="Bypass KYC tier if set"
                  type="number"
                  value={editFormData.max_transfer_limit}
                  onChange={e => setEditFormData({ ...editFormData, max_transfer_limit: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="State"
                  placeholder="e.g. California"
                  value={editFormData.state}
                  onChange={e => setEditFormData({ ...editFormData, state: e.target.value })}
                />
                <Input
                  label="Zipcode"
                  placeholder="e.g. 90210"
                  value={editFormData.zipcode}
                  onChange={e => setEditFormData({ ...editFormData, zipcode: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">Account Type</label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                    value={editFormData.account_type}
                    onChange={e => setEditFormData({ ...editFormData, account_type: e.target.value })}
                  >
                    <option value="Savings Account">Savings Account</option>
                    <option value="Checking Account">Checking Account</option>
                    <option value="Current Account">Current Account</option>
                    <option value="Business Account">Business Account</option>
                  </select>
                </div>
                <Input
                  label="Occupation"
                  placeholder="e.g. Software Engineer"
                  value={editFormData.occupation}
                  onChange={e => setEditFormData({ ...editFormData, occupation: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={editFormData.date_of_birth}
                  onChange={e => setEditFormData({ ...editFormData, date_of_birth: e.target.value })}
                />
                <div>
                  <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">Sex</label>
                  <select
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                    value={editFormData.sex}
                    onChange={e => setEditFormData({ ...editFormData, sex: e.target.value })}
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-chase-navy uppercase block mb-1.5">Account Currency</label>
                <select
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-chase-blue outline-none text-sm bg-white"
                  value={editFormData.currency}
                  onChange={e => setEditFormData({ ...editFormData, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (CA$)</option>
                  <option value="AUD">AUD (A$)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="CNY">CNY (¥)</option>
                  <option value="CHF">CHF (CHF)</option>
                  <option value="SGD">SGD (S$)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button variant="secondary" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
                <Button type="submit" className="flex-1" loading={submitting}>Save Changes</Button>
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

      {/* Delete User Modal */}
      {modalType === 'delete' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl text-center">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-red-100 text-red-600`}>
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-chase-navy mb-2">Delete User Account</h2>
            <p className="text-gray-500 mb-6">
              Are you sure you want to permanently delete the account for <strong>{activeUser?.full_name}</strong>? This action is irreversible and all associated bank accounts, credit cards, and transactions will be deleted.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setModalType(null)}>Cancel</Button>
              <Button type="button" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold" onClick={handleDeleteUser} loading={submitting}>Delete Account</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
