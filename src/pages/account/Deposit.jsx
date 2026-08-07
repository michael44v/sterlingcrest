import React, { useState, useEffect } from 'react';
import { CreditCard, Landmark, ArrowRight, ShieldCheck, Copy, CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const Deposit = () => {
  const [method, setMethod] = useState(null);
  const [swapStatus, setSwapStatus] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const checkSwapStatus = async () => {
        try {
            const res = await api.get('?action=check_swap_protocol_status&type=internal');
            setSwapStatus(res.data.data);
        } catch (e) {
            console.error('Failed to check swap status');
        }
    };
    checkSwapStatus();
  }, []);

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
        // Simulate upload
        const res = await api.post('?action=upload_swap_receipt', {
            receipt_url: 'https://cloudinary.com/receipt.jpg'
        });
        if (res.data.status === 'success') {
            toast.success('Receipt uploaded successfully');
            // Refresh status
            const statusRes = await api.get('?action=check_swap_protocol_status&type=internal');
            setSwapStatus(statusRes.data.data);
        } else {
            toast.error(res.data.message);
        }
    } catch (err) {
        toast.error('Upload failed');
    } finally {
        setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return toast.error('Enter a valid amount');

    if (method === 'card') {
      setLoading(true);
      try {
        const res = await api.post('?action=deposit', {
          method: 'card',
          amount: parseFloat(amount)
        });
        if (res.data.status === 'success') {
          setStep(3);
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error('Deposit failed');
      } finally {
        setLoading(false);
      }
    } else {
      setStep(2);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-chase-navy">Fund Account</h1>
        <p className="text-gray-500">Add funds to your SterLingCrest Finance USD account</p>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border shadow-lg overflow-hidden">
        {step === 1 && (
          <div className="p-8 space-y-8 border-b border-chase-border">
            <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                    <Upload size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-chase-navy">Swap Protocol Receipt</h3>
                    <p className="text-xs text-gray-500">Upload your USDT swap payment receipt here.</p>
                </div>
            </div>

            {swapStatus?.attempt_count > 1 && (swapStatus?.is_expired || !swapStatus?.has_receipt) && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle size={20} />
                    <p className="text-sm font-bold">The USDT was not enough the second time, please upload a new receipt.</p>
                </div>
            )}

            <div className="relative group">
                <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    onChange={handleReceiptUpload}
                    disabled={loading}
                />
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center group-hover:border-chase-blue transition-all bg-gray-50/50">
                    <Upload className="mx-auto text-gray-400 group-hover:text-chase-blue mb-2" size={32} />
                    <p className="text-sm font-medium text-gray-600">
                        {loading ? 'Uploading...' : swapStatus?.has_receipt ? 'Upload a new receipt' : 'Click to upload payment receipt'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG or PDF</p>
                </div>
            </div>

            {swapStatus?.has_receipt && !swapStatus?.is_expired && (
                <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                    <CheckCircle2 size={16} />
                    Receipt uploaded and pending verification (valid for 5h)
                </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setMethod('card')}
                className={`p-6 rounded-2xl border-2 transition-all text-left space-y-3 ${
                  method === 'card' ? 'border-chase-blue bg-chase-light/30 ring-1 ring-chase-blue' : 'border-gray-100 hover:border-chase-blue/50'
                }`}
              >
                <div className={`p-3 rounded-xl inline-block ${method === 'card' ? 'bg-chase-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="font-bold text-chase-navy">Debit/Credit Card</p>
                  <p className="text-xs text-gray-500">Instant deposit via Stripe</p>
                </div>
              </button>

              <button
                onClick={() => setMethod('bank')}
                className={`p-6 rounded-2xl border-2 transition-all text-left space-y-3 ${
                  method === 'bank' ? 'border-chase-blue bg-chase-light/30 ring-1 ring-chase-blue' : 'border-gray-100 hover:border-chase-blue/50'
                }`}
              >
                <div className={`p-3 rounded-xl inline-block ${method === 'bank' ? 'bg-chase-blue text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Landmark size={24} />
                </div>
                <div>
                  <p className="font-bold text-chase-navy">Bank Wire</p>
                  <p className="text-xs text-gray-500">1-2 business days</p>
                </div>
              </button>
            </div>

            {method && (
              <form onSubmit={handleDeposit} className="space-y-6 animate-fade-in">
                <Input
                  label="Amount to Deposit (USD)"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <div className="bg-chase-light/50 p-4 rounded-xl flex gap-3 items-center border border-chase-border">
                  <ShieldCheck className="text-chase-blue" size={20} />
                  <p className="text-xs text-chase-navy/70 font-medium">Securely processed and encrypted.</p>
                </div>
                <Button type="submit" className="w-full py-4 text-lg font-bold" loading={loading}>
                  Continue <ArrowRight className="ml-2" size={20} />
                </Button>
              </form>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="p-8 space-y-6">
            <h2 className="text-xl font-bold text-chase-navy">Bank Transfer Details</h2>
            <p className="text-sm text-gray-500">Please make a transfer of <span className="font-bold text-chase-blue">${amount}</span> to the following account:</p>

            <div className="space-y-4">
              {[
                { label: 'Bank Name', value: 'SterLingCrest Finance Partner Bank' },
                { label: 'Account Name', value: 'SterLingCrest Finance Settlements' },
                { label: 'Account Number', value: '9876543210' },
                { label: 'Routing Number', value: '123456789' },
                { label: 'Reference', value: 'DEP-' + Math.random().toString(36).substring(7).toUpperCase() },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{item.label}</p>
                    <p className="font-bold text-chase-navy">{item.value}</p>
                  </div>
                  <button onClick={() => copyToClipboard(item.value)} className="text-chase-blue hover:text-chase-mid p-2">
                    <Copy size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 space-y-3">
              <Button onClick={() => setStep(3)} className="w-full">I have made the transfer</Button>
              <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-gray-500">Back</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="p-12 text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 size={80} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-chase-navy">Deposit {method === 'card' ? 'Successful' : 'Initiated'}!</h2>
            <p className="text-gray-500">
              {method === 'card'
                ? `Your deposit of $${amount} has been processed and added to your balance.`
                : `Your deposit request of $${amount} has been received. Your balance will be updated once we confirm the wire transfer.`}
            </p>
            <Button onClick={() => window.location.href = '/dashboard'} className="w-full">Back to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deposit;
