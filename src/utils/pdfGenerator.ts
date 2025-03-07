import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { errorService, ErrorSeverity, ErrorSource } from '../services/ErrorService';
import type { Transaction } from '../types';

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
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
  }

  private addLogo(): void {
    // In a real app, you would add a logo here
    this.doc.setFontSize(24);
    this.doc.text('Mahanaim Money', this.pageWidth / 2, 20, { align: 'center' });
  }

  private addHeader(title: string, subtitle?: string): void {
    const startY = 30;

    this.doc.setFontSize(18);
    this.doc.text(title, this.pageWidth / 2, startY, { align: 'center' });

    if (subtitle) {
      this.doc.setFontSize(14);
      this.doc.text(subtitle, this.pageWidth / 2, startY + 10, { align: 'center' });
    }
  }

  private addTransactionDetails(transaction: Transaction): void {
    const startY = 50;

    // Basic details
    this.doc.setFontSize(12);
    this.doc.text('Transaction Details', this.margin, startY);

    const basicDetails = [
      ['ID:', transaction.id],
      ['Description:', transaction.description || 'N/A'],
      ['Status:', transaction.status],
      ['Type:', transaction.type],
    ];

    (this.doc as any).autoTable({
      startY: startY + 5,
      head: [],
      body: basicDetails,
      theme: 'plain',
      margin: { left: this.margin },
      tableWidth: 'auto',
    });

    // Amount details
    const amountDetails = [
      ['Amount:', `${transaction.currency} ${transaction.amount}`],
    ];

    // Add fees if they exist
    if (transaction.fees && transaction.fees.length > 0) {
      let totalFees = 0;
      transaction.fees.forEach(fee => {
        if (typeof fee === 'number') {
          totalFees += fee;
        }
      });
      amountDetails.push(['Fees:', `${transaction.currency} ${totalFees}`]);
    }

    (this.doc as any).autoTable({
      startY: (this.doc as any).lastAutoTable.finalY + 10,
      head: [],
      body: amountDetails,
      theme: 'plain',
      margin: { left: this.margin },
      tableWidth: 'auto',
    });

    // Metadata
    if (transaction.metadata) {
      this.doc.setFontSize(12);
      this.doc.text('Metadata', this.margin, (this.doc as any).lastAutoTable.finalY + 20);

      const metadataEntries = Object.entries(transaction.metadata).map(([key, value]) => {
        return [key, typeof value === 'object' ? JSON.stringify(value) : String(value)];
      });

      if (metadataEntries.length > 0) {
        (this.doc as any).autoTable({
          startY: (this.doc as any).lastAutoTable.finalY + 25,
          head: [],
          body: metadataEntries,
          theme: 'plain',
          margin: { left: this.margin },
          tableWidth: 'auto',
        });
      }
    }

    // Date information
    const dateInfo = [
      ['Created:', new Date(transaction.createdAt).toLocaleString()],
    ];

    (this.doc as any).autoTable({
      startY: (this.doc as any).lastAutoTable.finalY + 20,
      head: [],
      body: dateInfo,
      theme: 'plain',
      margin: { left: this.margin },
      tableWidth: 'auto',
    });
  }

  private addFooter(): void {
    const footerText = `Generated on ${new Date().toLocaleString()}`;
    this.doc.setFontSize(10);
    this.doc.text(footerText, this.pageWidth / 2, this.pageHeight - 10, { align: 'center' });
  }

  public generateTransactionPDF(transaction: Transaction, options: PDFOptions = {}): jsPDF {
    const { title = 'Transaction Receipt', subtitle, showLogo = true, showFooter = true } = options;

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

export async function generateTransactionPDF(transaction: Transaction): Promise<Blob> {
  try {
    // Create a simple text representation of the transaction
    const transactionText = `
      Transaction Details
      ------------------
      ID: ${transaction.id}
      Description: ${transaction.description || 'N/A'}
      Amount: ${transaction.currency} ${transaction.amount}
      Date: ${new Date(transaction.createdAt).toLocaleDateString()}
      Status: ${transaction.status}
      Type: ${transaction.type}
      
      Metadata: ${JSON.stringify(transaction.metadata || {}, null, 2)}
    `;

    // Convert the text to a Blob (in a real implementation, this would be a PDF)
    const blob = new Blob([transactionText], { type: 'application/pdf' });

    return blob;
  } catch (error) {
    errorService.handleError(
      error instanceof Error ? error : new Error('Failed to generate PDF'),
      ErrorSource.SYSTEM,
      ErrorSeverity.ERROR,
      { showNotification: true }
    );
    throw error;
  }
}

export async function downloadTransactionPDF(transaction: Transaction): Promise<void> {
  try {
    const pdfBlob = await generateTransactionPDF(transaction);

    // Create a download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');

    // Set link properties
    link.href = url;
    link.download = `transaction-${transaction.id}.pdf`;

    // Append to body, click, and clean up
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the object URL
    URL.revokeObjectURL(url);
  } catch (error) {
    errorService.handleError(
      error instanceof Error ? error : new Error('Failed to download PDF'),
      ErrorSource.SYSTEM,
      ErrorSeverity.ERROR,
      { showNotification: true }
    );
  }
}
