import {
  addDoc,
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where
} from 'firebase/firestore';
import type {
  CurrencyCode,
  Transaction,
  TransactionFee,
  TransactionInput,
  TransactionStats,
  ValidationResult
} from '../types';
import { TransactionStatus, TransactionType } from '../types';
import { errorService, ErrorSeverity, ErrorSource } from './ErrorService';

// Define a more flexible input type that can handle both basic and extended inputs
interface FlexibleTransactionInput extends TransactionInput {
  sender?: {
    id?: string;
    name: string;
    type: string;
    [key: string]: any;
  };
  receiver?: {
    id?: string;
    name: string;
    type: string;
    [key: string]: any;
  };
  agent?: {
    id?: string;
    type: string;
    name: string;
    [key: string]: any;
  };
  notes?: string;
  shopId?: string;
  metadata?: Record<string, any>;
}

export interface ExchangeRateService {
  getCurrentRate: (fromCurrency: CurrencyCode, toCurrency: CurrencyCode) => Promise<number>;
}

export class TransactionService {
  private readonly collectionName = 'transactions';

  constructor(
    private readonly db: Firestore,
    private readonly exchangeRateService?: ExchangeRateService
  ) { }

  async createTransaction(input: FlexibleTransactionInput): Promise<Transaction> {
    try {
      const validation = await this.validateTransaction(input);
      if (!validation.isValid) {
        const errorMessage = `Invalid transaction: ${validation.errors?.join(', ')}`;
        throw new Error(errorMessage);
      }

      let exchangeRate: number | undefined;

      // Get exchange rate if service is provided and currencies differ
      if (this.exchangeRateService && input.currency !== 'USD') {
        try {
          exchangeRate = await this.exchangeRateService.getCurrentRate(
            input.currency,
            'USD'
          );
        } catch (error) {
          // Log but don't fail the transaction
          errorService.handleError(
            error,
            ErrorSource.NETWORK,
            ErrorSeverity.WARNING,
            { operation: 'getExchangeRate', input }
          );
        }
      }

      // Calculate fees
      const fees: TransactionFee[] = [{
        amount: input.amount * 0.01, // 1% fee
        currency: input.currency,
        description: 'Processing fee'
      }];

      // Create transaction object
      const transaction: Omit<Transaction, 'id'> = {
        type: input.type,
        status: TransactionStatus.PENDING,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fees,
        metadata: {}
      };

      // Add extended properties if available
      if (input.sender) {
        (transaction as any).sender = {
          ...input.sender,
          id: input.sender.id || crypto.randomUUID()
        };
      }

      if (input.receiver) {
        (transaction as any).receiver = {
          ...input.receiver,
          id: input.receiver.id || crypto.randomUUID()
        };
      }

      if (input.agent) {
        (transaction as any).agent = input.agent || {
          id: 'system',
          type: 'agent',
          name: 'System',
        };
      }

      if (input.notes) {
        (transaction as any).notes = input.notes;
      }

      if (input.shopId) {
        (transaction as any).shopId = input.shopId;
      }

      if (exchangeRate) {
        (transaction as any).exchangeRate = exchangeRate;
      }

      if (input.metadata) {
        transaction.metadata = {
          ...transaction.metadata,
          ...input.metadata
        };
      }

      const docRef = await addDoc(collection(this.db, this.collectionName), transaction);

      errorService.handleError(
        `Transaction created: ${docRef.id}`,
        ErrorSource.DATABASE,
        ErrorSeverity.INFO,
        { operation: 'createTransaction', input }
      );

      return {
        ...transaction,
        id: docRef.id
      } as Transaction;
    } catch (error) {
      errorService.handleError(
        error,
        ErrorSource.DATABASE,
        ErrorSeverity.ERROR,
        { operation: 'createTransaction' }
      );
      throw error;
    }
  }

  async validateTransaction(input: FlexibleTransactionInput): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic validation
      if (input.amount <= 0) {
        errors.push('Amount must be greater than 0');
      }

      // Extended validation if available
      if (input.sender && input.receiver) {
        if (!input.sender.name || !input.receiver.name) {
          errors.push('Sender and receiver names are required');
        }
      }

      if (input.shopId === '') {
        errors.push('Shop ID is required');
      }

