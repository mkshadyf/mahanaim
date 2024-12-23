import { TransactionService } from '@/services/TransactionService';
import type {
  Transaction,
  TransactionInput,
  TransactionStats,
  TransactionType,
} from '@/types/transaction';
import { notifications } from '@mantine/notifications';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const transactionService = new TransactionService();

export const useTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useTranslation();

  const createTransaction = useCallback(
    async (input: TransactionInput): Promise<Transaction | null> => {
      try {
        setLoading(true);
        setError(null);
        const transaction = await transactionService.createTransaction(input);
        notifications.show({
          title: t('success'),
          message: t('transactionCreated'),
          color: 'green',
        });
        return transaction;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create transaction');
        setError(error);
        notifications.show({
          title: t('error'),
          message: error.message,
          color: 'red',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const getTransaction = useCallback(
    async (id: string): Promise<Transaction | null> => {
      try {
        setLoading(true);
        setError(null);
        return await transactionService.getTransaction(id);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch transaction');
        setError(error);
        notifications.show({
          title: t('error'),
          message: error.message,
          color: 'red',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const getTransactionStats = useCallback(
    async (
      type?: TransactionType,
      startDate?: Date,
      endDate?: Date
    ): Promise<TransactionStats | null> => {
      try {
        setLoading(true);
        setError(null);
        return await transactionService.getTransactionStats(type, startDate, endDate);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch transaction stats');
        setError(error);
        notifications.show({
          title: t('error'),
          message: error.message,
          color: 'red',
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  return {
    loading,
    error,
    createTransaction,
    getTransaction,
    getTransactionStats,
  };
}; 