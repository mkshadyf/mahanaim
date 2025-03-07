import {
    Button,
    Card,
    Container,
    Group,
    Tabs,
    Text
} from '@mantine/core';
import { IconChartBar, IconList, IconPlus, IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BatchTransactionImport } from '../components/BatchTransactionImport';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionList } from '../components/TransactionList';
import type { Transaction } from '../types';

/**
 * Page for managing transactions
 * Includes transaction list, batch import, and form for adding new transactions
 */
export function TransactionsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string | null>('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [transactions] = useState<Transaction[]>([]);
  
  // Handle form success
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    // Refresh transactions
  };
  
  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
  };
  
  // Handle batch import success
  const handleBatchImportSuccess = () => {
    setIsBatchImportOpen(false);
    // Refresh transactions
  };
  
  // Handle batch import cancel
  const handleBatchImportCancel = () => {
    setIsBatchImportOpen(false);
  };
  
  const handleViewDetails = (transaction: Transaction) => {
    // Implement the logic to view details of a transaction
    console.log('View details for transaction:', transaction.id);
  };
  
  return (
    <Container size="xl" py="xl">
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Group position="apart" mb="md">
          <Text weight={500}>{t('transactions.title')}</Text>
          
          <Group spacing="xs">
            <Button
              size="sm"
              leftIcon={<IconPlus size={16} />}
              onClick={() => setIsFormOpen(true)}
            >
              {t('transactions.addNew')}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              leftIcon={<IconUpload size={16} />}
              onClick={() => setIsBatchImportOpen(true)}
            >
              {t('transactions.batchImport')}
            </Button>
          </Group>
        </Group>
        
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="list" icon={<IconList size={14} />}>
              {t('transactions.list')}
            </Tabs.Tab>
            <Tabs.Tab value="analytics" icon={<IconChartBar size={14} />}>
              {t('transactions.analytics')}
            </Tabs.Tab>
          </Tabs.List>
          
          <Tabs.Panel value="list" pt="md">
            <TransactionList 
              transactions={transactions} 
              onViewDetails={handleViewDetails}
            />
          </Tabs.Panel>
          
          <Tabs.Panel value="analytics" pt="md">
            <Text>{t('transactions.analyticsComingSoon')}</Text>
          </Tabs.Panel>
        </Tabs>
      </Card>
      
      {/* Transaction Form Modal */}
      {isFormOpen && (
        <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
          <TransactionForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </Card>
      )}
      
      {/* Batch Import Modal */}
      {isBatchImportOpen && (
        <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
          <BatchTransactionImport
            onSuccess={handleBatchImportSuccess}
            onCancel={handleBatchImportCancel}
          />
        </Card>
      )}
    </Container>
  );
} 