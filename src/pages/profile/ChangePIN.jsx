import React, { useState } from 'react';
import axios from '../../api/axios';
import Button from '../../components/ui/Button';
import PinInput from '../../components/ui/PinInput';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock } from 'lucide-react';

const ChangePIN = () => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return toast.error('PIN must be 4 digits');

    setLoading(true);
    try {
      const res = await axios.get('', {
        params: {
          action: 'set_pin',
          pin: pin
        }
      });
      if (res.data.status === 'success') {
        toast.success('Transaction PIN updated successfully');
        setPin('');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to update PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 md:p-8">
      <div className="bg-white p-8 rounded-3xl border border-chase-border shadow-xl">
        <div className="w-16 h-16 bg-chase-light rounded-2xl flex items-center justify-center text-chase-blue mb-6 mx-auto">
          <Lock size={32} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-chase-navy">Set Transaction PIN</h1>
          <p className="text-gray-500 mt-2">This 4-digit PIN will be required for every transfer and to reveal your card details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center">
            <PinInput value={pin} onChange={setPin} />
          </div>

          <div className="bg-chase-light/50 p-4 rounded-xl flex gap-3 items-start border border-chase-border">
            <ShieldCheck className="text-chase-blue mt-0.5" size={18} />
            <p className="text-xs text-chase-navy/70 leading-relaxed">
              <strong>Security Tip:</strong> Choose a PIN that is not easily guessable. Avoid sequences like 1234 or repeating numbers like 0000.
            </p>
          </div>

          <Button type="submit" loading={loading} className="w-full py-4 text-lg font-bold">
            Update Security PIN
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChangePIN;
