import React, { useRef, useState } from 'react';
import { X, Download, Share2, ShieldCheck, ArrowDown, Loader } from 'lucide-react';
import { formatUSD } from '../../utils/formatCurrency';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ReceiptModal = ({ transaction, onClose }) => {
  const receiptRef = useRef();
  const [downloading, setDownloading] = useState(false);

  // ── Derived fields ──────────────────────────────────────────────────────────
  // For debits:  sender = own account, recipient = counterparty
  // For credits: sender = counterparty, recipient = own account
  // The PHP endpoint normalises all of this before sending, so we just read
  // the four fields directly.
  const senderName    = transaction.sender_name    || 'N/A';
  const senderAcct    = transaction.sender_account || null;
  const recipientName = transaction.recipient_name    || 'N/A';
  const recipientAcct = transaction.recipient_account || null;

  const maskAccount = (acct) => {
    if (!acct) return 'N/A';
    const last4 = acct.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  // ── PDF download ────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const el = receiptRef.current;
      const canvas = await html2canvas(el, {
        backgroundColor: '#fdf9f2',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });
      const imgData  = canvas.toDataURL('image/png');
      const pdf      = new jsPDF({ unit: 'px', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`receipt-${transaction.reference}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // ── WhatsApp share ──────────────────────────────────────────────────────────
  const handleShareWhatsApp = () => {
    const text = [
      'Transaction Receipt — Starling Crest Finance',
      '',
      `From : ${senderName} (${senderAcct || 'N/A'})`,
      `To   : ${recipientName} (${recipientAcct || 'N/A'})`,
      `Amt  : ${formatUSD(transaction.amount)}`,
      `Ref  : ${transaction.reference}`,
      `Date : ${transaction.created_at}`,
      `Status: Completed`,
    ].join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ── Styles (kept inline so html2canvas captures them) ──────────────────────
  const s = {
    navy:   '#0b2545',
    cream:  '#fdf9f2',
    tan:    '#f5f0e8',
    border: '#ddd3c0',
    muted:  '#8a7a6a',
    sub:    '#6a5e50',
    gold:   '#c9a84c',
    green:  '#2e7d32',
    darkGreen: '#1b5e20',
    lightGreen: '#e8f5e9',
    greenBorder: '#a5d6a7',
  };

  const rowLabelStyle = {
    fontSize: 8, color: s.muted, letterSpacing: '1.5px',
    padding: '2.5px 0', width: '38%', verticalAlign: 'top', paddingRight: 6,
  };
  const rowValStyle = (small = false) => ({
    fontSize: small ? 8 : 9, color: s.navy, fontWeight: 500,
    textAlign: 'right', padding: '2.5px 0', wordBreak: 'break-all',
  });

  return (
    // Backdrop — click outside to close
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Shell — stop clicks reaching backdrop */}
      <div
        className="w-80 flex flex-col relative"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close button — OUTSIDE receiptRef so it never appears in the PDF */}
        <button
          onClick={onClose}
          aria-label="Close receipt"
          style={{
            position: 'absolute', top: -36, right: 0, zIndex: 60,
            background: 'rgba(255,255,255,0.15)', border: 'none',
            borderRadius: '50%', width: 28, height: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={15} color="#fff" />
        </button>

        {/*
          receiptRef wraps the entire paper including torn edge + shadow
          so html2canvas captures the complete receipt — not just the viewport.
          Action buttons are outside so they don't appear in the PDF.
        */}
        <div ref={receiptRef} style={{ background: s.cream }}>

          {/* ── Receipt paper ── */}
          <div className="relative overflow-hidden" style={{ background: s.cream }}>

            {/* Watermark */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                justifyContent: 'space-around', alignItems: 'center',
                pointerEvents: 'none', zIndex: 0, overflow: 'hidden',
              }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} style={{
                  whiteSpace: 'nowrap',
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '15px', fontWeight: 700,
                  color: 'rgba(11,37,69,0.052)',
                  letterSpacing: '4px',
                  transform: 'rotate(-30deg)',
                  padding: '6px 0', userSelect: 'none',
                }}>
                   Starling Crest Finance &nbsp;&nbsp; Starling Crest Finance &nbsp;&nbsp; Starling Crest Finance
                </span>
              ))}
            </div>

            {/* ── Header ── */}
            <div className="relative z-10 text-center px-5 pt-4 pb-3" style={{ background: s.navy }}>
              {/* Zigzag edge */}
              <div style={{
                position: 'absolute', bottom: '-8px', left: 0, right: 0,
                height: '8px', background: s.navy, zIndex: 2,
                clipPath: 'polygon(0 0,100% 0,100% 100%,97% 30%,94% 100%,91% 30%,88% 100%,85% 30%,82% 100%,79% 30%,76% 100%,73% 30%,70% 100%,67% 30%,64% 100%,61% 30%,58% 100%,55% 30%,52% 100%,49% 30%,46% 100%,43% 30%,40% 100%,37% 30%,34% 100%,31% 30%,28% 100%,25% 30%,22% 100%,19% 30%,16% 100%,13% 30%,10% 100%,7% 30%,4% 100%,0 30%)',
              }} />
              <div className="flex items-center justify-center gap-2 mb-1">
                {['N', 'B'].map((l, i) => (
                  <React.Fragment key={i}>
                    {i === 1 && (
                      <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 14, fontWeight: 700,
                        letterSpacing: '2.5px', color: '#fff',
                      }}>Starling Crest Finance</span>
                    )}
                    <div style={{
                      width: 22, height: 22, border: '1.5px solid rgba(255,255,255,0.45)',
                      borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 10, fontWeight: 700, color: s.gold,
                    }}>{l}</div>
                  </React.Fragment>
                ))}
              </div>
              <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', letterSpacing: '3px' }}>
                BANK &nbsp;·&nbsp; SECURE TRANSFER RECEIPT
              </p>
            </div>

            {/* ── Body ── */}
            <div className="relative z-10 px-5 pt-6 pb-4">

              {/* Amount stamp */}
              <div className="text-center mb-4 rounded-sm px-3 py-2"
                style={{ background: s.lightGreen, border: `1px solid ${s.greenBorder}` }}>
                <p style={{ fontSize: 8, color: s.darkGreen, letterSpacing: '2px', marginBottom: 3 }}>
                  TRANSACTION SUCCESSFUL
                </p>
                <p style={{ fontSize: 22, fontWeight: 600, color: s.navy, letterSpacing: '-0.5px' }}>
                  {formatUSD(transaction.amount)}
                </p>
                <p style={{ fontSize: 8, color: s.green, letterSpacing: '3px', fontWeight: 500 }}>
                  ✓ &nbsp;PAYMENT CONFIRMED
                </p>
              </div>

              {/* ── Transfer route ── */}
              <p style={{ fontSize: 7.5, color: s.muted, letterSpacing: '2.5px', marginBottom: 6 }}>
                TRANSFER ROUTE
              </p>
              <div className="rounded-sm px-3 py-3 mb-3"
                style={{ background: s.tan, border: `1px solid ${s.border}` }}>

                {/* Sender */}
                <p style={{ fontSize: 8, color: s.muted, letterSpacing: '1.5px', marginBottom: 2 }}>
                  FROM ACCOUNT
                </p>
                <p style={{ fontSize: 11, fontWeight: 600, color: s.navy }}>
                  {senderName}
                </p>
                <p style={{ fontSize: 8.5, color: s.sub }}>
                  {maskAccount(senderAcct)}
                </p>

                {/* Arrow */}
                <div className="flex items-center my-2 gap-2">
                  <div style={{ flex: 1, borderTop: '1px dashed #c9b99a' }} />
                  <ArrowDown size={13} style={{ color: s.muted }} />
                  <div style={{ flex: 1, borderTop: '1px dashed #c9b99a' }} />
                </div>

                {/* Recipient */}
                <p style={{ fontSize: 8, color: s.muted, letterSpacing: '1.5px', marginBottom: 2 }}>
                  TO ACCOUNT
                </p>
                <p style={{ fontSize: 11, fontWeight: 600, color: s.navy }}>
                  {recipientName}
                </p>
                <p style={{ fontSize: 8.5, color: s.sub }}>
                  {maskAccount(recipientAcct)}
                </p>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px dashed #c9b99a', margin: '10px 0' }} />

              {/* Transaction detail rows */}
              <p style={{ fontSize: 7.5, color: s.muted, letterSpacing: '2.5px', marginBottom: 6 }}>
                TRANSACTION DETAILS
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {[
                    ['TYPE',      (transaction.type    || 'TRANSFER').toUpperCase()],
                    ['CHANNEL',   (transaction.channel || 'INTERNAL').replace(/_/g, ' ').toUpperCase()],
                    ['NARRATION', transaction.narration || 'N/A'],
                    ['REF NO.',   transaction.reference],
                    ['DATE',      transaction.created_at],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td style={rowLabelStyle}>{label}</td>
                      <td style={rowValStyle(label === 'REF NO.')}>{value || 'N/A'}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={rowLabelStyle}>STATUS</td>
                    <td style={{ ...rowValStyle(), color: s.green, letterSpacing: '1px' }}>
                      ✓ COMPLETED
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ borderTop: '1px dashed #c9b99a', margin: '10px 0' }} />

              <p style={{ textAlign: 'center', fontSize: 7.5, color: '#a09080', letterSpacing: '1.5px', lineHeight: 1.6 }}>
                THIS RECEIPT IS SYSTEM GENERATED<br />NO SIGNATURE REQUIRED
              </p>
            </div>

            {/* Perforation strip */}
            <div style={{
              height: 12, position: 'relative', zIndex: 1,
              background: 'repeating-linear-gradient(90deg,#0b2545 0,#0b2545 6px,#fdf9f2 6px,#fdf9f2 12px)',
              opacity: 0.15,
            }} />

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-2" style={{ background: s.navy }}>
              <span style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '1px' }}>
                <ShieldCheck size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                NBB SECURE
              </span>
              <span style={{ fontSize: 7.5, color: s.gold, letterSpacing: '1px' }}>
                Starling Crest Finance
              </span>
            </div>
          </div>

          {/* Torn bottom edge */}
          <div style={{
            height: 14, background: s.cream, marginTop: -1,
            clipPath: 'polygon(0 0,2% 100%,4% 30%,6% 100%,8% 20%,10% 100%,12% 40%,14% 100%,16% 25%,18% 100%,20% 35%,22% 100%,24% 15%,26% 100%,28% 40%,30% 100%,32% 20%,34% 100%,36% 30%,38% 100%,40% 10%,42% 100%,44% 35%,46% 100%,48% 25%,50% 100%,52% 40%,54% 100%,56% 20%,58% 100%,60% 30%,62% 100%,64% 15%,66% 100%,68% 40%,70% 100%,72% 25%,74% 100%,76% 35%,78% 100%,80% 10%,82% 100%,84% 30%,86% 100%,88% 20%,90% 100%,92% 40%,94% 100%,96% 25%,98% 100%,100% 35%,100% 0)',
          }} />

          {/* Shadow strip */}
          <div style={{ height: 6, background: '#d0c8b8', borderRadius: '0 0 3px 3px' }} />

        </div> {/* end receiptRef */}

        {/* ── Action buttons (not captured in PDF) ── */}
        <div
          className="grid grid-cols-2 gap-2 p-4"
          style={{ background: '#f0ebe0', borderTop: '1px solid #ddd3c0' }}
        >
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center gap-1.5 rounded-sm py-2 text-xs font-semibold"
            style={{
              background: '#e0d9ce', color: '#5a4e3e',
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '1.5px', border: 'none',
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.7 : 1,
            }}
          >
            {downloading
              ? <><Loader size={13} className="animate-spin" /> SAVING...</>
              : <><Download size={13} /> PDF</>
            }
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-1.5 rounded-sm py-2 text-xs font-semibold"
            style={{
              background: s.navy, color: '#fff',
              fontFamily: "'IBM Plex Mono', monospace",
              letterSpacing: '1.5px', border: 'none', cursor: 'pointer',
            }}
          >
            <Share2 size={13} /> SHARE
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReceiptModal;