import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// Define proper types for jsPDF with autoTable
interface AutoTableOptions {
  startY: number;
  head: string[][];
  body: string[][];
  theme: 'grid' | 'striped' | 'plain';
  styles: {
    fontSize: number;
  };
  headStyles: {
    fillColor: number[];
  };
}

interface JsPDFWithAutoTable extends jsPDF {
  autoTable: (options: AutoTableOptions) => void;
  lastAutoTable: {
    finalY: number;
  };
}

interface ReportData {
  shopName: string;
  date: Date;
  balances: {
    mpesa: { usd: number; fc: number };
    airtel: { usd: number; fc: number };
    vodacom: { usd: number };
    mv: { usd: number };
    cash: { usd: number; fc: number };
  };
  transactions: {
    send: { usd: number; fc: number };
    receive: { usd: number; fc: number };
  };
  totals: {
    balanceUSD: number;
    balanceFC: number;
    transactionsUSD: number;
    transactionsFC: number;
  };
}

export const generateDailyReport = (data: ReportData): JsPDFWithAutoTable => {
  const doc = new jsPDF() as JsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(20);
  doc.text('Mahanaim Money', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.text('Rapport Journalier', pageWidth / 2, 30, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Magasin: ${data.shopName}`, 20, 45);
  doc.text(`Date: ${format(data.date, 'PPP', { locale: fr })}`, 20, 55);

  // Electronic Money Balances
  doc.setFontSize(14);
  doc.text('Soldes Électroniques', 20, 70);

  const balanceData = [
    ['Service', 'USD', 'FC'],
    ['M-Pesa', data.balances.mpesa.usd.toFixed(2), data.balances.mpesa.fc.toLocaleString()],
    ['Airtel', data.balances.airtel.usd.toFixed(2), data.balances.airtel.fc.toLocaleString()],
    ['Vodacom', data.balances.vodacom.usd.toFixed(2), '-'],
    ['MV', data.balances.mv.usd.toFixed(2), '-'],
  ];

  doc.autoTable({
    startY: 75,
    head: [balanceData[0]],
    body: balanceData.slice(1),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Cash Balances
  doc.setFontSize(14);
  doc.text('Soldes en Espèces', 20, doc.lastAutoTable.finalY + 20);

  const cashData = [
    ['Type', 'USD', 'FC'],
    ['Espèces', data.balances.cash.usd.toFixed(2), data.balances.cash.fc.toLocaleString()],
  ];

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 25,
    head: [cashData[0]],
    body: cashData.slice(1),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Transactions
  doc.setFontSize(14);
  doc.text('Transactions', 20, doc.lastAutoTable.finalY + 20);

  const transactionData = [
    ['Type', 'USD', 'FC'],
    ['Envois', data.transactions.send.usd.toFixed(2), data.transactions.send.fc.toLocaleString()],
    [
      'Réceptions',
      data.transactions.receive.usd.toFixed(2),
      data.transactions.receive.fc.toLocaleString(),
    ],
  ];

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 25,
    head: [transactionData[0]],
    body: transactionData.slice(1),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Totals
  doc.setFontSize(14);
  doc.text('Totaux', 20, doc.lastAutoTable.finalY + 20);

  const totalsData = [
    ['Catégorie', 'USD', 'FC'],
    ['Solde Total', data.totals.balanceUSD.toFixed(2), data.totals.balanceFC.toLocaleString()],
    [
      'Total Transactions',
      data.totals.transactionsUSD.toFixed(2),
      data.totals.transactionsFC.toLocaleString(),
    ],
  ];

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 25,
    head: [totalsData[0]],
    body: totalsData.slice(1),
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] },
  });

  // Footer
  const today = new Date();
  doc.setFontSize(10);
  doc.text(
    `Généré le ${format(today, 'PPp', { locale: fr })}`,
    pageWidth / 2,
    doc.lastAutoTable.finalY + 20,
    { align: 'center' }
  );

  return doc;
};
