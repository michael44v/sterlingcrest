import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { CheckCircle2, User, ArrowRight, UserPlus, AlertTriangle, Building2, Globe } from 'lucide-react';
import BeneficiaryList from '../../components/transfer/BeneficiaryList';

const SendMoney = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [transferType, setTransferType] = useState('internal'); // 'internal' or 'external'
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [userTier, setUserTier] = useState(null);
  const [banks, setBanks] = useState([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapType, setSwapType] = useState('internal');

  const [formData, setFormData] = useState({
    account_number: '',
    amount: '',
    narration: '',
    pin: '',
    confirm_name: '',
    bank_id: ''
  });

  useEffect(() => {
    const fetchTier = async () => {
      try {
        const response = await api.get('?action=get_kyc_status');
        if (response.data.status === 'success') {
          setUserTier(response.data.data.kyc_tier);
        }
      } catch (e) {
        console.error('Failed to fetch KYC tier');
      }
    };

    const fetchBanks = async () => {
        try {
            const response = await api.get('?action=get_external_banks');
            if (response.data.status === 'success') {
                setBanks(response.data.data);
            }
        } catch (e) {
            console.error('Failed to fetch banks');
        }
    };

    fetchTier();
    fetchBanks();
  }, []);

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
    } catch (e) {
      toast.error('Could not find account');
    } finally {
      setLoading(false);
    }
  };

  const checkSwapProtocol = async (type) => {
    try {
        const response = await api.get(`?action=check_swap_protocol_status&type=${type}`);
        return response.data.status === 'success';
    } catch (e) {
        return false;
    }
  };

  const saveBeneficiary = async () => {
    try {
      await api.post('?action=add_beneficiary', {
        account_number: formData.account_number,
        account_name: recipient.account_holder_name
      });
      toast.success('Beneficiary saved');
    } catch (e) {
      toast.error('Failed to save beneficiary');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (transferType === 'internal' && userTier === 1) {
      setSwapType('internal');
      setShowSwapModal(true);
      return;
    }

    if (transferType === 'external') {
        const isApproved = await checkSwapProtocol('external');
        if (!isApproved) {
            setSwapType('external');
            setShowSwapModal(true);
            return;
        }
    }

    if (step === 1 && recipient) {
      if (parseFloat(formData.amount) > 200000) {
        return setStep(1.5); // Large amount confirmation step
      }
      return setStep(2);
    }

    if (step === 1.5) {
      if (formData.confirm_name.trim().toLowerCase() !== recipient.account_holder_name.toLowerCase()) {
        toast.error('Account name does not match');
        return;
      }
      return setStep(2);
    }

    setLoading(true);
    try {
      const endpoint = transferType === 'internal' ? '?action=internal_transfer' : '?action=internal_transfer'; // Requirement says resolve to internal user
      const response = await api.post(endpoint, {
        receiver_account_number: formData.account_number,
        amount: formData.amount,
        narration: formData.narration,
        pin: formData.pin,
        transfer_type: transferType,
        bank_id: formData.bank_id
      });
      if (response.data.status === 'success') {
        setStep(3);
      } else {
        toast.error(response.data.message);
      }
    } catch (e) {
      toast.error('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-chase-navy">Send Money</h1>
        <p className="text-gray-500">Transfer funds securely</p>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
          <button
            onClick={() => {
                setTransferType('internal');
                setStep(1);
                setRecipient(null);
                setFormData({...formData, account_number: ''});
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${transferType === 'internal' ? 'bg-white text-chase-blue shadow-sm' : 'text-gray-500 hover:text-chase-navy'}`}
          >
              <Building2 size={20} />
              Internal Transfer
          </button>
          <button
            onClick={() => {
                setTransferType('external');
                setStep(1);
                setRecipient(null);
                setFormData({...formData, account_number: ''});
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition-all ${transferType === 'external' ? 'bg-white text-chase-blue shadow-sm' : 'text-gray-500 hover:text-chase-navy'}`}
          >
              <Globe size={20} />
              External Bank
          </button>
      </div>

      <div className="bg-white rounded-2xl border border-chase-border shadow-lg p-8">
        {step === 1 && (
          <div className="space-y-8">
            {transferType === 'internal' && <BeneficiaryList onSelect={(acc) => handleResolve(acc)} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {transferType === 'external' && (
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-chase-navy uppercase tracking-wider">Select Destination Bank</label>
                    <select
                        className="w-full px-4 py-3 bg-gray-50 border border-chase-border rounded-xl focus:ring-2 focus:ring-chase-blue focus:border-transparent transition-all outline-none"
                        value={formData.bank_id}
                        onChange={(e) => setFormData({...formData, bank_id: e.target.value})}
                        required
                    >
                        <option value="">-- Choose a Bank --</option>
                        {banks.map(bank => (
                            <option key={bank.id} value={bank.id}>{bank.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="relative">
              <Input
                label={transferType === 'internal' ? "Recipient Account Number" : "External Account Number"}
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
                {transferType === 'internal' && (
                    <button
                    type="button"
                    onClick={saveBeneficiary}
                    className="p-2 hover:bg-green-100 rounded-lg text-green-600 transition-colors"
                    title="Save as beneficiary"
                    >
                    <UserPlus size={20} />
                    </button>
                )}
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
            <Button type="submit" loading={loading} disabled={!recipient || (transferType === 'external' && !formData.bank_id)} className="w-full">
              Continue
            </Button>
          </form>
          </div>
        )}

        {step === 1.5 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-2">
              <p className="font-bold">High Value Transfer Confirmation</p>
              <p className="text-sm">You are transferring over {formatUSD(200000)}. To prevent errors, please type the recipient's full name exactly as it appears below.</p>
              <p className="font-mono bg-white/50 p-2 rounded border border-amber-100 mt-2 text-center text-lg">{recipient?.account_holder_name}</p>
            </div>

            <Input
              label="Confirm Recipient Name"
              placeholder="Type the name exactly as shown"
              value={formData.confirm_name}
              onChange={(e) => setFormData({ ...formData, confirm_name: e.target.value })}
              required
              autoFocus
            />

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button type="submit" className="flex-[2] w-full">Verify & Continue</Button>
            </div>
          </form>
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
                <div className="text-right">
                    <p className="font-bold text-chase-navy">{recipient?.account_holder_name}</p>
                    {transferType === 'external' && (
                        <p className="text-xs text-gray-500">{banks.find(b => b.id == formData.bank_id)?.name}</p>
                    )}
                </div>
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

      {showSwapModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl text-center animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-chase-navy mb-4 uppercase tracking-tight">SWAP PROTOCOL REQUIRED</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              To complete this {swapType} transfer, a usdt swap protocol is required.
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate(`/transfer/swap?type=${swapType}`)} className="w-full py-4 text-lg shadow-lg shadow-chase-blue/20">
                SWAP NOW
              </Button>
              <button
                onClick={() => setShowSwapModal(false)}
                className="text-gray-400 hover:text-gray-600 font-medium transition-colors"
              >
                Cancel Transfer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendMoney;
