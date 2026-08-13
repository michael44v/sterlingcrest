import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { CheckCircle2, User, ArrowRight, UserPlus, AlertTriangle, Building2, Globe } from 'lucide-react';
import BeneficiaryList from '../../components/transfer/BeneficiaryList';

const SendMoney = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'internal';
  const [step, setStep] = useState(1);
  const [transferType, setTransferType] = useState(typeParam); // 'internal' or 'external'
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [userTier, setUserTier] = useState(null);
  const [banks, setBanks] = useState([]);
  const [otp, setOtp] = useState('');
  
  const [formData, setFormData] = useState({
    account_number: '',
    amount: '',
    narration: '',
    pin: '',
    confirm_name: '',
    bank_id: 'other',
    manual_bank_name: '',
    manual_account_name: user?.full_name || '',
    country: '',
    swift_code: '',
    iban: '',
    transaction_type: 'WIRE-TRANSFER',
    purpose: ''
  });

  async function sendOtpEmail() {
  const user = JSON.parse(localStorage.getItem('user')); // {"id":18,"full_name":"test David","role":"user"}

  if (!user?.id) {
    console.error('No user id found in localStorage');
    return;
  }

  try {
    const response = await fetch(
      `https://bluevult.com/api/sterlingbank/mail.php?id=${user.id}&action=otp`,
      { method: 'GET' }
    );

    const result = await response.json();

    if (result.status === 'success') {
      // show "check your email" UI
    } else {
      // show result.message to the user
    }
  } catch (err) {
    console.error('Failed to send OTP email:', err);
  }
}

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

  useEffect(() => {
    setTransferType(typeParam);
    setStep(1);
    setRecipient(null);
    setOtp('');
    setFormData(prev => ({
        ...prev,
        account_number: '',
        amount: '',
        narration: '',
        pin: '',
        confirm_name: '',
        bank_id: 'other',
        manual_bank_name: '',
        manual_account_name: user?.full_name || '',
        country: '',
        swift_code: '',
        iban: '',
        transaction_type: 'WIRE-TRANSFER',
        purpose: ''
    }));
  }, [typeParam]);

  const handleResolve = async (accNum) => {
    const num = accNum || formData.account_number;
    if (num.length !== 10) return;
    setLoading(true);
    try {
      const response = await api.get(`?action=resolve_account&account_number=${num}`);
      if (response.data.status === 'success') {
        setRecipient(response.data.data);
        setFormData(prev => ({ 
            ...prev, 
            manual_account_name: response.data.data.account_holder_name,
            ...(accNum ? { account_number: accNum } : {})
        }));
      } else {
        // Only show error for internal transfers
        if (transferType === 'internal') {
            toast.error(response.data.message);
        }
        setRecipient(null);
        if (transferType === 'external' && formData.bank_id && formData.bank_id !== 'other') {
            setFormData(prev => ({ ...prev, manual_account_name: user?.full_name || '' }));
        }
      }
    } catch (e) {
        if (transferType === 'internal') {
            toast.error('Could not find account');
        }
        if (transferType === 'external' && formData.bank_id && formData.bank_id !== 'other') {
            setFormData(prev => ({ ...prev, manual_account_name: user?.full_name || '' }));
        }
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
    } catch (e) {
      toast.error('Failed to save beneficiary');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (transferType === 'internal') {
        if (!recipient) {
          toast.error('Please enter a valid local account number');
          return;
        }
        if (parseFloat(formData.amount) > 200000) {
          return setStep(1.5); // Large amount confirmation step
        }
        return setStep(2);
      } else {
        // External transfer: validate manual fields
        if (!formData.manual_bank_name) {
          toast.error('Please enter Bank Name');
          return;
        }
        if (!formData.country) {
          toast.error('Please select Country');
          return;
        }
        if (!formData.swift_code) {
          toast.error('Please enter SWIFT Code');
          return;
        }
        if (!formData.iban) {
          toast.error('Please enter IBAN');
          return;
        }
        if (!formData.manual_account_name) {
          toast.error('Please enter Account Name');
          return;
        }
        if (!formData.account_number) {
          toast.error('Please enter Account Number');
          return;
        }
        if (formData.account_number.length == 100) {
          toast.error('International Account Number must be exactly 10 digits');
          return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
          toast.error('Please enter a valid amount');
          return;
        }
        return setStep(2);
      }
    }

    if (step === 1.5) {
      if (formData.confirm_name.trim().toLowerCase() !== recipient?.account_holder_name.toLowerCase()) {
        toast.error('Account name does not match');
        return;
      }
      return setStep(2);
    }

    setLoading(true);
    try {
      const response = await api.post('?action=internal_transfer', {
        receiver_account_number: formData.account_number,
        amount: formData.amount,
        narration: formData.narration,
        pin: formData.pin,
        transfer_type: transferType,
        bank_id: formData.bank_id,
        manual_bank_name: formData.manual_bank_name,
        manual_account_name: formData.manual_account_name,
        country: formData.country,
        swift_code: formData.swift_code,
        iban: formData.iban,
        transaction_type: formData.transaction_type,
        purpose: formData.purpose,
        otp: otp
      });
      if (response.data.status === 'success') {
        setStep(3);

        // Fire the receipt email in the background — don't block the success UI on it
        const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

        fetch('https://bluevult.com/api/sterlingbank/mail.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: loggedInUser.id,
            action: 'reciept',
            amount: formData.amount,
            sender_name: user?.full_name || '',
            sender_account: response.data.sender_account || '',
            recipient_name: transferType === 'internal' ? recipient?.account_holder_name : formData.manual_account_name,
            recipient_account: transferType === 'external' && formData.iban ? formData.iban : formData.account_number,
            reference: response.data.reference || '',
            created_at: response.data.created_at || new Date().toISOString(),
            narration: formData.narration || (transferType === 'internal' ? 'Internal Transfer' : 'International Transfer'),
            channel: transferType === 'internal' ? 'INTERNAL' : 'INTERNATIONAL',
            swift_code: formData.swift_code || '',
            iban: formData.iban || '',
            country: formData.country || '',
            manual_bank_name: formData.manual_bank_name || '',
          }),
        }).catch((err) => console.error('Receipt email failed to send:', err));

      } else if (response.data.status === 'otp_required') {
        toast.success(response.data.message || 'OTP sent successfully');
        sendOtpEmail();
        setStep(2.5);
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
        <h1 className="text-3xl font-bold text-chase-navy">
          {transferType === 'external' ? 'International Transfer' : 'Local Transfer'}
        </h1>
        <p className="text-gray-500">Transfer funds securely</p>
      </div>

      {/* Tabs at the top of the Transfer page */}
      {step === 1 && (
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 max-w-md mx-auto border border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => navigate('/transfer/send?type=internal')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all ${
              transferType === 'internal'
                ? 'bg-chase-blue text-white shadow-md'
                : 'text-gray-500 hover:text-chase-navy'
            }`}
          >
            Local Transfer
          </button>
          <button
            type="button"
            onClick={() => navigate('/transfer/send?type=external')}
            className={`flex-1 py-3 text-center text-sm font-bold rounded-xl transition-all ${
              transferType === 'external'
                ? 'bg-chase-blue text-white shadow-md'
                : 'text-gray-500 hover:text-chase-navy'
            }`}
          >
            International Transfer
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-chase-border shadow-lg p-8">
        {step === 1 && (
          <div className="space-y-8">
            {transferType === 'internal' && <BeneficiaryList onSelect={(acc) => handleResolve(acc)} />}

          <form onSubmit={handleSubmit} className="space-y-6">
            {transferType === 'external' && (
                <div className="space-y-4">
                    <Input
                        label="Bank Name"
                        placeholder="Full name of the receiving bank"
                        value={formData.manual_bank_name}
                        onChange={(e) => setFormData({...formData, manual_bank_name: e.target.value})}
                        required
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-chase-navy uppercase tracking-wider">Receiving Country</label>
                     <select 
  className="w-full px-4 py-3 bg-gray-50 border border-chase-border rounded-xl focus:ring-2 focus:ring-chase-blue focus:border-transparent transition-all outline-none"
  value={formData.country}
  onChange={(e) => setFormData({...formData, country: e.target.value})}
  required
>
  <option value="">-- Select Country --</option>
  {[
    "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
    "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
    "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
    "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
    "Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada",
    "Central African Republic","Chad","Chile","China","Colombia","Comoros",
    "Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus",
    "Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
    "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini",
    "Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany",
    "Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
    "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
    "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya",
    "Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho",
    "Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar",
    "Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands",
    "Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco",
    "Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia",
    "Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
    "North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
    "Palestine State","Panama","Papua New Guinea","Paraguay","Peru",
    "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
    "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines",
    "Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal",
    "Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia",
    "Solomon Islands","Somalia","South Africa","South Korea","South Sudan",
    "Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria",
    "Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga",
    "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
    "Uganda","Ukraine","United Arab Emirates","United Kingdom",
    "United States","Uruguay","Uzbekistan","Vanuatu","Vatican City",
    "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
  ].map(country => (
    <option key={country} value={country}>{country}</option>
  ))}
</select>
                    </div>

                    <Input
                        label="SWIFT / BIC Code"
                        placeholder="e.g. SCBLGB2L"
                        value={formData.swift_code}
                        onChange={(e) => setFormData({...formData, swift_code: e.target.value})}
                        required
                    />

                    <Input
                        label="IBAN"
                        placeholder="e.g. GB98 WEST 1234 5678 9012"
                        value={formData.iban}
                        onChange={(e) => setFormData({...formData, iban: e.target.value})}
                        required
                    />

                    <Input
                        label="Transaction Type"
                        value={formData.transaction_type}
                        readOnly
                        disabled
                        required
                    />

                    <Input
                        label="Purpose of Transfer"
                        placeholder="e.g. Business Services / Family Support"
                        value={formData.purpose}
                        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                        required
                    />
                </div>
            )}

            <div className="relative">
              <Input
                label={transferType === 'internal' ? "Local Account Number" : "International Account Number"}
                placeholder=" account number"
                value={formData.account_number}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 100);
                  setFormData({ ...formData, account_number: val });
                  if (val.length !== 100) handleResolve(val);
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

            {transferType === 'external' && (
                <Input
                    label="Account Name"
                    placeholder="Full name on the account"
                    
                    onChange={(e) => setFormData({...formData, manual_account_name: e.target.value})}
                    required
                />
            )}

            <Input
              label={`Amount (${localStorage.getItem('user_currency') || 'USD'})`}
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
            <Button 
                type="submit" 
                loading={loading} 
                disabled={
                    (transferType === 'internal' && !recipient) || 
                    (transferType === 'external' && (
                      !formData.manual_bank_name ||
                      !formData.manual_account_name ||
                      !formData.account_number ||
                      !formData.country ||
                      !formData.swift_code ||
                      !formData.amount ||
                      !formData.purpose
                    ))
                } 
                className="w-full"
            >
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
                    <p className="font-bold text-chase-navy">{transferType === 'internal' ? recipient?.account_holder_name : formData.manual_account_name}</p>
                    {transferType === 'external' && (
                        <p className="text-sm font-bold text-chase-blue">
                            {formData.manual_bank_name}
                        </p>
                    )}
                </div>
              </div>
              {transferType === 'external' && (
                <>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed border-chase-border">
                    <span className="text-gray-500">Receiving Country</span>
                    <span className="font-bold text-chase-navy">{formData.country}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">SWIFT / BIC Code</span>
                    <span className="font-mono font-bold text-chase-navy uppercase">{formData.swift_code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">IBAN</span>
                    <span className="font-mono font-bold text-chase-navy uppercase">{formData.iban}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Transaction Type</span>
                    <span className="font-bold text-chase-navy">{formData.transaction_type}</span>
                  </div>
                  {formData.purpose && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Purpose</span>
                      <span className="font-bold text-chase-navy">{formData.purpose}</span>
                    </div>
                  )}
                </>
              )}
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

        {step === 2.5 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-800 space-y-2">
              <p className="font-bold">Extra Security Verification</p>
              <p className="text-sm">We have sent a 6-digit One-Time Password (OTP) to your registered email address to authorize this transfer.</p>
            </div>

            <Input
              label="Enter 6-digit OTP Code"
              type="text"
              placeholder="••••••"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
            />

            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button type="submit" loading={loading} disabled={otp.length !== 6} className="flex-[2] w-full">Verify & Complete</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="text-center py-12 space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 size={80} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-chase-navy">Transfer Successful!</h2>
            <p className="text-gray-500">Your transfer of {formatUSD(formData.amount)} to {transferType === 'internal' ? recipient?.account_holder_name : formData.manual_account_name} has been completed.</p>
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