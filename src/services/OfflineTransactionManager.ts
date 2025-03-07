import { v4 as uuidv4 } from 'uuid';
import type {
  CurrencyCode,
  SyncQueueItem,
  Transaction,
  TransactionInput,
  TransactionStats
} from '../types';
import {
  EntityType,
  SyncOperationType,
  TransactionStatus,
  TransactionType
} from '../types';
import { errorService, ErrorSeverity, ErrorSource } from './ErrorService';
import { localStorageService } from './LocalStorageService';

// Re-export these types so components can import them from this file
export { TransactionStatus, TransactionType };
export type { Transaction };

/**
 * Service for managing offline transactions
 * Provides comprehensive transaction management with offline support
 */
export class OfflineTransactionManager {
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private syncInterval: number | null = null;
  private readonly SYNC_INTERVAL_MS = 60000; // 1 minute
  private readonly MAX_SYNC_ATTEMPTS = 5;
  private readonly TRANSACTION_STORE = 'transactions';
  private readonly SYNC_QUEUE_STORE = 'syncQueue';
  private readonly EXCHANGE_RATE_STORE = 'exchangeRates';

  // Default exchange rates to use when offline
  private readonly DEFAULT_EXCHANGE_RATES = {
    'USD_FC': 2000, // 1 USD = 2000 FC
    'FC_USD': 0.0005 // 1 FC = 0.0005 USD
  };

  constructor() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Initialize online status
    this.isOnline = navigator.onLine;

    // Start sync process if online
    if (this.isOnline) {
      this.startSync();
    }

