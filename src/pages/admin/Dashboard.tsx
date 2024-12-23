import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Paper,
  Text,
  Group,
  SimpleGrid,
  RingProgress,
  Center,
  Stack,
  Button,
  Select,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { DatesProvider, DatePickerInput } from '@mantine/dates';
import type { DateValue } from '@mantine/dates';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { useTransaction } from '@/hooks/useTransaction';
import type { TransactionStats } from '@/types/transaction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Transaction Volume',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { getTransactionStats, loading } = useTransaction();
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'FC'>('USD');

  const chartData: ChartData<'line'> = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        label: 'Send',
        data: [65, 59, 80, 81, 56, 55, 40],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Receive',
        data: [28, 48, 40, 19, 86, 27, 90],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  useEffect(() => {
    const fetchStats = async () => {
      const [startDate, endDate] = dateRange;
      const stats = await getTransactionStats(
        undefined,
        startDate || undefined,
        endDate || undefined
      );
      if (stats) setStats(stats);
    };

    void fetchStats();
  }, [dateRange, getTransactionStats]);

  const handleDateChange = (value: DateValue) => {
    if (Array.isArray(value) && value.length === 2) {
      setDateRange([value[0], value[1]]);
    }
  };

  return (
    <Container fluid>
      <Group position="apart" mb="xl">
        <Title order={2}>{t('dashboard')}</Title>
        <Group>
          <Select
            value={selectedCurrency}
            onChange={(value: 'USD' | 'FC') => setSelectedCurrency(value)}
            data={[
              { value: 'USD', label: 'USD' },
              { value: 'FC', label: 'FC' },
            ]}
          />
          <DatesProvider settings={{ locale: 'en' }}>
            <DatePickerInput
              type="range"
              value={dateRange}
              onChange={handleDateChange}
              placeholder={t('selectDateRange')}
              clearable
            />
          </DatesProvider>
          <Button
            onClick={() => {
              setDateRange([null, null]);
            }}
          >
            {t('reset')}
          </Button>
        </Group>
      </Group>

      <SimpleGrid
        cols={3}
        breakpoints={[
          { maxWidth: 'md', cols: 2 },
          { maxWidth: 'sm', cols: 1 },
        ]}
      >
        <Paper withBorder radius="md" p="md">
          <Stack align="center" spacing="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              {t('totalTransactions')}
            </Text>
            <Title order={3}>{stats?.count || 0}</Title>
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Stack align="center" spacing="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              {t('totalVolume')} ({selectedCurrency})
            </Text>
            <Title order={3}>
              {selectedCurrency === 'USD' ? '$' : 'FC'}{' '}
              {((stats?.volume[selectedCurrency] || 0) + (stats?.fees[selectedCurrency] || 0)).toLocaleString()}
            </Title>
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Stack align="center" spacing="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              {t('successRate')}
            </Text>
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[{ value: stats?.success_rate || 0, color: 'blue' }]}
              label={
                <Center>
                  <Text weight={700} size="sm">
                    {Math.round(stats?.success_rate || 0)}%
                  </Text>
                </Center>
              }
            />
          </Stack>
        </Paper>
      </SimpleGrid>

      <Paper withBorder radius="md" p="md" mt="md">
        <Line options={chartOptions} data={chartData} />
      </Paper>
    </Container>
  );
}
