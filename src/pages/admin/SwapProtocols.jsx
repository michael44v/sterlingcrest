import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Search, UserCircle, CheckCircle, RefreshCcw, Shield } from 'lucide-react';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const SwapProtocols = () => {
  const [protocols, setProtocols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProtocols = async () => {
    setLoading(true);
    try {
      const response = await api.get('?action=admin_get_swap_protocols');
      if (response.data.status === 'success') {
        setProtocols(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load swap protocols');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, []);

  const handleComplete = async (id) => {
    if (!window.confirm('Are you sure you want to complete this protocol and upgrade the user?')) return;

    setSubmitting(true);
    try {
      const res = await api.post('?action=admin_complete_swap_protocol', {
        protocol_id: id
      });
      if (res.data.status === 'success') {
        toast.success(res.data.message);
        fetchProtocols();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to complete protocol');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProtocols = protocols.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-chase-blue text-white rounded-xl">
                <RefreshCcw size={24} />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-chase-navy">Swap Protocols</h1>
                <p className="text-sm text-gray-500">Manage user account upgrade requests</p>
            </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by user name or email..."
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
                <th className="px-6 py-4">Current Tier</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chase-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">Loading requests...</td>
                </tr>
              ) : filteredProtocols.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500 italic">No swap requests found</td>
                </tr>
              ) : (
                filteredProtocols.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <UserCircle className="text-gray-400" size={32} />
                        <div>
                          <p className="font-bold text-chase-navy">{p.full_name}</p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-chase-light text-chase-blue">
                        Tier {p.kyc_tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(p.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleComplete(p.id)}
                          disabled={submitting}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-auto text-sm font-bold shadow-sm"
                        >
                          <CheckCircle size={16} />
                          Approve & Upgrade
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SwapProtocols;
