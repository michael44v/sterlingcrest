import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import { ArrowUpRight, ArrowDownLeft, Search, Filter, FileText, ReceiptText } from 'lucide-react';
import ReceiptModal from '../../components/ui/ReceiptModal';

const TransactionHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedTx, setSelectedTx]       = useState(null);
  const [searchTerm, setSearchTerm]       = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // The enriched endpoint now returns sender_name, sender_account,
        // recipient_name, recipient_account on every row.
        const response = await api.get('?action=get_transactions');
        if (response.data.status === 'success') {
          setTransactions(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch transactions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) =>
    tx.narration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.sender_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your history...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-chase-navy">Transaction History</h1>
        <p className="text-gray-500">Detailed record of all your financial activities</p>
      </div>

      {/* Search + actions bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-chase-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search narration, reference or name"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-chase-blue transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
            <Filter size={18} />
            Filters
          </button>
          <button
            onClick={() => navigate('/history/statements')}
            className="flex items-center gap-2 px-4 py-2 bg-chase-light text-chase-blue font-semibold rounded-lg hover:bg-chase-blue hover:text-white transition-all"
          >
            <FileText size={18} />
            Generate Statement
          </button>
        </div>
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-2xl border border-chase-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-chase-light text-chase-navy uppercase text-xs font-bold tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Narration</th>
                <th className="px-6 py-4">From / To</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chase-border">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const isCredit      = tx.type === 'credit';
                  const counterparty  = isCredit ? tx.sender_name : tx.recipient_name;
                  const direction     = isCredit ? 'From' : 'To';

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {tx.created_at}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-chase-navy">{tx.narration}</p>
                        <p className="text-xs text-gray-400 uppercase tracking-tighter">
                          {tx.channel?.replace(/_/g, ' ')}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {counterparty
                          ? <><span className="text-xs text-gray-400 mr-1">{direction}</span>{counterparty}</>
                          : <span className="text-gray-300 italic text-xs">—</span>
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                          isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isCredit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                          {tx.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                        {isCredit ? '+' : '-'}{formatUSD(tx.amount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-2 text-chase-blue hover:bg-chase-light rounded-lg transition-colors"
                          title="View receipt"
                        >
                          <ReceiptText size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mobile card list ── */}
      <div className="md:hidden space-y-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => {
            const isCredit     = tx.type === 'credit';
            const counterparty = isCredit ? tx.sender_name : tx.recipient_name;
            const direction    = isCredit ? 'From' : 'To';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="bg-white p-5 rounded-2xl border border-chase-border shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-3 rounded-xl ${isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                      {isCredit ? '+' : '-'}{formatUSD(tx.amount)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {tx.created_at}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-chase-navy">{tx.narration}</p>
                  {counterparty && (
                    <p className="text-xs text-gray-500">
                      <span className="text-gray-400">{direction}: </span>{counterparty}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 flex justify-between items-center">
                    <span>{tx.channel?.replace(/_/g, ' ')}</span>
                    <span className="font-mono text-[10px] opacity-60">{tx.reference}</span>
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 text-center text-gray-400 italic rounded-2xl border border-dashed border-chase-border">
            No transactions found
          </div>
        )}
      </div>

      {/* Receipt modal */}
      {selectedTx && (
        <ReceiptModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};

export default TransactionHistory;