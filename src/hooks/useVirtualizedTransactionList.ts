import { useCallback, useEffect, useMemo, useState } from 'react';
import { errorService, ErrorSeverity, ErrorSource } from '../services/ErrorService';
import type { Transaction, TransactionStatus, TransactionType } from '../services/OfflineTransactionManager';
import { offlineTransactionManager } from '../services/OfflineTransactionManager';

interface UseVirtualizedTransactionListOptions {
  initialLimit?: number;
  incrementAmount?: number;
  sortBy?: keyof Transaction;
  sortDirection?: 'asc' | 'desc';
  filters?: {
    type?: TransactionType;
    status?: TransactionStatus;
    dateRange?: [string | null, string | null];
  };
}

interface UseVirtualizedTransactionListResult {
  transactions: Transaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  pendingSyncCount: number;
}

/**
 * Hook for managing a virtualized list of transactions with pagination and filtering
 * Optimized for mobile performance
 */
export function useVirtualizedTransactionList({
  initialLimit = 20,
  incrementAmount = 20,
  sortBy = 'createdAt',
  sortDirection = 'desc',
  filters
}: UseVirtualizedTransactionListOptions = {}): UseVirtualizedTransactionListResult {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [limit, setLimit] = useState<number>(initialLimit);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Create filter options for the transaction manager
  const filterOptions = useMemo(() => {
    return {
      limit,
      type: filters?.type,
      status: filters?.status,
      fromDate: filters?.dateRange?.[0] || undefined,
      toDate: filters?.dateRange?.[1] || undefined
    };
  }, [limit, filters]);

  // Function to sort transactions
  const sortTransactions = useCallback((items: Transaction[]) => {
    return [...items].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === undefined) return sortDirection === 'asc' ? 1 : -1;

      return sortDirection === 'asc'
        ? (aValue as any) - (bValue as any)
        : (bValue as any) - (aValue as any);
    });
  }, [sortBy, sortDirection]);

  // Function to load transactions
  const loadTransactions = useCallback(async (refresh = false) => {
    try {
      // Get transactions from offline manager with filters
      const fetchedTransactions = await offlineTransactionManager.getTransactions(filterOptions);

      // Sort transactions
      const sortedTransactions = sortTransactions(fetchedTransactions);

      // Update state
      setTransactions(sortedTransactions);
      setHasMore(fetchedTransactions.length >= limit);
      setError(null);

      // Get pending sync count
      const syncCount = await offlineTransactionManager.getPendingSyncCount();
      setPendingSyncCount(syncCount);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load transactions');
      setError(error);

      errorService.handleError(
        error,
        ErrorSource.DATABASE,
        ErrorSeverity.ERROR,
        { operation: 'loadTransactions', limit }
      );
    } finally {
      setIsLoading(false);
      if (refresh) {
        setIsRefreshing(false);
      }
    }
  }, [filterOptions, sortTransactions, limit]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    void loadTransactions();
  }, [loadTransactions]);

  // Set up sync listener
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const syncCount = await offlineTransactionManager.getPendingSyncCount();
        setPendingSyncCount(syncCount);

        // If sync count changed to 0, refresh the list
        if (syncCount === 0 && pendingSyncCount > 0) {
          void loadTransactions();
        }
      } catch (error) {
        // Silent error handling for background sync check
        console.error('Error checking sync count:', error);
      }
    }, 5000);

    return () => clearInterval(syncInterval);
  }, [loadTransactions, pendingSyncCount]);

  // Function to load more transactions
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const newLimit = limit + incrementAmount;
    setLimit(newLimit);
  }, [isLoading, hasMore, limit, incrementAmount]);

  // Function to refresh transactions
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadTransactions(true);
  }, [loadTransactions]);

  return {
    transactions,
    isLoading,
    isRefreshing,
    hasMore,
    error,
    loadMore,
    refresh,
    pendingSyncCount
  };
} 