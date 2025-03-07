import {
  Badge,
  Button,
  Container,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Title
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconChartBar, IconChartPie, IconFileExport, IconList, IconPrinter, IconReportAnalytics } from '@tabler/icons-react';
import { subDays } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DateInput } from '../components/DateInput';
import { PieChart } from '../components/PieChart';
import { useError } from '../services/ErrorService';
import {
  TransactionStatus,
  TransactionType,
  type Transaction
} from '../services/OfflineTransactionManager';

// Mock function to replace useTransaction hook
const getTransactions = async (_startDate: Date, _endDate: Date) => {
  // This would normally fetch from a service
  return [] as Transaction[];
};

interface ReportData {
  transactions: Transaction[];
  summary: {
    totalAmount: Record<string, number>;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    byCurrency: Record<string, number>;
    totalCount?: number;
  };
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt?: Date;
}

/**
 * Page for generating and viewing transaction reports
 */
export function ReportsPage() {
  const { t } = useTranslation();
  const { handleError } = useError();
  const [activeTab, setActiveTab] = useState<string>('summary');
  const [reportType, setReportType] = useState<string>('summary');
  const [startDate, setStartDate] = useState<Date | null>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Set default date range based on report type
  useEffect(() => {
    const today = new Date();
    
    switch (activeTab) {
      case 'daily':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'weekly':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        setStartDate(weekStart);
        setEndDate(weekEnd);
        break;
      case 'monthly':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setStartDate(monthStart);
        setEndDate(monthEnd);
        break;
      case 'custom':
        // Keep current selection for custom
        break;
      default:
        setStartDate(today);
        setEndDate(today);
    }
  }, [activeTab]);
  
  // Generate report
  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      notifications.show({
        title: t('error'),
        message: t('reports.selectDateRange'),
        color: 'red',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Adjust dates to include full days
      const adjustedStartDate = new Date(startDate);
      adjustedStartDate.setHours(0, 0, 0, 0);
      
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setHours(23, 59, 59, 999);
      
      // Get transactions for the date range
      const transactions = await getTransactions(adjustedStartDate, adjustedEndDate);
      
      const summary = generateSummary(transactions);
      
      setReportData({
        transactions,
        summary,
        dateRange: {
          startDate: adjustedStartDate,
          endDate: adjustedEndDate,
        },
        generatedAt: new Date(),
      });
      
      notifications.show({
        title: t('success'),
        message: t('reports.reportGenerated'),
        color: 'green',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      notifications.show({
        title: t('error'),
        message: t('reports.errorGenerating'),
        color: 'red',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate summary data
  const generateSummary = (transactions: Transaction[]) => {
    const summary = {
      totalCount: transactions.length,
      totalAmount: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      byCurrency: {} as Record<string, number>
    };
    
    // Calculate totals
    transactions.forEach(transaction => {
      // By currency
      if (!summary.totalAmount[transaction.currency]) {
        summary.totalAmount[transaction.currency] = 0;
      }
      summary.totalAmount[transaction.currency] += transaction.amount;
      
      // By type
      if (!summary.byType[transaction.type]) {
        summary.byType[transaction.type] = 0;
      }
      summary.byType[transaction.type]++;
      
      // By status
      if (!summary.byStatus[transaction.status]) {
        summary.byStatus[transaction.status] = 0;
      }
      summary.byStatus[transaction.status]++;
      
      // By currency
      if (!summary.byCurrency[transaction.currency]) {
        summary.byCurrency[transaction.currency] = 0;
      }
      summary.byCurrency[transaction.currency]++;
    });
    
    return summary;
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Format amount with currency
  const formatAmount = (amount: number, currency: string): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
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
  
  // Export report as CSV
  const handleExportReport = () => {
    if (!reportData) return;
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    csvContent += 'Type,Amount,Currency,Description,From Account,To Account,Status,Created At\n';
    
    // Add transaction data
    reportData.transactions.forEach(transaction => {
      const row = [
        t(`transaction.type.${transaction.type}`),
        transaction.amount,
        transaction.currency,
        transaction.description,
        transaction.fromAccount || '',
        transaction.toAccount || '',
        t(`transaction.status.${transaction.status}`),
        new Date(transaction.createdAt).toLocaleString('fr-FR')
      ];
      
      csvContent += row.map(value => `"${value}"`).join(',') + '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `report_${formatDate(reportData.dateRange.startDate)}_${formatDate(reportData.dateRange.endDate)}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };
  
  // Print report
  const handlePrintReport = () => {
    window.print();
  };
  
  // Render summary report
  const renderSummaryReport = () => {
    if (!reportData) return null;
    
    return (
      <Stack spacing="lg">
        <Grid>
          <Grid.Col span={6}>
            <Paper p="md" withBorder>
              <Text weight={700} mb="xs">{t('reports.totalTransactions')}</Text>
              <Text size="xl">{reportData.summary.totalCount}</Text>
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Paper p="md" withBorder>
              <Text weight={700} mb="xs">{t('reports.totalAmount')}</Text>
              {Object.entries(reportData.summary.totalAmount).map(([currency, amount]) => (
                <Text key={currency} size="xl">{formatAmount(amount, currency)}</Text>
              ))}
            </Paper>
          </Grid.Col>
        </Grid>
        
        <Grid>
          <Grid.Col span={4}>
            <Paper p="md" withBorder>
              <Text weight={700} mb="md">{t('reports.byType')}</Text>
              {Object.entries(reportData.summary.byType).map(([type, count]) => (
                <Group key={type} position="apart" mb="xs">
                  <Badge color={getTransactionTypeColor(type as TransactionType)}>
                    {t(`transaction.type.${type}`)}
                  </Badge>
                  <Text>{count}</Text>
                </Group>
              ))}
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <Paper p="md" withBorder>
              <Text weight={700} mb="md">{t('reports.byStatus')}</Text>
              {Object.entries(reportData.summary.byStatus).map(([status, count]) => (
                <Group key={status} position="apart" mb="xs">
                  <Badge color={getTransactionStatusColor(status as TransactionStatus)}>
                    {t(`transaction.status.${status}`)}
                  </Badge>
                  <Text>{count}</Text>
                </Group>
              ))}
            </Paper>
          </Grid.Col>
          
          <Grid.Col span={4}>
            <Paper p="md" withBorder>
              <Text weight={700} mb="md">{t('reports.byCurrency')}</Text>
              {Object.entries(reportData.summary.byCurrency).map(([currency, count]) => (
                <Group key={currency} position="apart" mb="xs">
                  <Text>{currency}</Text>
                  <Text>{count}</Text>
                </Group>
              ))}
            </Paper>
          </Grid.Col>
        </Grid>
      </Stack>
    );
  };
  
  // Render detailed report
  const renderDetailedReport = (transactions: Transaction[]) => {
    if (!reportData) return null;
    
    return (
      <Table>
        <thead>
          <tr>
            <th>{t('transaction.type')}</th>
            <th>{t('transaction.amount')}</th>
            <th>{t('transaction.description')}</th>
            <th>{t('transaction.fromAccount')}</th>
            <th>{t('transaction.toAccount')}</th>
            <th>{t('transaction.status')}</th>
            <th>{t('transaction.createdAt')}</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>
                <Badge color={getTransactionTypeColor(transaction.type)}>
                  {t(`transaction.type.${transaction.type}`)}
                </Badge>
              </td>
              <td>
                {formatAmount(transaction.amount, transaction.currency)}
              </td>
              <td>{transaction.description}</td>
              <td>{transaction.fromAccount || '-'}</td>
              <td>{transaction.toAccount || '-'}</td>
              <td>
                <Badge color={getTransactionStatusColor(transaction.status)}>
                  {t(`transaction.status.${transaction.status}`)}
                </Badge>
              </td>
              <td>{new Date(transaction.createdAt).toLocaleString('fr-FR')}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };
  
  const filteredTransactions = useMemo(() => {
    if (!reportData) return [];
    
    return reportData.transactions.filter(transaction => {
      const matchesCurrency = selectedCurrency === 'all' || transaction.currency === selectedCurrency;
      const matchesType = selectedType === 'all' || transaction.type === selectedType;
      const matchesStatus = selectedStatus === 'all' || transaction.status === selectedStatus;
      
      return matchesCurrency && matchesType && matchesStatus;
    });
  }, [reportData, selectedCurrency, selectedType, selectedStatus]);
  
  return (
    <Container size="xl">
      <Title order={2} mb="xl">{t('reports.title')}</Title>
      
      <Paper withBorder p="md" mb="xl">
        <Group position="apart" mb="md">
          <Title order={4}>{t('reports.dateRange')}</Title>
          <Button 
            variant="subtle" 
            compact 
            onClick={() => {
              setStartDate(subDays(new Date(), 30));
              setEndDate(new Date());
            }}
          >
            {t('reports.last30Days')}
          </Button>
        </Group>
        
        <Group grow mb="md">
          <DateInput
            label={t('reports.startDate')}
            placeholder={t('reports.selectDate')}
            value={startDate}
            onChange={setStartDate}
            maxDate={endDate || undefined}
          />
          <DateInput
            label={t('reports.endDate')}
            placeholder={t('reports.selectDate')}
            value={endDate}
            onChange={setEndDate}
            minDate={startDate || undefined}
          />
        </Group>
        
        <Group position="right">
          <Button 
            onClick={handleGenerateReport} 
            loading={isLoading}
            leftIcon={<IconReportAnalytics size={16} />}
          >
            {t('reports.generate')}
          </Button>
        </Group>
      </Paper>
      
      {reportData && (
        <>
          <Paper withBorder p="md" mb="md">
            <Group position="apart" mb="md">
              <Group>
                <Title order={4}>
                  {t('reports.reportFor')} {formatDate(reportData.dateRange.startDate)} - {formatDate(reportData.dateRange.endDate)}
                </Title>
                <Badge>{reportData.transactions.length} {t('reports.transactions')}</Badge>
              </Group>
              
              <Group>
                <Button 
                  variant="outline" 
                  leftIcon={<IconFileExport size={16} />} 
                  onClick={handleExportReport}
                >
                  {t('reports.export')}
                </Button>
                <Button 
                  variant="outline" 
                  leftIcon={<IconPrinter size={16} />} 
                  onClick={handlePrintReport}
                >
                  {t('reports.print')}
                </Button>
              </Group>
            </Group>
            
            <Tabs value={activeTab} onTabChange={(value) => setActiveTab(value || 'summary')}>
              <Tabs.List>
                <Tabs.Tab value="summary" icon={<IconChartPie size={16} />}>
                  {t('reports.summary')}
                </Tabs.Tab>
                <Tabs.Tab value="detailed" icon={<IconList size={16} />}>
                  {t('reports.detailed')}
                </Tabs.Tab>
                <Tabs.Tab value="charts" icon={<IconChartBar size={16} />}>
                  {t('reports.charts')}
                </Tabs.Tab>
              </Tabs.List>
              
              <Tabs.Panel value="summary" pt="md">
                {renderSummaryReport()}
              </Tabs.Panel>
              
              <Tabs.Panel value="detailed" pt="md">
                <Group mb="md">
                  <Select
                    label={t('reports.filterByCurrency')}
                    value={selectedCurrency}
                    onChange={(value) => setSelectedCurrency(value || 'all')}
                    data={[
                      { value: 'all', label: t('reports.allCurrencies') },
                      ...Object.keys(reportData.summary.byCurrency).map(currency => ({
                        value: currency,
                        label: currency
                      }))
                    ]}
                    clearable={false}
                  />
                  
                  <Select
                    label={t('reports.filterByType')}
                    value={selectedType}
                    onChange={(value) => setSelectedType(value || 'all')}
                    data={[
                      { value: 'all', label: t('reports.allTypes') },
                      ...Object.keys(reportData.summary.byType).map(type => ({
                        value: type,
                        label: type
                      }))
                    ]}
                    clearable={false}
                  />
                  
                  <Select
                    label={t('reports.filterByStatus')}
                    value={selectedStatus}
                    onChange={(value) => setSelectedStatus(value || 'all')}
                    data={[
                      { value: 'all', label: t('reports.allStatuses') },
                      ...Object.keys(reportData.summary.byStatus).map(status => ({
                        value: status,
                        label: status
                      }))
                    ]}
                    clearable={false}
                  />
                </Group>
                
                {renderDetailedReport(filteredTransactions)}
              </Tabs.Panel>
              
              <Tabs.Panel value="charts" pt="md">
                <Grid>
                  <Grid.Col span={6}>
                    <Paper withBorder p="md">
                      <Title order={5} mb="md">{t('reports.transactionsByType')}</Title>
                      <PieChart data={Object.entries(reportData.summary.byType).map(([type, count]) => ({
                        name: type,
                        value: count,
                        color: getTransactionTypeColor(type as TransactionType)
                      }))} />
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col span={6}>
                    <Paper withBorder p="md">
                      <Title order={5} mb="md">{t('reports.transactionsByStatus')}</Title>
                      <PieChart data={Object.entries(reportData.summary.byStatus).map(([status, count]) => ({
                        name: status,
                        value: count,
                        color: getTransactionStatusColor(status as TransactionStatus)
                      }))} />
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </>
      )}
    </Container>
  );
} 