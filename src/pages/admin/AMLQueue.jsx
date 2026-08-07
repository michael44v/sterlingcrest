import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ShieldAlert, CheckCircle, XCircle, User, DollarSign, Clock } from 'lucide-react';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const AMLQueue = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFlags = async () => {
    try {
      const response = await api.get('?action=admin_get_aml_flags');
      if (response.data.status === 'success') {
        setFlags(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch AML flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleResolve = async (id, decision) => {
    try {
      const response = await api.post('?action=admin_resolve_aml_flag', {
        flag_id: id,
        decision: decision
      });
      if (response.data.status === 'success') {
        toast.success(`Flag ${decision} successfully`);
        fetchFlags();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading) return <div className="p-8">Loading AML review queue...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-chase-navy">AML Review Queue</h1>
        <p className="text-gray-500">Transactions flagged for manual anti-money laundering review</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {flags.length > 0 ? (
          flags.map((flag) => (
            <div key={flag.id} className="bg-white border border-chase-border rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      flag.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      flag.status === 'cleared' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {flag.status}
                    </span>
                    <span className="text-sm text-gray-400 font-mono">{flag.reference}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <User className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">User</p>
                        <p className="text-sm font-semibold text-chase-navy">{flag.user_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Amount</p>
                        <p className="text-sm font-bold text-red-600">£{parseFloat(flag.amount).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Flagged At</p>
                        <p className="text-sm text-chase-navy">{flag.created_at}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg border border-red-100 flex items-start gap-3">
                    <ShieldAlert className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-red-800 uppercase tracking-wider">Reason for Flag</p>
                      <p className="text-sm text-red-700">{flag.reason}</p>
                    </div>
                  </div>
                </div>

                {flag.status === 'pending' && (
                  <div className="flex flex-row md:flex-col gap-2 justify-center w-full md:w-auto">
                    <Button
                      variant="secondary"
                      className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      onClick={() => handleResolve(flag.id, 'cleared')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Clear Flag
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleResolve(flag.id, 'escalated')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Escalate
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-chase-border rounded-xl p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 italic">No pending AML flags to review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AMLQueue;
