import type { Transaction } from '@/types/transaction';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PDFOptions {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  showFooter?: boolean;
}

export class TransactionPDFGenerator {
  private doc: jsPDF;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly margin = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private addLogo(): void {
    // Add your logo implementation here
    // Example:
    // this.doc.addImage(logoData, 'PNG', this.margin, this.margin, 40, 40);
  }

  private addHeader(title: string, subtitle?: string): void {
    const titleY = this.margin + (subtitle ? 10 : 20);

    this.doc.setFontSize(20);
    this.doc.text(title, this.pageWidth / 2, titleY, { align: 'center' });

    if (subtitle) {
      this.doc.setFontSize(12);
      this.doc.text(subtitle, this.pageWidth / 2, titleY + 10, { align: 'center' });
    }
  }

  private addTransactionDetails(transaction: Transaction): void {
    const startY = this.margin + 40;

    this.doc.setFontSize(12);
    this.doc.text('Transaction Details', this.margin, startY);

    this.doc.setFontSize(10);
    this.doc.text('Transaction ID:', this.margin, startY + 10);
    this.doc.text(transaction.id, this.margin + 60, startY + 10);

    this.doc.setFontSize(10);
    this.doc.text('Status:', this.margin, startY + 20);
    this.doc.text(transaction.status.toUpperCase(), this.margin + 60, startY + 20);

    // Amount Details
    this.doc.setFontSize(12);
    this.doc.text('Amount Details', this.margin, startY + 40);

    const amountDetails = [
      ['Amount:', `${transaction.amount.currency} ${transaction.amount.amount.toLocaleString()}`],
      ['Fees:', `${transaction.fees.total.currency} ${transaction.fees.total.amount.toLocaleString()}`],
      ['Exchange Rate:', transaction.exchangeRate ? `1 USD = ${transaction.exchangeRate} FC` : 'N/A'],
    ];

    (this.doc as any).autoTable({
      startY: startY + 45,
      head: [],
      body: amountDetails,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 100 },
      },
    });

    // Party Details
    this.doc.setFontSize(12);
    this.doc.text('Party Details', this.margin, startY + 90);

    const partyDetails = [
      ['Sender:', transaction.sender.name],
      ['Sender Type:', transaction.sender.type],
      ['Receiver:', transaction.receiver.name],
      ['Receiver Type:', transaction.receiver.type],
      ['Contact:', transaction.receiver.contact || 'N/A'],
    ];

    (this.doc as any).autoTable({
      startY: startY + 95,
      head: [],
      body: partyDetails,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 100 },
      },
    });

    // Timestamps
    this.doc.setFontSize(12);
    this.doc.text('Timestamps', this.margin, startY + 150);

    const timestamps = [
      ['Created:', transaction.timestamps.created.toDate().toLocaleString()],
      ['Updated:', transaction.timestamps.updated.toDate().toLocaleString()],
      ['Completed:', transaction.timestamps.completed?.toDate().toLocaleString() || 'N/A'],
    ];

    (this.doc as any).autoTable({
      startY: startY + 155,
      head: [],
      body: timestamps,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 100 },
      },
    });

    // Notes
    if (transaction.notes) {
      this.doc.setFontSize(12);
      this.doc.text('Notes', this.margin, startY + 200);

      const notes = [[transaction.notes]];

      (this.doc as any).autoTable({
        startY: startY + 205,
        head: [],
        body: notes,
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: this.pageWidth - this.margin * 2 },
        },
      });
    }
  }

  private addFooter(): void {
    this.doc.setFontSize(8);
    const footerText = `Generated on ${new Date().toLocaleString()}`;
    this.doc.text(footerText, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }

  public generateTransactionPDF(transaction: Transaction, options: PDFOptions = {}): jsPDF {
    const {
      title = 'Transaction Receipt',
      subtitle,
      showLogo = true,
      showFooter = true,
    } = options;

    if (showLogo) {
      this.addLogo();
    }

    this.addHeader(title, subtitle);
    this.addTransactionDetails(transaction);

    if (showFooter) {
      this.addFooter();
    }

    return this.doc;
  }

  public save(filename: string = 'transaction.pdf'): void {
    this.doc.save(filename);
  }
}
