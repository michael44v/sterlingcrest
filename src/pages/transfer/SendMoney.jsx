import { useState } from 'react';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { User, ArrowRight, UserPlus } from 'lucide-react';
import BeneficiaryList from '../../components/transfer/BeneficiaryList';

const SendMoney = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [formData, setFormData] = useState({
    account_number: '',
    amount: '',
    narration: '',
    pin: ''
  });

  const handleResolve = async (accNum) => {
    const num = accNum || formData.account_number;
    if (num.length !== 10) return;
    setLoading(true);
    try {
      const response = await api.get(`?action=resolve_account&account_number=${num}`);
      if (response.data.status === 'success') {
        setRecipient(response.data.data);
        if (accNum) setFormData(prev => ({ ...prev, account_number: accNum }));
      } else {
        toast.error(response.data.message);
        setRecipient(null);
      }
    } catch {
      toast.error('Could not find account');
    } finally {
      setLoading(false);
    }
  };

  const saveBeneficiary = async () => {
    try {
      await api.post('?action=add_beneficiary', {
        account_number: formData.account_number,
        account_name: recipient.account_holder_name
      });
      toast.success('Beneficiary saved');
    } catch {
      toast.error('Failed to save beneficiary');
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (step === 1 && recipient) return setStep(2);

    setLoading(true);
    try {
      const response = await api.post('?action=internal_transfer', {
        receiver_account_number: formData.account_number,
        amount: formData.amount,
        narration: formData.narration,
        pin: formData.pin
      });
      if (response.data.status === 'success') {
        setStep(3);
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-chase-navy">Send Money</h1>
        <p className="text-gray-500">Internal NorthBridge Bank transfer only</p>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border shadow-lg p-8">
        {step === 1 && (
          <div className="space-y-8">
            <BeneficiaryList onSelect={(acc) => handleResolve(acc)} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                label="Recipient Account Number"
                placeholder="10-digit account number"
                value={formData.account_number}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setFormData({ ...formData, account_number: val });
                  if (val.length === 10) handleResolve(val);
                  else if (recipient) setRecipient(null);
                }}
                required
              />
            </div>
            {recipient && (
              <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="p-2 bg-green-200 text-green-700 rounded-full">
                  <User size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-green-600 uppercase font-bold">Recipient Found</p>
                  <p className="font-bold text-chase-navy">{recipient.account_holder_name}</p>
                </div>
                <button
                  type="button"
                  onClick={saveBeneficiary}
                  className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                  title="Save as beneficiary"
                >
                  <UserPlus size={20} />
                </button>
              </div>
            )}
            <Input
              label="Amount (USD)"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
            <Input
              label="Narration (Optional)"
              placeholder="e.g. Rent Payment"
              value={formData.narration}
              onChange={(e) => setFormData({ ...formData, narration: e.target.value })}
            />
            <Button type="submit" loading={loading} disabled={!recipient} className="w-full">
              Continue
            </Button>
          </form>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-chase-light p-6 rounded-2xl border border-chase-border space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">From</span>
                <span className="font-bold text-chase-navy">Your USD Account</span>
              </div>
              <div className="flex justify-center py-2 text-chase-blue">
                <ArrowRight size={24} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">To</span>
                <span className="font-bold text-chase-navy">{recipient?.account_holder_name}</span>
              </div>
              <div className="pt-4 border-t border-chase-border flex justify-between items-center">
                <span className="text-gray-500">Amount</span>
                <span className="text-2xl font-black text-chase-blue">{formatUSD(formData.amount)}</span>
              </div>
            </div>

            <Input
              label="Enter 4-digit Transaction PIN"
              type="password"
              placeholder="••••"
              maxLength="4"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              required
            />

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button type="submit" loading={loading} className="flex-[2] w-full">Confirm Transfer</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-12 space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 size={80} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-chase-navy">Transfer Successful!</h2>
            <p className="text-gray-500">Your transfer of {formatUSD(formData.amount)} to {recipient?.account_holder_name} has been completed.</p>
            <div className="pt-6">
              <Button onClick={() => window.location.href = '/dashboard'} className="w-full">Back to Dashboard</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMoney;