    // Initialize exchange rates if needed
    this.initializeExchangeRates();
  }

  /**
   * Initialize exchange rates with default values if not already set
   */
  private async initializeExchangeRates(): Promise<void> {
    try {
      const usdToFc = await localStorageService.get(this.EXCHANGE_RATE_STORE, 'USD_FC');
      const fcToUsd = await localStorageService.get(this.EXCHANGE_RATE_STORE, 'FC_USD');

      if (!usdToFc) {
        await localStorageService.add(this.EXCHANGE_RATE_STORE, {
          id: 'USD_FC',
          rate: this.DEFAULT_EXCHANGE_RATES['USD_FC'],
          updatedAt: new Date().toISOString()
        });
      }

      if (!fcToUsd) {
        await localStorageService.add(this.EXCHANGE_RATE_STORE, {
          id: 'FC_USD',
          rate: this.DEFAULT_EXCHANGE_RATES['FC_USD'],
          updatedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      errorService.reportError({
        message: 'Failed to initialize exchange rates',
        severity: ErrorSeverity.WARNING,
        source: ErrorSource.SYSTEM,
        error: error as Error
      });
    }
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    this.isOnline = true;
    this.startSync();
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    this.isOnline = false;
    this.stopSync();
  };

  /**
   * Start sync process
   */
  private startSync(): void {
    if (this.syncInterval === null) {
      // Sync immediately
      void this.syncTransactions();

      // Then set up interval
      this.syncInterval = window.setInterval(() => {
        void this.syncTransactions();
      }, this.SYNC_INTERVAL_MS);
    }
  }

  /**
   * Stop sync process
   */
  private stopSync(): void {
    if (this.syncInterval !== null) {
      window.clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Validate a transaction
   */
  private validateTransaction(transaction: TransactionInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Basic validation
    if (!transaction.amount || transaction.amount <= 0) {
      errors.push('Transaction amount must be greater than zero');
    }

    if (!transaction.description) {
      errors.push('Transaction description is required');
    }

    if (!Object.values(TransactionType).includes(transaction.type)) {
      errors.push('Invalid transaction type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create a new transaction
   */
  async createTransaction(transaction: TransactionInput): Promise<Transaction> {
    try {
      // Validate the transaction
      const validation = this.validateTransaction(transaction);
      if (!validation.isValid) {
        throw new Error(`Invalid transaction: ${validation.errors.join(', ')}`);
      }

      const newTransaction: Transaction = {
        id: uuidv4(),
        ...transaction,
        status: TransactionStatus.PENDING,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await localStorageService.add(this.TRANSACTION_STORE, newTransaction);

      // Add to sync queue
      await this.addToSyncQueue(newTransaction.id, EntityType.TRANSACTION, SyncOperationType.CREATE, newTransaction);

      return newTransaction;
    } catch (error) {
      errorService.reportError({
        message: 'Failed to create transaction',
        severity: ErrorSeverity.ERROR,
        source: ErrorSource.SYSTEM,
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Get a transaction by ID
   */
  async getTransaction(id: string): Promise<Transaction | null> {
    try {
      return await localStorageService.get<Transaction>(this.TRANSACTION_STORE, id);
    } catch (error) {
      errorService.reportError({
        message: 'Failed to get transaction',
        severity: ErrorSeverity.ERROR,
        source: ErrorSource.SYSTEM,
        error: error as Error
      });
      return null;
    }
  }

  /**
   * Get all transactions with optional filtering and pagination
   */
  async getTransactions(options?: {
    limit?: number;
    type?: TransactionType;
    status?: TransactionStatus;
    fromDate?: string;
    toDate?: string;
    currency?: CurrencyCode;
    minAmount?: number;
    maxAmount?: number;
    searchText?: string;
  }): Promise<Transaction[]> {
    try {
      const transactions = await localStorageService.getAll<Transaction>(
        this.TRANSACTION_STORE,
        undefined,
        undefined,
        options?.limit
      );

      // Apply filters if provided
      if (options) {
        return transactions.filter(transaction => {
          let include = true;

          if (options.type && transaction.type !== options.type) {
            include = false;
          }

          if (options.status && transaction.status !== options.status) {
            include = false;
          }

          if (options.fromDate && transaction.createdAt < options.fromDate) {
            include = false;
          }

          if (options.toDate && transaction.createdAt > options.toDate) {
            include = false;
          }

          if (options.currency && transaction.currency !== options.currency) {
            include = false;
          }

          if (options.minAmount !== undefined && transaction.amount < options.minAmount) {
            include = false;
          }

          if (options.maxAmount !== undefined && transaction.amount > options.maxAmount) {
            include = false;
          }

          if (options.searchText) {
            const searchLower = options.searchText.toLowerCase();
            const descriptionMatch = transaction.description.toLowerCase().includes(searchLower);
            const fromAccountMatch = transaction.fromAccount?.toLowerCase().includes(searchLower) || false;
            const toAccountMatch = transaction.toAccount?.toLowerCase().includes(searchLower) || false;

            if (!descriptionMatch && !fromAccountMatch && !toAccountMatch) {
              include = false;
            }
          }

          return include;
        });
      }

      return transactions;
    } catch (error) {
      errorService.reportError({
        message: 'Failed to get transactions',
        severity: ErrorSeverity.ERROR,
        source: ErrorSource.SYSTEM,
        error: error as Error
      });
      return [];
    }
  }

  private initializeEmptyStats(): TransactionStats {
    // Create empty stats object with initialized records
    const currencyCodes: CurrencyCode[] = ['USD', 'EUR', 'CDF'];
    const transactionTypes = Object.values(TransactionType);
    const transactionStatuses = Object.values(TransactionStatus);

    // Initialize totalAmount with all currency codes
    const totalAmount: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;
    currencyCodes.forEach(code => {
      totalAmount[code] = 0;
    });

    // Initialize byType with all transaction types
    const byType: Record<TransactionType, number> = {} as Record<TransactionType, number>;
    transactionTypes.forEach(type => {
      byType[type] = 0;
    });

    // Initialize byStatus with all transaction statuses
    const byStatus: Record<TransactionStatus, number> = {} as Record<TransactionStatus, number>;
    transactionStatuses.forEach(status => {
      byStatus[status] = 0;
    });

    // Initialize byCurrency with all currency codes
    const byCurrency: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;
    currencyCodes.forEach(code => {
      byCurrency[code] = 0;
    });

    // Initialize volume and fees for Dashboard components
    const volume: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;
    const fees: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;
    currencyCodes.forEach(code => {
      volume[code] = 0;
      fees[code] = 0;
    });

    return {
      totalAmount,
      byType,
      byStatus,
      byCurrency,
      count: 0,
      volume,
      fees,
      success_rate: 0
    };
  }

  async getTransactionStats(options: {
    startDate?: Date;
    endDate?: Date;
    type?: TransactionType;
    status?: TransactionStatus;
    currency?: CurrencyCode;
  } = {}): Promise<TransactionStats> {
    try {
      const transactions = await this.getTransactions(options);

      if (transactions.length === 0) {
        return this.initializeEmptyStats();
      }

      // Initialize stats object with empty records




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

      // Calculate stats
      for (const transaction of transactions) {
        // Total amount by currency
        if (transaction.currency in stats.totalAmount) {
          stats.totalAmount[transaction.currency] += transaction.amount;
        }

        // Count by type
        if (transaction.type in stats.byType) {
          stats.byType[transaction.type]++;
        }

        // Count by status
        if (transaction.status in stats.byStatus) {
          stats.byStatus[transaction.status]++;
        }

        // Count by currency
        if (transaction.currency in stats.byCurrency) {
          stats.byCurrency[transaction.currency]++;
        }
      }

      return stats;
    } catch (error) {
      errorService.reportError({
        message: 'Failed to get transaction statistics',
        severity: ErrorSeverity.WARNING,
        source: ErrorSource.SYSTEM,
        error: error as Error
      });

      // Return empty stats on error
      return this.initializeEmptyStats();
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): Promise<number> {
    try {
      if (fromCurrency === toCurrency) {
        return 1; // Same currency, rate is 1:1
      }

      const rateKey = `${fromCurrency}_${toCurrency}`;
      const reverseRateKey = `${toCurrency}_${fromCurrency}`;

      // Try to get the direct rate
      const rate = await localStorageService.get(this.EXCHANGE_RATE_STORE, rateKey);
      if (rate) {
        return (rate as any).rate;
      }

      // Try to get the reverse rate and invert it
      const reverseRate = await localStorageService.get(this.EXCHANGE_RATE_STORE, reverseRateKey);
      if (reverseRate) {
        return 1 / (reverseRate as any).rate;
      }

      // Fall back to default rates if available
      if (this.DEFAULT_EXCHANGE_RATES[rateKey as keyof typeof this.DEFAULT_EXCHANGE_RATES]) {
        return this.DEFAULT_EXCHANGE_RATES[rateKey as keyof typeof this.DEFAULT_EXCHANGE_RATES];
      }

      if (this.DEFAULT_EXCHANGE_RATES[reverseRateKey as keyof typeof this.DEFAULT_EXCHANGE_RATES]) {
        return 1 / this.DEFAULT_EXCHANGE_RATES[reverseRateKey as keyof typeof this.DEFAULT_EXCHANGE_RATES];
      }

      // No rate found
      throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    } catch (error) {
      errorService.reportError({
        message: `Failed to get exchange rate from ${fromCurrency} to ${toCurrency}`,
        severity: ErrorSeverity.WARNING,
        source: ErrorSource.SYSTEM,
        error: error as Error
      });

      // Default to 1:1 if no rate is found
      return 1;
    }
  }

  /**
   * Update a transaction
   */
  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    try {
      // Get current transaction
      const transaction = await this.getTransaction(id);

      if (!transaction) {
        throw new Error(`Transaction with ID ${id} not found`);
      }

      // Validate updates
      if (Object.keys(updates).length > 0) {
        const validationResult = this.validateTransaction({
          ...transaction,
          ...updates
        });

        if (!validationResult.isValid) {
          throw new Error(validationResult.errors?.join(', ') || 'Invalid transaction updates');
        }
      }

      // Update transaction
      const updatedTransaction: Transaction = {
        ...transaction,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Save to local storage
      await localStorageService.update(this.TRANSACTION_STORE, id, updatedTransaction);

      // If online, add to sync queue
      if (this.isOnline) {
        await this.addToSyncQueue(
          id,
          EntityType.TRANSACTION,
          SyncOperationType.UPDATE,
          updatedTransaction
        );

        // Trigger sync
        void this.syncTransactions();
      }
    } catch (error) {
      errorService.reportError({
        message: 'Failed to update transaction',
        severity: ErrorSeverity.ERROR,
        source: ErrorSource.SYSTEM,
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(id: string): Promise<void> {
    try {
      // Get transaction first to ensure it exists
      const transaction = await this.getTransaction(id);

      if (!transaction) {
        throw new Error(`Transaction with ID ${id} not found`);
      }

      // Delete from local storage
      await localStorageService.delete(this.TRANSACTION_STORE, id);

      // If online, add to sync queue
      if (this.isOnline) {
        await this.addToSyncQueue(
          id,
          EntityType.TRANSACTION,
          SyncOperationType.DELETE,
          { id }
        );

        // Trigger sync
        void this.syncTransactions();
      }
    } catch (error) {
      errorService.reportError({
        message: 'Failed to delete transaction',
        severity: ErrorSeverity.ERROR,
        source: ErrorSource.SYSTEM,
        error: error as Error
      });
      throw error;
    }
  }

  /**
   * Add an item to the sync queue
   */
  private async addToSyncQueue(
    entityId: string,
    entityType: EntityType,
    operation: SyncOperationType,
    data: any
  ): Promise<void> {
    try {
      const syncItem: SyncQueueItem = {
        id: crypto.randomUUID(),
        entityId,
        entityType,
        operation,
        data,
        timestamp: new Date().toISOString(),
        retryCount: 0,
        status: 'pending'
      };

      await localStorageService.add(this.SYNC_QUEUE_STORE, syncItem);
    } catch (error) {
      errorService.reportError({
        message: 'Failed to add item to sync queue',
        severity: ErrorSeverity.ERROR,
        source: ErrorSource.OFFLINE_TRANSACTION_MANAGER,
        error: error as Error
      });
    }
  }

  /**
   * Get the count of pending sync operations
   */
  async getPendingSyncCount(): Promise<number> {
    try {
      const syncItems = await localStorageService.getAll<SyncQueueItem>(this.SYNC_QUEUE_STORE);
      return syncItems.length;
    } catch (error) {
      errorService.reportError({
        message: 'Failed to get pending sync count',
        severity: ErrorSeverity.WARNING,
        source: ErrorSource.SYSTEM,
        error: error as Error
      });
      return 0;
    }
  }

  /**
   * Sync transactions with the server
   */
  async syncTransactions(): Promise<void> {
    // If offline or sync already in progress, skip
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    try {
      this.syncInProgress = true;

      // Get pending sync items
      const syncItems = await localStorageService.getAll<SyncQueueItem>(
        this.SYNC_QUEUE_STORE
      );

      // Process each item
      for (const item of syncItems) {
        try {
          // Skip items that have exceeded max attempts
          if (item.retryCount >= this.MAX_SYNC_ATTEMPTS) {
            continue;
          }

          // Update attempt count
          item.retryCount += 1;
          item.timestamp = new Date().toISOString();

          // Process based on operation type
          switch (item.operation) {
            case SyncOperationType.CREATE:
              await this.syncCreateOperation(item);
              break;
            case SyncOperationType.UPDATE:
              await this.syncUpdateOperation(item);
              break;
            case SyncOperationType.DELETE:
              await this.syncDeleteOperation(item);
              break;
          }

          // Remove from sync queue on success
          await localStorageService.delete(this.SYNC_QUEUE_STORE, item.id);
        } catch (error) {
          // Update sync item with error
          (item as any).error = error instanceof Error ? error.message : String(error);
          await localStorageService.update(this.SYNC_QUEUE_STORE, item.id, item);

          // Log error but continue with next item
          console.error(`Error syncing item ${item.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in syncTransactions:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync a create operation
   */
  private async syncCreateOperation(item: SyncQueueItem): Promise<void> {
    // Here you would implement the actual sync with the server
    // For now, we'll just mark the transaction as completed
    if (item.entityType === this.TRANSACTION_STORE) {
      const transaction = item.data as Transaction;
      transaction.status = TransactionStatus.COMPLETED;
      transaction.syncedAt = new Date().toISOString();

      await localStorageService.update(this.TRANSACTION_STORE, transaction.id, transaction);
    }
  }

  /**
   * Sync an update operation
   */
  private async syncUpdateOperation(item: SyncQueueItem): Promise<void> {
    // Here you would implement the actual sync with the server
    // For now, we'll just mark the transaction as completed
    if (item.entityType === this.TRANSACTION_STORE) {
      const transaction = item.data as Transaction;
      transaction.syncedAt = new Date().toISOString();

      await localStorageService.update(this.TRANSACTION_STORE, transaction.id, transaction);
    }
  }

  /**
   * Sync a delete operation
   */
  private async syncDeleteOperation(_item: SyncQueueItem): Promise<void> {
    // Here you would implement the actual sync with the server
    // For now, we'll just do nothing
  }

  /**
   * Clean up event listeners
   */
  dispose(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    this.stopSync();
  }
}

// Create and export a singleton instance
export const offlineTransactionManager = new OfflineTransactionManager(); 