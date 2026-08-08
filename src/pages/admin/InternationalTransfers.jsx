import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Search, Filter, Globe, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const InternationalTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittingId, setSubmittingId] = useState(null);

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

  const filteredTransfers = transfers.filter(tx =>
    tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.external_bank_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.external_account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.narration?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-chase-navy flex items-center gap-2">
            <Globe className="text-orange-500" /> International Transfers
          </h1>
          <p className="text-gray-500">Oversee, update status, and issue refunds for outbound external wires.</p>
        </div>
        <button
          onClick={fetchTransfers}
          className="px-4 py-2 bg-stone-900 text-white rounded-xl flex items-center gap-2 hover:bg-stone-850 border border-stone-800 text-sm font-bold transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Queue
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by sender, bank, account, reference..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-chase-blue/20 focus:border-chase-blue text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-chase-navy uppercase text-xs font-black tracking-wider border-b border-gray-100">
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Sender Info</th>
                <th className="px-6 py-4">Beneficiary Bank</th>
                <th className="px-6 py-4">Beneficiary Account</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Alter Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !transfers.length ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400 italic">Loading transfers...</td></tr>
              ) : filteredTransfers.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-400 italic">No international transfers found.</td></tr>
              ) : filteredTransfers.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-chase-blue">{tx.reference}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-chase-navy">{tx.sender_name}</div>
                    <div className="text-xs text-gray-500 font-mono">Acc: {tx.sender_account}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-700">{tx.external_bank_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-700">{tx.external_account_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 font-black text-red-600">
                    £{parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 max-w-xs text-xs text-gray-500 truncate" title={tx.narration}>
                    {tx.narration}
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
    </div>
  );
};

export default InternationalTransfers;
