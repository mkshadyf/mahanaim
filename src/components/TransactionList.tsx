import { useEffect, useState } from 'react';
import {
  Table,
  Badge,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Stack,
} from '@mantine/core';
import { IconEye, IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, orderBy, limit, getDocs, startAfter, type DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Transaction, TransactionType, TransactionStatus } from '@/types/transaction';

interface TransactionListProps {
  pageSize?: number;
  onViewTransaction?: (transaction: Transaction) => void;
  filters?: {
    type?: TransactionType;
    status?: TransactionStatus;
    dateRange?: [Date | null, Date | null];
  };
}

export function TransactionList({
  pageSize = 10,
  onViewTransaction,
  filters,
}: TransactionListProps) {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = async (isLoadMore = false) => {
    try {
      setLoading(true);
      let q = query(
        collection(db, 'transactions'),
        orderBy('timestamps.created', 'desc'),
        limit(pageSize)
      );

      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }

      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }

      if (filters?.dateRange?.[0]) {
        q = query(q, where('timestamps.created', '>=', filters.dateRange[0]));
      }

      if (filters?.dateRange?.[1]) {
        q = query(q, where('timestamps.created', '<=', filters.dateRange[1]));
      }

      if (isLoadMore && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snapshot = await getDocs(q);
      const newTransactions = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Transaction
      );

      setTransactions((prev) =>
        isLoadMore ? [...prev, ...newTransactions] : newTransactions
      );
      setLastVisible(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTransactions();
  }, [filters]);

  const getStatusColor = (status: TransactionStatus): string => {
    const colors: Record<TransactionStatus, string> = {
      pending: 'yellow',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
    };
    return colors[status];
  };

  const formatAmount = (amount: number, currency: string) => {
    return currency === 'USD'
      ? `$${amount.toLocaleString()}`
      : `FC ${amount.toLocaleString()}`;
  };

  const handleExport = async () => {
    // Implement CSV export logic here
  };

  return (
    <Stack>
      <Group position="apart">
        <Text size="lg" weight={500}>
          {t('recentTransactions')}
        </Text>
        <Tooltip label={t('exportTransactions')}>
          <ActionIcon onClick={handleExport}>
            <IconDownload size={20} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Table>
        <thead>
          <tr>
            <th>{t('id')}</th>
            <th>{t('date')}</th>
            <th>{t('type')}</th>
            <th>{t('amount')}</th>
            <th>{t('status')}</th>
            <th>{t('party')}</th>
            <th>{t('actions')}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>
                <Text size="sm" color="dimmed">
                  {transaction.id.slice(0, 8)}...
                </Text>
              </td>
              <td>
                <Text size="sm">
                  {transaction.timestamps.created.toDate().toLocaleDateString()}
                </Text>
              </td>
              <td>
                <Badge>{t(transaction.type)}</Badge>
              </td>
              <td>
                <Text size="sm">
                  {formatAmount(transaction.amount.amount, transaction.amount.currency)}
                </Text>
              </td>
              <td>
                <Badge color={getStatusColor(transaction.status)}>
                  {t(transaction.status)}
                </Badge>
              </td>
              <td>
                <Text size="sm">
                  {transaction.type === 'send'
                    ? transaction.receiver.name
                    : transaction.sender.name}
                </Text>
              </td>
              <td>
                <Group spacing={0} position="left">
                  {onViewTransaction && (
                    <ActionIcon onClick={() => onViewTransaction(transaction)}>
                      <IconEye size={16} />
                    </ActionIcon>
                  )}
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {hasMore && (
        <Group position="center">
          <ActionIcon
            onClick={() => void fetchTransactions(true)}
            loading={loading}
            variant="subtle"
          >
            {t('loadMore')}
          </ActionIcon>
        </Group>
      )}
    </Stack>
  );
} 