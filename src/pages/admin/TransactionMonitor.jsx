import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Eye } from 'lucide-react';

const TransactionMonitor = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
          <p className="text-gray-500">Real-time oversight of all platform activity.</p>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">Loading transactions...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 italic">No transactions found.</td></tr>
              ) : filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-chase-blue">{tx.reference}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitor;
