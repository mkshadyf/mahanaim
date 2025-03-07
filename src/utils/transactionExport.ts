import { errorService, ErrorSeverity, ErrorSource } from '../services/ErrorService';
import type { Transaction } from '../types';

/**
 * Format a date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format an amount with currency
 */
function formatAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

/**
 * Generate a text representation of a transaction
 */
export function generateTransactionText(transaction: Transaction): string {
  return `
    Transaction Details
    ------------------
    ID: ${transaction.id}
    Description: ${transaction.description || 'N/A'}
    Amount: ${formatAmount(transaction.amount, transaction.currency)}
    Date: ${formatDate(transaction.createdAt)}
    Status: ${transaction.status}
    Type: ${transaction.type}
  `;
}

/**
 * Download a transaction as a text file
 */
export async function downloadTransactionAsText(transaction: Transaction): Promise<void> {
  try {
    const transactionText = generateTransactionText(transaction);

    // Create a Blob and download it
    const blob = new Blob([transactionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transaction-${transaction.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    errorService.handleError(
      error instanceof Error ? error : new Error('Failed to download transaction'),
      ErrorSource.SYSTEM,
      ErrorSeverity.ERROR,
      { showNotification: true }
    );
  }
} 