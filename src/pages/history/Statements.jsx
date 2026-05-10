import React, { useState } from 'react';
import { FileText, Download, Calendar, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { generateStatement } from '../../utils/pdfGenerator';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const Statements = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [previewData, setPreviewData] = useState(null);

  const handleFetchData = async (e) => {
    e.preventDefault();
    if (!dateFrom || !dateTo) {
      toast.error('Please select both start and end dates');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/api.php', {
        params: {
          action: 'get_statement_data',
          date_from: dateFrom,
          date_to: dateTo
        }
      });

      if (response.data.status === 'success') {
        setPreviewData(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch statement data');
      }
    } catch (error) {
      console.error('Statement error:', error);
      toast.error('An error occurred while fetching statement data');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!previewData) return;
    try {
      generateStatement(previewData);
      toast.success('Statement downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-chase-blue hover:text-chase-mid mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to History
      </button>

      <div className="bg-white rounded-2xl border border-chase-border overflow-hidden shadow-sm">
        <div className="bg-chase-navy p-6 text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Generate Account Statement</h1>
              <p className="text-white/70 text-sm">Download your transaction history in PDF format</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleFetchData} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Input
              label="Date From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              required
            />
            <Input
              label="Date To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              required
            />
            <div className="mb-1">
              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                <Search className="w-4 h-4 mr-2" />
                Preview Statement
              </Button>
            </div>
          </form>

          {previewData && (
            <div className="mt-10 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-chase-navy">Statement Preview</h2>
                <Button variant="secondary" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <SummaryCard label="Opening Balance" value={previewData.summary.openingBalance} />
                <SummaryCard label="Total Credits" value={previewData.summary.totalCredits} isCredit />
                <SummaryCard label="Total Debits" value={previewData.summary.totalDebits} isDebit />
                <SummaryCard label="Closing Balance" value={previewData.summary.closingBalance} isBold />
              </div>

              <div className="border border-chase-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-chase-light text-chase-navy">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Date</th>
                      <th className="px-4 py-3 text-left font-semibold">Description</th>
                      <th className="px-4 py-3 text-right font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-chase-border">
                    {previewData.transactions.slice(0, 10).map((t, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600">{t.date}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{t.narration}</p>
                          <p className="text-xs text-gray-400">{t.reference}</p>
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${
                          t.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {t.type === 'credit' ? '+' : '-'}${t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {previewData.transactions.length > 10 && (
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-center text-gray-400 italic">
                          ... and {previewData.transactions.length - 10} more transactions
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, isCredit, isDebit, isBold }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-chase-border">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className={`text-lg font-bold ${
      isCredit ? 'text-green-600' : isDebit ? 'text-red-600' : 'text-chase-navy'
    }`}>
      ${value.toLocaleString()}
    </p>
  </div>
);

export default Statements;
