import React, { useRef } from 'react';
import { X, Download, Share2, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { formatUSD } from '../../utils/formatCurrency';
import Button from './Button';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReceiptModal = ({ transaction, onClose }) => {
  const receiptRef = useRef();

  const handleDownload = async () => {
    const canvas = await html2canvas(receiptRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`receipt-${transaction.reference}.pdf`);
  };

  const handleShareWhatsApp = () => {
    const text = `Transaction Receipt from NorthBridge Bank\n\nReference: ${transaction.reference}\nAmount: ${formatUSD(transaction.amount)}\nStatus: Successful\nDate: ${transaction.created_at}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Transaction Receipt</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="p-8" ref={receiptRef}>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black text-chase-navy tracking-tight">{formatUSD(transaction.amount)}</h2>
            <p className="text-green-600 font-bold uppercase text-xs mt-1 tracking-widest">Transaction Successful</p>
          </div>

          <div className="space-y-4 border-t border-dashed border-gray-200 pt-6">
            <ReceiptRow label="Transaction Type" value={transaction.type.toUpperCase()} />
            <ReceiptRow label="Channel" value={transaction.channel.replace('_', ' ').toUpperCase()} />
            <ReceiptRow label="Narration" value={transaction.narration} />
            <ReceiptRow label="Reference" value={transaction.reference} isMono />
            <ReceiptRow label="Date & Time" value={transaction.created_at} />
            <ReceiptRow label="Status" value="COMPLETED" isStatus />
          </div>

          <div className="mt-12 pt-6 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2 text-chase-blue font-bold mb-1">
              <ShieldCheck size={16} />
              <span className="text-sm">NorthBridge Bank Secure</span>
            </div>
            <p className="text-[10px] text-gray-400">© 2026 NorthBridge Banking Group. All rights reserved.</p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={handleDownload} className="w-full">
            <Download size={18} className="mr-2" /> PDF
          </Button>
          <Button onClick={handleShareWhatsApp} className="w-full bg-green-600 hover:bg-green-700 border-none">
            <Share2 size={18} className="mr-2" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
};

const ReceiptRow = ({ label, value, isMono, isStatus }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</span>
    <span className={`text-sm text-right font-semibold text-chase-navy ${isMono ? 'font-mono text-[10px]' : ''} ${isStatus ? 'text-green-600' : ''}`}>
      {value || 'N/A'}
    </span>
  </div>
);

export default ReceiptModal;
