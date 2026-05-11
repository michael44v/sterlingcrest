import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ShieldAlert, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const KYCQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const response = await api.get('?action=admin_get_kyc_queue');
        if (response.data.status === 'success') {
          setQueue(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch KYC queue', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const handleReview = async (id, decision) => {
    try {
      const response = await api.post('?action=admin_review_kyc', {
        submission_id: id,
        decision: decision,
        rejection_reason: decision === 'rejected' ? 'Image blurry or invalid' : ''
      });
      if (response.data.status === 'success') {
        toast.success(`Submission ${decision}`);
        setQueue(queue.filter(s => s.id !== id));
      }
    } catch (error) {
      toast.error('Review failed');
    }
  };

  if (loading) return <div>Loading KYC Queue...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-chase-navy">KYC Review Queue</h1>
        <p className="text-gray-500">Pending identity verifications</p>
      </div>

      <div className="grid gap-6">
        {queue.length > 0 ? (
          queue.map((s) => (
            <div key={s.id} className="bg-white p-6 rounded-2xl border border-chase-border shadow-sm flex flex-col md:flex-row justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-chase-light text-chase-blue rounded-full flex items-center justify-center font-bold">
                    {s.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-chase-navy">{s.full_name}</h3>
                    <p className="text-sm text-gray-500">{s.email} • Requested Tier {s.tier_requested}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {['id_front_url', 'id_back_url', 'selfie_url', 'address_doc_url'].map(field => (
                    s[field] && (
                      <a
                        key={field}
                        href={s[field]}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-gray-100 p-2 rounded border border-gray-200 flex items-center justify-between hover:bg-gray-200 transition-colors"
                      >
                        <span className="capitalize">{field.replace(/_url|_/g, ' ')}</span>
                        <ExternalLink size={12} />
                      </a>
                    )
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  onClick={() => handleReview(s.id, 'rejected')}
                  className="flex-1 md:flex-none border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle size={18} className="mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleReview(s.id, 'approved')}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle size={18} className="mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 text-center rounded-2xl border border-chase-border border-dashed text-gray-400">
            <ShieldAlert size={48} className="mx-auto mb-4 opacity-20" />
            No pending KYC submissions
          </div>
        )}
      </div>
    </div>
  );
};

export default KYCQueue;
