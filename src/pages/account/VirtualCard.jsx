import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import VirtualCardUI from '../../components/cards/VirtualCardUI';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Lock, Unlock, Settings2, Plus, CreditCard, ShieldCheck } from 'lucide-react';

const VirtualCardPage = () => {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [pin, setPin] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCard();
  }, []);

  const fetchCard = async () => {
    setLoading(true);
    try {
      const response = await api.get('?action=get_card_details_basic');
      if (response.data.status === 'success') {
        setCard(response.data.data);
      } else {
        setCard(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
    setCreating(true);
    try {
      const response = await api.post('?action=create_virtual_card');
      if (response.data.status === 'success') {
        toast.success('Virtual card issued successfully!');
        fetchCard();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to create card');
    } finally {
      setCreating(false);
    }
  };

  const handleReveal = async () => {
    if (!pin) return toast.error('Please enter your transaction PIN');
    setLoading(true);
    try {
      const response = await api.post('?action=get_card_details', { pin });
      if (response.data.status === 'success') {
        setCard(response.data.data);
        setRevealed(true);
        setShowPinModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Reveal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async () => {
    try {
      const response = await api.post('?action=freeze_card');
      if (response.data.status === 'success') {
        const newStatus = card.status === 'active' ? 'frozen' : 'active';
        setCard({ ...card, status: newStatus });
        toast.success(`Card ${newStatus}`);
      }
    } catch (error) {
      toast.error('Action failed');
    }
  };

  if (loading && !card) return <div className="p-8 text-center text-gray-500 italic">Loading your card details...</div>;

  if (!card) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-8">
        <div className="w-24 h-24 bg-chase-light text-chase-blue rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CreditCard size={48} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-chase-navy">Virtual USD Visa</h1>
          <p className="text-gray-500 mt-2">Get an instant virtual card for secure online global payments.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-chase-border shadow-lg space-y-6 text-left">
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ShieldCheck size={20}/></div>
            <div>
              <p className="font-bold text-chase-navy">Safe & Secure</p>
              <p className="text-sm text-gray-500">Protect your main account balance with isolated card funding.</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Plus size={20}/></div>
            <div>
              <p className="font-bold text-chase-navy">Instant Issuance</p>
              <p className="text-sm text-gray-500">Your card is ready for use immediately after creation.</p>
            </div>
          </div>

          <Button onClick={handleCreateCard} loading={creating} className="w-full py-4 text-lg font-bold">
            Create Virtual Card
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-chase-navy">Virtual USD Card</h1>
        <p className="text-gray-500">Secure online payments anywhere Visa is accepted</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="space-y-6">
          <VirtualCardUI
            card={card}
            revealed={revealed}
          />

          <div className="flex gap-4">
            <Button
              variant={revealed ? 'secondary' : 'primary'}
              className="flex-1"
              onClick={() => revealed ? setRevealed(false) : setShowPinModal(true)}
            >
              {revealed ? 'Hide Details' : 'Reveal Details'}
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={handleFreeze}
            >
              {card?.status === 'active' ? <><Lock size={18} className="mr-2"/> Freeze</> : <><Unlock size={18} className="mr-2"/> Unfreeze</>}
            </Button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-chase-border shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-chase-navy flex items-center gap-2">
            <Settings2 size={24} className="text-chase-blue" />
            Card Controls
          </h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border border-chase-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div>
                <p className="font-bold text-chase-navy">Spending Limit</p>
                <p className="text-sm text-gray-500">Currently $1,000.00 daily</p>
              </div>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>

            <div className="flex justify-between items-center p-4 border border-chase-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <div>
                <p className="font-bold text-chase-navy">International Use</p>
                <p className="text-sm text-gray-500">Enabled worldwide</p>
              </div>
              <div className="w-12 h-6 bg-green-500 rounded-full relative">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border border-chase-border rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-red-600">
              <div>
                <p className="font-bold">Terminate Card</p>
                <p className="text-sm opacity-70">Permanently block and delete</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-bold text-chase-navy text-center mb-6">Enter Transaction PIN</h2>
            <div className="space-y-6">
              <Input
                type="password"
                placeholder="••••"
                maxLength="4"
                className="text-center text-2xl tracking-[1em]"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
              />
              <div className="flex gap-4">
                <Button variant="secondary" className="flex-1" onClick={() => setShowPinModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleReveal} loading={loading}>Confirm</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualCardPage;
