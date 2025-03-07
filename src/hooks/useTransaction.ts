import { db } from '@/firebase';
import { TransactionService } from '@/services/TransactionService';
import { TransactionType } from '@/types/transaction';
import { notifications } from '@mantine/notifications';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

const transactionService = new TransactionService(db);

export const useTransaction = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createTransaction = useCallback(async (input: any) => {
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
      throw error;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const updateTransactionStatus = useCallback(async (id: string, status: string) => {
    try {
      setLoading(true);
      setError(null);
      await transactionService.updateTransactionStatus(id, status as any);
      notifications.show({
        title: t('success'),
        message: t('transactionUpdated'),
        color: 'green',
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update transaction');
      setError(error);
      notifications.show({
        title: t('error'),
        message: error.message,
        color: 'red',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const getTransaction = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      return await transactionService.getTransaction(id);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get transaction');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTransactionStats = useCallback(async (type?: TransactionType, startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      setError(null);
      return await transactionService.getTransactionStats(type as any, startDate, endDate);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch transaction stats');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createTransaction,
    updateTransactionStatus,
    getTransaction,
    getTransactionStats,
  };
}; 