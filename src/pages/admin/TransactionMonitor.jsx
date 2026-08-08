import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Eye, Pencil, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const TransactionMonitor = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Editing state
  const [editingTx, setEditingTx] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    narration: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('', { params: { action: 'admin_get_transactions' } });
      if (res.data.status === 'success') {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (tx) => {
    setEditingTx(tx);
    setFormData({
      amount: tx.amount,
      narration: tx.narration || ''
    });
  };

  const handleUpdateTransaction = async (e) => {
    e.preventDefault();
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid positive amount.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post('?action=admin_edit_transaction', {
        transaction_id: editingTx.id,
        amount: formData.amount,
        narration: formData.narration
      });
      if (res.data.status === 'success') {
        toast.success('Statement updated successfully!');
        setEditingTx(null);
        fetchTransactions();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update transaction statement');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter(tx =>
    tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.narration?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-chase-navy">Transaction Monitor</h1>
          <p className="text-gray-500">Real-time oversight and statement editing.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, reference or narration..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 flex items-center gap-2 hover:bg-gray-50">
            <Filter size={18} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-chase-navy uppercase text-xs font-black tracking-wider">
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Sender</th>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400 italic">Loading transactions...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400 italic">No transactions found.</td></tr>
              ) : filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-chase-blue">
                    <div>{tx.reference}</div>
                    {tx.narration && (
                      <div className="text-[10px] text-gray-400 mt-1 max-w-xs truncate" title={tx.narration}>
                        Desc: {tx.narration}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-chase-navy">{tx.sender_name}</div>
                    <div className="text-xs text-gray-500">{tx.sender_account}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-chase-navy">{tx.recipient_name}</div>
                    <div className="text-xs text-gray-500">{tx.recipient_account}</div>
                  </td>
                  <td className="px-6 py-4 capitalize text-sm">{tx.channel.replace('_', ' ')}</td>
                  <td className={`px-6 py-4 font-black ${tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                    <div className="flex items-center gap-1">
                      {tx.type === 'debit' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      £{parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString()} <br/>
                    {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEditClick(tx)}
                      className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
                      title="Edit Account Statement (Figures & Desc)"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <button
              onClick={() => setEditingTx(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-chase-navy mb-2">Edit Account Statement</h2>
            <p className="text-xs text-gray-500 mb-6">
              Modify the figures and description for transaction <span className="font-mono text-orange-600 font-bold">{editingTx.reference}</span> explicitly. Account balance will be adjusted automatically.
            </p>

            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <Input
                label="Amount (GBP)"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-chase-navy block">Transaction Description (Narration)</label>
                <textarea
                  className="w-full p-3 border border-chase-border rounded-lg h-24 focus:border-chase-blue outline-none transition-colors text-sm"
                  placeholder="e.g. Rent Payment / Refund"
                  required
                  value={formData.narration}
                  onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setEditingTx(null)}>Cancel</Button>
                <Button type="submit" className="flex-1 font-bold" loading={submitting}>Update Entry</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionMonitor;
