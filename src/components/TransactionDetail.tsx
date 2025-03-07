import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Card,
    Divider,
    Group,
    Modal,
    Stack,
    Text
} from '@mantine/core';
import {
    IconArrowLeft,
    IconDownload,
    IconEdit,
    IconTrash
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    offlineTransactionManager
} from '../services/OfflineTransactionManager';
import type { Transaction } from '../types';
import { TransactionStatus, TransactionType } from '../types';
import { downloadTransactionAsText } from '../utils/transactionExport';
import { TransactionForm } from './TransactionForm';

interface TransactionDetailProps {
  transaction: Transaction;
  onClose: () => void;
}

/**
 * Component for displaying transaction details with edit and delete functionality
 */
export function TransactionDetail({ transaction, onClose }: TransactionDetailProps) {
  const { t } = useTranslation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Get transaction type color
  const getTransactionTypeColor = (type: TransactionType): string => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'green';
      case TransactionType.WITHDRAWAL:
        return 'red';
      case TransactionType.TRANSFER:
        return 'blue';
      case TransactionType.PAYMENT:
        return 'orange';
      default:
        return 'gray';
    }
  };
  
  // Get transaction status color
  const getTransactionStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'green';
      case TransactionStatus.PENDING:
        return 'yellow';
      case TransactionStatus.FAILED:
        return 'red';
      case TransactionStatus.SYNCING:
        return 'blue';
      default:
        return 'gray';
    }
  };
  
  // Format amount with currency
  const formatAmount = (amount: number, currency: string): string => {
    return `${currency} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Handle delete transaction
  const handleDeleteTransaction = async () => {
    try {
      setIsDeleting(true);
      await offlineTransactionManager.deleteTransaction(transaction.id);
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      onClose();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      setIsDeleting(false);
    }
  };
  
  // Handle edit success
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    onClose();
  };
  
  // Handle download transaction
  const handleDownloadTransaction = async () => {
    try {
      setIsDownloading(true);
      await downloadTransactionAsText(transaction);
      setIsDownloading(false);
    } catch (error) {
      console.error('Failed to download transaction details', error);
      setIsDownloading(false);
    }
  };
  
  return (
    <Box>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group position="apart" mb="md">
          <Group>
            <ActionIcon onClick={onClose} size="lg">
              <IconArrowLeft size={20} />
            </ActionIcon>
            <Text weight={700} size="xl">
              {t('transaction.detail.title')}
            </Text>
          </Group>
          
          <Group>
            <Button
              leftIcon={<IconDownload size={20} />}
              variant="outline"
              onClick={handleDownloadTransaction}
              loading={isDownloading}
            >
              {t('common.download')}
            </Button>
            
            <Button
              leftIcon={<IconEdit size={20} />}
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              {t('common.edit')}
            </Button>
            
            <Button
              leftIcon={<IconTrash size={20} />}
              variant="outline"
              color="red"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              {t('common.delete')}
            </Button>
          </Group>
        </Group>
        
        <Divider mb="md" />
        
        <Group mb="xs">
          <Text weight={500}>{t('transaction.detail.id')}:</Text>
          <Text>{transaction.id}</Text>
        </Group>
        
        <Group mb="xs">
          <Text weight={500}>{t('transaction.detail.description')}:</Text>
          <Text>{transaction.description || t('common.notAvailable')}</Text>
        </Group>
        
        <Group mb="xs">
          <Text weight={500}>{t('transaction.detail.amount')}:</Text>
          <Text weight={700} size="lg">
            {formatAmount(transaction.amount, transaction.currency)}
          </Text>
        </Group>
        
        <Group mb="xs">
          <Text weight={500}>{t('transaction.detail.date')}:</Text>
          <Text>{formatDate(transaction.createdAt)}</Text>
        </Group>
        
        <Group mb="xs">
          <Text weight={500}>{t('transaction.detail.status')}:</Text>
          <Badge color={getTransactionStatusColor(transaction.status)}>
            {t(`transaction.status.${transaction.status.toLowerCase()}`)}
          </Badge>
        </Group>
        
        <Group mb="xs">
          <Text weight={500}>{t('transaction.detail.type')}:</Text>
          <Badge color={getTransactionTypeColor(transaction.type)}>
            {t(`transaction.type.${transaction.type.toLowerCase()}`)}
          </Badge>
        </Group>
        
        <Group mt="xl">
          <Button variant="outline" onClick={onClose}>
            {t('common.back')}
          </Button>
        </Group>
      </Card>
      
      {/* Transaction Form Modal */}
      <Modal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('transaction.edit.title')}
        size="lg"
      >
        <TransactionForm
          initialValues={transaction}
          isEdit={true}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        opened={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t('common.delete')}
        size="sm"
      >
        <Stack spacing="md">
          <Text>
            {t('transaction.deleteConfirmation', {
              defaultValue: 'Are you sure you want to delete this transaction?'
            })}
          </Text>
          
          <Group position="right">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              color="red" 
              loading={isDeleting}
              onClick={handleDeleteTransaction}
            >
              {t('common.delete')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
} 