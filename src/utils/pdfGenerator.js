import jsPDF from 'jspdf';
import 'jspdf-autotable';

const CHASE_NAVY = [28, 25, 23]; // #1c1917
const CHASE_BLUE = [254, 130, 14]; // #fe820e
const LIGHT_BLUE = [255, 247, 237]; // #fff7ed

export const generateStatement = (data) => {
  const { account, period, summary, transactions } = data;
  const doc = new jsPDF();

  // Header
  doc.setFillColor(...CHASE_NAVY);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Starling Crest Finance', 15, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Account Statement', 15, 33);

  // Account Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Account Holder:', 15, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(account.fullName, 15, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Account Number:', 15, 72);
  doc.setFont('helvetica', 'normal');
  doc.text(account.accountNumber, 15, 79);

  doc.setFont('helvetica', 'bold');
  doc.text('Statement Period:', 130, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`${period.from} to ${period.to}`, 130, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Currency:', 130, 72);
  doc.setFont('helvetica', 'normal');
  doc.text('GBP', 130, 79);

  // Summary Table
  doc.autoTable({
    startY: 90,
    head: [['Opening Balance', 'Total Credits', 'Total Debits', 'Closing Balance']],
    body: [[
      `£${summary.openingBalance.toLocaleString()}`,
      `£${summary.totalCredits.toLocaleString()}`,
      `£${summary.totalDebits.toLocaleString()}`,
      `£${summary.closingBalance.toLocaleString()}`
    ]],
    headStyles: { fillColor: CHASE_BLUE, textColor: 255 },
    styles: { halign: 'center', fontSize: 10 },
  });

  // Transactions Table
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', 15, doc.lastAutoTable.finalY + 15);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Date', 'Description', 'Reference', 'Type', 'Amount', 'Balance']],
    body: transactions.map(t => [
      t.date,
      t.narration,
      t.reference,
      t.type.toUpperCase(),
      { content: `£${t.amount.toLocaleString()}`, styles: { textColor: t.type === 'credit' ? [22, 101, 52] : [185, 28, 28] } },
      `£${t.balance_after.toLocaleString()}`
    ]),
    headStyles: { fillColor: CHASE_NAVY, textColor: 255 },
    alternateRowStyles: { fillColor: LIGHT_BLUE },
    styles: { fontSize: 9 },
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      'This is a computer-generated statement and requires no signature.',
      105,
      285,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${pageCount}`, 195, 285, { align: 'right' });
  }

  doc.save(`Starling Crest Finance_Statement_${account.accountNumber}_${period.to}.pdf`);
};
