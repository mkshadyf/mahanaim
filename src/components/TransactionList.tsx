import { ActionIcon, Badge, Card, Group, ScrollArea, Table, Text } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '../types';
import { TransactionStatus, TransactionType } from '../types';
import { TransactionDetail } from './TransactionDetail';

interface TransactionListProps {
  transactions: Transaction[];
  onViewDetails?: (transaction: Transaction) => void;
}

export function TransactionList({ 
  transactions = []}: TransactionListProps) {
  const { t } = useTranslation();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'green';
      case TransactionStatus.FAILED:
        return 'red';
      case TransactionStatus.PENDING:
        return 'yellow';
      case TransactionStatus.SYNCING:
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.PAYMENT:
        return 'red';
      case TransactionType.DEPOSIT:
        return 'green';
      case TransactionType.TRANSFER:
        return 'blue';
      case TransactionType.WITHDRAWAL:
        return 'violet';
      default:
        return 'gray';
    }
  };

  const handleViewTransaction = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedTransaction(null);
  }, []);

  if (transactions.length === 0) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Text align="center">{t('transaction.list.empty')}</Text>
      </Card>
    );
  }

  return (
    <>
      <ScrollArea>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>{t('transaction.list.date')}</th>
              <th>{t('transaction.list.description')}</th>
              <th>{t('transaction.list.amount')}</th>
              <th>{t('transaction.list.type')}</th>
              <th>{t('transaction.list.status')}</th>
              <th>{t('transaction.list.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{format(new Date(transaction.createdAt), 'PP')}</td>
                <td>{transaction.description}</td>
                <td>
                  {transaction.currency} {transaction.amount.toLocaleString()}
                </td>
                <td>
                  <Badge color={getTypeColor(transaction.type)}>
                    {t(`transaction.type.${transaction.type.toLowerCase()}`)}
                  </Badge>
                </td>
                <td>
                  <Badge color={getStatusColor(transaction.status)}>
                    {t(`transaction.status.${transaction.status.toLowerCase()}`)}
                  </Badge>
                </td>
                <td>
                  <Group spacing={0} position="right">
                    <ActionIcon onClick={() => handleViewTransaction(transaction)}>
                      <IconEye size={16} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>

      {selectedTransaction && (
        <TransactionDetail
          transaction={selectedTransaction}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
} 