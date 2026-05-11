import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { User, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const BeneficiaryList = ({ onSelect }) => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBeneficiaries = async () => {
      try {
        const res = await api.get('?action=get_beneficiaries');
        if (res.data.status === 'success') {
          setBeneficiaries(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch beneficiaries');
      } finally {
        setLoading(false);
      }
    };
    fetchBeneficiaries();
  }, []);

  if (loading) return <div className="animate-pulse flex gap-4 overflow-x-auto pb-2">
    {[1,2,3].map(i => <div key={i} className="w-20 h-24 bg-gray-100 rounded-2xl shrink-0" />)}
  </div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saved Beneficiaries</h3>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {beneficiaries.map((b) => (
          <button
            key={b.id}
            onClick={() => onSelect(b.account_number)}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div className="w-14 h-14 rounded-full bg-chase-light flex items-center justify-center text-chase-blue group-hover:bg-chase-blue group-hover:text-white transition-all border border-chase-border">
              <User size={24} />
            </div>
            <span className="text-[10px] font-bold text-chase-navy text-center w-16 truncate leading-tight">
              {b.account_name.split(' ')[0]}
            </span>
          </button>
        ))}

        {beneficiaries.length === 0 && (
          <p className="text-xs text-gray-400 italic py-4 px-1">No saved beneficiaries yet.</p>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryList;