      // Return validation result
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      errorService.handleError(
        error,
        ErrorSource.VALIDATION,
        ErrorSeverity.ERROR,
        { operation: 'validateTransaction', input }
      );
      return {
        isValid: false,
        errors: ['Validation error occurred']
      };
    }
  }


  async updateTransactionStatus(
    id: string,
    status: TransactionStatus
  ): Promise<void> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      await updateDoc(docRef, {
        status,
        updatedAt: Timestamp.now()
      });

      errorService.handleError(
        `Transaction ${id} status updated to ${status}`,
        ErrorSource.DATABASE,
        ErrorSeverity.INFO,
        { operation: 'updateTransactionStatus', id, status }
      );
    } catch (error) {
      errorService.handleError(
        error,
        ErrorSource.DATABASE,
        ErrorSeverity.ERROR
      );
      throw error;
    }
  }

  async getTransaction(id: string): Promise<Transaction | null> {
    try {
      const docRef = doc(this.db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      errorService.handleError(
        `Transaction ${id} retrieved`,
        ErrorSource.DATABASE,
        ErrorSeverity.INFO,
        { operation: 'getTransaction', id }
      );

      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Transaction;
    } catch (error) {
      errorService.handleError(
        error,
        ErrorSource.DATABASE,
        ErrorSeverity.ERROR
      );
      throw error;
    }
  }

  async getTransactionStats(
    type?: TransactionType,
    startDate?: Date,
    endDate?: Date,
    shopId?: string
  ): Promise<TransactionStats> {
    try {
      // Build query
      let q = query(collection(this.db, this.collectionName));

      if (type) {
        q = query(q, where('type', '==', type));
      }

      if (startDate) {
        q = query(q, where('createdAt', '>=', startDate));
      }

      if (endDate) {
        q = query(q, where('createdAt', '<=', endDate));
      }

      if (shopId) {
        q = query(q, where('shopId', '==', shopId));
      }

      // Get transactions
      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      querySnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as Transaction);
      });

      // Initialize stats
      const stats: TransactionStats = {
        count: transactions.length,
        totalAmount: {} as Record<CurrencyCode, number>,
        byType: {} as Record<TransactionType, number>,
        byStatus: {} as Record<TransactionStatus, number>,
        byCurrency: {} as Record<CurrencyCode, number>,
        volume: {} as Record<CurrencyCode, number>,
        fees: {} as Record<CurrencyCode, number>,
        success_rate: transactions.length > 0
          ? (transactions.filter(t => t.status === TransactionStatus.COMPLETED).length / transactions.length) * 100
          : 0
      };

      // Initialize currency records
      const currencies: CurrencyCode[] = ['USD', 'EUR', 'CDF'];
      currencies.forEach(currency => {
        stats.totalAmount[currency] = 0;
        stats.byCurrency[currency] = 0;
        if (stats.volume) stats.volume[currency] = 0;
        if (stats.fees) stats.fees[currency] = 0;
      });

      // Initialize type records
      Object.values(TransactionType).forEach(type => {
        stats.byType[type] = 0;
      });

      // Initialize status records
      Object.values(TransactionStatus).forEach(status => {
        stats.byStatus[status] = 0;
      });

      // Calculate stats
      transactions.forEach((t: Transaction) => {
        // Count by type
        stats.byType[t.type] = (stats.byType[t.type] || 0) + 1;

        // Count by status
        stats.byStatus[t.status] = (stats.byStatus[t.status] || 0) + 1;

        // Count by currency
        stats.byCurrency[t.currency] = (stats.byCurrency[t.currency] || 0) + 1;

        // Add to total amount
        stats.totalAmount[t.currency] = (stats.totalAmount[t.currency] || 0) + t.amount;

        // Add to volume
        if (stats.volume) {
          stats.volume[t.currency] = (stats.volume[t.currency] || 0) + t.amount;
        }

        // Add fees if available
        if (stats.fees && t.fees && t.fees.length > 0) {
          t.fees.forEach(fee => {
            if (stats.fees) {
              stats.fees[fee.currency] = (stats.fees[fee.currency] || 0) + fee.amount;
            }
          });
        }
      });

      errorService.handleError(
        `Retrieved stats for ${transactions.length} transactions`,
        ErrorSource.DATABASE,
        ErrorSeverity.INFO,
        { operation: 'getTransactionStats', type, startDate, endDate, shopId }
      );

      return stats;
    } catch (error) {
      errorService.handleError(
        error,
        ErrorSource.DATABASE,
        ErrorSeverity.ERROR
      );

      // Return empty stats on error
      return {
        count: 0,
        totalAmount: {} as Record<CurrencyCode, number>,
        byType: {} as Record<TransactionType, number>,
        byStatus: {} as Record<TransactionStatus, number>,
        byCurrency: {} as Record<CurrencyCode, number>,
        volume: {} as Record<CurrencyCode, number>,
        fees: {} as Record<CurrencyCode, number>,
        success_rate: 0
      };
    }
  }
} 