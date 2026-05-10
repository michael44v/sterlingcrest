import React, { useState, useEffect } from 'react';
import { Lock, TrendingUp, Calendar, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import api from '../../api/axios';
import { formatUSD } from '../../utils/formatCurrency';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';

const FixedDeposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [amount, setAmount] = useState('');
  const [tenor, setTenor] = useState('30');
  const [pin, setPin] = useState('');

  const tenors = [
    { days: 30, rate: 3.0, label: '30 Days' },
    { days: 90, rate: 4.5, label: '90 Days' },
    { days: 180, rate: 5.5, label: '180 Days' },
    { days: 365, rate: 7.0, label: '365 Days' },
  ];

  const fetchDeposits = async () => {
    try {
      const response = await api.get('?action=get_fixed_deposits');
      if (response.data.status === 'success') {
        setDeposits(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch fixed deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!amount || !pin) return toast.error('Please fill all fields');

    setCreating(true);
    try {
      const response = await api.post('?action=create_fixed_deposit', {
        amount: parseFloat(amount),
        tenor_days: parseInt(tenor),
        pin
      });

      if (response.data.status === 'success') {
        toast.success('Fixed deposit created successfully!');
        setShowForm(false);
        setAmount('');
        setPin('');
        fetchDeposits();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setCreating(false);
    }
  };

  const calculateInterest = () => {
    if (!amount) return 0;
    const rate = tenors.find(t => t.days.toString() === tenor).rate / 100;
    return (parseFloat(amount) * rate * (parseInt(tenor) / 365)).toFixed(2);
  };

  if (loading) return <div className="p-8 text-center">Loading fixed deposits...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-chase-navy">Fixed Deposits</h1>
          <p className="text-gray-500">Lock your USD and earn guaranteed interest</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Lock className="w-4 h-4 mr-2" />
            New Fixed Deposit
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-chase-border p-8 shadow-sm animate-fade-in">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-chase-navy">Create Fixed Deposit</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">Cancel</button>
          </div>

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Input
                label="Amount to Lock (USD)"
                type="number"
                placeholder="Minimum $100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Tenor</label>
                <div className="grid grid-cols-2 gap-3">
                  {tenors.map((t) => (
                    <button
                      key={t.days}
                      type="button"
                      onClick={() => setTenor(t.days.toString())}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        tenor === t.days.toString()
                          ? 'border-chase-blue bg-chase-light ring-1 ring-chase-blue'
                          : 'border-gray-200 hover:border-chase-blue hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-bold text-chase-navy">{t.label}</p>
                      <p className="text-xs text-chase-blue font-semibold">{t.rate}% p.a.</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-chase-navy flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-chase-blue" />
                Investment Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Principal Amount</span>
                  <span className="font-semibold text-chase-navy">${parseFloat(amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Annual Interest Rate</span>
                  <span className="font-semibold text-chase-blue">{tenors.find(t => t.days.toString() === tenor).rate}%</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Maturity Date</span>
                  <span className="font-semibold text-chase-navy">
                    {new Date(Date.now() + parseInt(tenor) * 86400000).toLocaleDateString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-chase-navy">Projected Interest</span>
                  <span className="text-lg font-bold text-green-600">+${calculateInterest()}</span>
                </div>
              </div>

              <div className="pt-4">
                <Input
                  label="Transaction PIN"
                  type="password"
                  maxLength={4}
                  placeholder="****"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
                <p className="text-[10px] text-gray-400 mt-2 italic flex items-center">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Your funds will be locked until the maturity date.
                </p>
              </div>

              <Button type="submit" className="w-full" loading={creating}>
                Confirm Investment
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-chase-navy">Your Fixed Deposits</h2>
        {deposits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deposits.map((fd) => (
              <div key={fd.id} className="bg-white p-6 rounded-2xl border border-chase-border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-chase-light rounded-lg">
                    <Lock className="w-5 h-5 text-chase-blue" />
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                    fd.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {fd.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-chase-navy mb-1">${parseFloat(fd.principal).toLocaleString()}</p>
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                  <span>{fd.rate}% Annual Interest</span>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-50">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Start Date</span>
                    <span className="text-chase-navy font-medium">{fd.start_date}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Maturity Date</span>
                    <span className="text-chase-navy font-medium">{fd.maturity_date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 italic">No active fixed deposits found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FixedDeposits;
