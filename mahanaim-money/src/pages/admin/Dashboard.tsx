import { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Select,
  SimpleGrid,
  RingProgress,
  Center,
  Box,
  LoadingOverlay,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
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
import { notifications } from '@mantine/notifications';
import classes from './Dashboard.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

interface ShopStats {
  totalTransactions: number;
  totalVolume: number;
  pendingReports: number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<string>('7d');
  const [stats, setStats] = useState<ShopStats>({
    totalTransactions: 0,
    totalVolume: 0,
    pendingReports: 0,
  });
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: 'Transaction Volume (USD)',
        data: [],
        borderColor: '#228be6',
        backgroundColor: 'rgba(34, 139, 230, 0.1)',
        tension: 0.4,
      },
    ],
  });
  const { t } = useTranslation();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        where(
          'date',
          '>=',
          new Date(Date.now() - getTimeframeInDays(timeframe) * 24 * 60 * 60 * 1000)
        )
      );
      const querySnapshot = await getDocs(q);
      const reports = querySnapshot.docs.map((doc) => doc.data());

      // Calculate stats
      const totalTransactions = reports.reduce(
        (sum, report) => sum + (report.totalTransactionsUSD || 0),
        0
      );
      const totalVolume = reports.reduce((sum, report) => sum + (report.totalBalanceUSD || 0), 0);
      const pendingReports = reports.filter((report) => !report.reviewed).length;

      setStats({
        totalTransactions,
        totalVolume,
        pendingReports,
      });

      // Prepare chart data
      const dates = reports.map((report) => {
        const date = report.date.toDate();
        return date.toLocaleDateString();
      });
      const volumes = reports.map((report) => report.totalBalanceUSD || 0);

      setChartData({
        labels: dates,
        datasets: [
          {
            ...chartData.datasets[0],
            data: volumes,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      notifications.show({
        title: t('error'),
        message: t('errorFetchingStats'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [timeframe]);

  const getTimeframeInDays = (timeframe: string): number => {
    switch (timeframe) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      default:
        return 7;
    }
  };

  return (
    <Container size="lg">
      <Box className={classes.header}>
        <Title order={2}>{t('dashboard')}</Title>
        <Select
          value={timeframe}
          onChange={(value) => setTimeframe(value || '7d')}
          data={[
            { value: '7d', label: t('last7Days') },
            { value: '30d', label: t('last30Days') },
            { value: '90d', label: t('last90Days') },
          ]}
          className={classes.select}
        />
      </Box>

      <SimpleGrid cols={3} mb="xl">
        <Paper withBorder p="md" radius="md">
          <Text className={classes.statTitle}>
            {t('totalTransactions')}
          </Text>
          <Text className={classes.statValue}>
            {stats.totalTransactions.toLocaleString()}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Text className={classes.statTitle}>
            {t('totalVolume')}
          </Text>
          <Text className={classes.statValue}>
            ${stats.totalVolume.toLocaleString()}
          </Text>
        </Paper>

        <Paper withBorder p="md" radius="md">
          <Text className={classes.statTitle}>
            {t('pendingReports')}
          </Text>
          <Text className={classes.statValue}>
            {stats.pendingReports.toLocaleString()}
          </Text>
        </Paper>
      </SimpleGrid>

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={loading} />
        <Title order={3} mb="lg">
          {t('transactionVolume')}
        </Title>
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: (value) => `$${value}`,
                },
              },
            },
          }}
        />
      </Paper>
    </Container>
  );
}
