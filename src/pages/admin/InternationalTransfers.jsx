import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Search, Globe, RefreshCw, CheckCircle, XCircle, AlertTriangle, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';

const InternationalTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittingId, setSubmittingId] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: '',
    bank_name: '',
    country: '',
    swift_code: '',
    account_name: '',
    account_number: '',
    iban: '',
    amount: '',
    narration: '',
    transaction_type: 'WIRE-TRANSFER',
    purpose: '',
    status: ''
  });

  useEffect(() => {
    fetchTransfers();
  }, []);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('', { params: { action: 'admin_get_international_transfers' } });
      if (res.data.status === 'success') {
        setTransfers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch international transfers');
      toast.error('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (txId, newStatus) => {
    setSubmittingId(txId);
    try {
      const res = await axios.post('?action=admin_update_international_status', {
        transaction_id: txId,
        status: newStatus
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        fetchTransfers();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update transfer status');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleOpenEdit = (tx) => {
    setEditForm({
      id: tx.id,
      bank_name: tx.bank_name || '',
      country: tx.country || '',
      swift_code: tx.swift_code || '',
      account_name: tx.account_name || '',
      account_number: tx.account_number || '',
      iban: tx.iban || '',
      amount: tx.amount || '',
      narration: tx.narration || '',
      transaction_type: tx.transaction_type || 'WIRE-TRANSFER',
      purpose: tx.purpose || '',
      status: tx.status || 'completed'
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editForm.account_number.length !== 10) {
      toast.error('Account number must be exactly 10 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('?action=admin_edit_international_transfer', editForm);
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        setIsEditModalOpen(false);
        fetchTransfers();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to edit international transfer');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers.filter(tx =>
    (tx.reference && tx.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.sender_name && tx.sender_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.bank_name && tx.bank_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.account_name && tx.account_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.narration && tx.narration.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.iban && tx.iban.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-chase-navy flex items-center gap-2">
            <Globe className="text-orange-500" /> International Transfers
          </h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Oversee, update status, view user entries, and edit transfer properties.</p>
        </div>
        <button
          onClick={fetchTransfers}
          className="px-4 py-2.5 bg-stone-900 text-white rounded-xl flex items-center gap-2 hover:bg-stone-800 border border-stone-800 text-sm font-bold transition-all shadow-sm"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Queue
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by sender, bank, account name, IBAN, reference..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/75 text-chase-navy uppercase text-xs font-black tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Sender Info</th>
                <th className="px-6 py-4">Beneficiary Bank / Country</th>
                <th className="px-6 py-4">Beneficiary Account & IBAN</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Type & Purpose</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading && !transfers.length ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400 italic">Loading transfers...</td></tr>
              ) : filteredTransfers.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400 italic">No international transfers found.</td></tr>
              ) : filteredTransfers.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/55 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-chase-blue">{tx.reference || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-chase-navy">{tx.sender_name}</div>
                    <div className="text-xs text-gray-500 font-mono">Acc: {tx.sender_account}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-800">{tx.bank_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500 font-bold flex items-center gap-1">
                      <Globe size={12} className="text-stone-400" /> {tx.country || 'N/A'} (SWIFT: <span className="font-mono font-medium">{tx.swift_code || 'N/A'}</span>)
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-800">{tx.account_name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">
                      No: <span className="font-mono font-bold text-stone-600">{tx.account_number || 'N/A'}</span>
                    </div>
                    <div className="text-[11px] text-orange-600 font-mono font-medium">
                      IBAN: {tx.iban || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-black text-red-600">
                    ${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-700 text-xs uppercase tracking-wider">{tx.transaction_type || 'WIRE-TRANSFER'}</div>
                    <div className="text-[11px] text-gray-500 italic max-w-[150px] truncate" title={tx.purpose}>
                      {tx.purpose || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-2 rounded-lg text-chase-blue hover:bg-chase-blue/10 transition-all"
                        title="Edit Transfer Properties"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(tx.id, 'completed')}
                        disabled={submittingId !== null || tx.status === 'completed'}
                        className={`p-2 rounded-lg transition-all ${
                          tx.status === 'completed'
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-green-50 text-green-600'
                        }`}
                        title="Mark as Completed"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(tx.id, 'failed')}
                        disabled={submittingId !== null || tx.status === 'failed' || tx.status === 'reversed'}
                        className={`p-2 rounded-lg transition-all ${
                          tx.status === 'failed' || tx.status === 'reversed'
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-red-50 text-red-600'
                        }`}
                        title="Mark as Failed (Refund Money)"
                      >
                        <XCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(tx.id, 'reversed')}
                        disabled={submittingId !== null || tx.status === 'failed' || tx.status === 'reversed'}
                        className={`p-2 rounded-lg transition-all ${
                          tx.status === 'failed' || tx.status === 'reversed'
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-amber-50 text-amber-600'
                        }`}
                        title="Mark as Reversed (Refund Money)"
                      >
                        <AlertTriangle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-100 p-6 md:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-black text-chase-navy flex items-center gap-2">
                <Edit className="text-orange-500" /> Edit Transfer Details
              </h2>
              <p className="text-gray-500 text-xs mt-1">Modify any properties entered by the user. Changes dynamically sync the associated user's account balance.</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.bank_name}
                    onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={editForm.country}
                    onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">SWIFT Code</label>
                  <input
                    type="text"
                    required
                    value={editForm.swift_code}
                    onChange={(e) => setEditForm({ ...editForm, swift_code: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">IBAN</label>
                  <input
                    type="text"
                    required
                    value={editForm.iban}
                    onChange={(e) => setEditForm({ ...editForm, iban: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Account Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.account_name}
                    onChange={(e) => setEditForm({ ...editForm, account_name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Account Number (10 digits)</label>
                  <input
                    type="text"
                    required
                    maxLength="10"
                    value={editForm.account_number}
                    onChange={(e) => setEditForm({ ...editForm, account_number: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Amount (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.amount}
                    onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm font-bold"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="reversed">Reversed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Transaction Type</label>
                  <input
                    type="text"
                    required
                    value={editForm.transaction_type}
                    onChange={(e) => setEditForm({ ...editForm, transaction_type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Purpose of Transfer</label>
                  <input
                    type="text"
                    required
                    value={editForm.purpose}
                    onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Narration (Optional)</label>
                <input
                  type="text"
                  value={editForm.narration}
                  onChange={(e) => setEditForm({ ...editForm, narration: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue outline-none transition-all text-sm"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternationalTransfers;
