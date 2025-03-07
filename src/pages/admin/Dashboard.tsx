import { useTransaction } from '@/hooks/useTransaction';
import type { TransactionStats } from '@/types/transaction';
import {
    Button,
    Center,
    Container,
    Group,
    Paper,
    RingProgress,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import type { DatesRangeValue } from '@mantine/dates';
import { DatePickerInput, DatesProvider } from '@mantine/dates';
import type { ChartData, ChartOptions } from 'chart.js';
import {
    CategoryScale,
    Chart as ChartJS,
    Title as ChartTitle,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

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
  const { getTransactionStats } = useTransaction();
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
      if (stats) setStats(stats as any);
    };

    void fetchStats();
  }, [dateRange, getTransactionStats]);

  const handleDateChange = (value: DatesRangeValue) => {
    setDateRange(value);
  };

  return (
    <Container fluid>
      <Group align="center" position="apart" mb="xl">
        <Title order={2}>{t('dashboard')}</Title>
        <Group>
          <Select
            value={selectedCurrency}
            onChange={(value: string | null) => setSelectedCurrency(value as 'USD' | 'FC')}
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
        spacing="md"
      >
        <Paper withBorder radius="md" p="md">
          <Stack align="center" justify="center" spacing={7}>
            <Text size="xs" color="dimmed" fw={700}>
              {t('totalTransactions')}
            </Text>
            <Title order={3}>{stats?.count || 0}</Title>
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Stack align="center" justify="center" spacing={7}>
            <Text size="xs" color="dimmed" fw={700}>
              {t('totalVolume')} ({selectedCurrency})
            </Text>
            <Title order={3}>
              {selectedCurrency === 'USD' ? '$' : 'FC'}{' '}
              {((stats?.volume?.[selectedCurrency] || 0) + (stats?.fees?.[selectedCurrency] || 0)).toLocaleString()}
            </Title>
          </Stack>
        </Paper>

        <Paper withBorder radius="md" p="md">
          <Stack align="center" justify="center" spacing={7}>
            <Text size="xs" color="dimmed" fw={700}>
              {t('successRate')}
            </Text>
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[{ value: stats?.success_rate || 0, color: 'blue' }]}
              label={
                <Center>
                  <Text fw={700} size="sm">
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
