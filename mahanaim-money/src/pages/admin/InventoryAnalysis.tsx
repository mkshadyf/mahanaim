import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Text,
  Group,
  SegmentedControl,
  Stack,
  RingProgress,
  Center,
  Grid,
  LoadingOverlay,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { notifications } from '@mantine/notifications';
import classes from './InventoryAnalysis.module.css';

interface BalanceTotals {
  electronic: {
    usd: number;
    fc: number;
  };
  cash: {
    usd: number;
    fc: number;
  };
  total: {
    usd: number;
    fc: number;
  };
}

export default function InventoryAnalysis() {
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<'usd' | 'fc'>('usd');
  const [totals, setTotals] = useState<BalanceTotals | null>(null);
  const { t } = useTranslation();

  const fetchTotals = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'dailyReports'));
      const reports = querySnapshot.docs.map((doc) => doc.data());

      const totals: BalanceTotals = {
        electronic: {
          usd:
            reports.reduce(
              (sum, report) =>
                sum +
                (report.mpesaBalanceUSD || 0) +
                (report.airtelBalanceUSD || 0) +
                (report.vodacomBalanceUSD || 0) +
                (report.mvBalanceUSD || 0),
              0
            ),
          fc: reports.reduce(
            (sum, report) =>
              sum + (report.mpesaBalanceFC || 0) + (report.airtelBalanceFC || 0),
            0
          ),
        },
        cash: {
          usd: reports.reduce((sum, report) => sum + (report.cashUSD || 0), 0),
          fc: reports.reduce((sum, report) => sum + (report.cashFC || 0), 0),
        },
        total: {
          usd: 0,
          fc: 0,
        },
      };

      totals.total.usd = totals.electronic.usd + totals.cash.usd;
      totals.total.fc = totals.electronic.fc + totals.cash.fc;

      setTotals(totals);
    } catch (error) {
      console.error('Error fetching totals:', error);
      notifications.show({
        title: t('error'),
        message: t('errorFetchingTotals'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTotals();
  }, []);

  return (
    <Container size="lg">
      <Group className={classes.header}>
        <Title order={2}>{t('inventoryAnalysis')}</Title>
        <SegmentedControl
          value={currency}
          onChange={(value) => setCurrency(value as 'usd' | 'fc')}
          data={[
            { label: 'USD', value: 'usd' },
            { label: 'FC', value: 'fc' },
          ]}
        />
      </Group>

      {totals && (
        <Grid mb="xl">
          <Grid.Col span={4}>
            <Paper withBorder p="md" radius="md" className={classes.paper}>
              <Stack align="center" gap="xs">
                <Text className={classes.statTitle}>
                  {t('electronicBalance')}
                </Text>
                <RingProgress
                  size={120}
                  roundCaps
                  thickness={12}
                  sections={[
                    {
                      value: (totals.electronic[currency] / totals.total[currency]) * 100,
                      color: 'blue',
                    },
                  ]}
                  label={
                    <Center>
                      <Text className={classes.statLabel}>
                        {currency === 'usd' ? '$' : 'FC'}
                        {currency === 'usd'
                          ? totals.electronic[currency].toFixed(2)
                          : totals.electronic[currency].toLocaleString()}
                      </Text>
                    </Center>
                  }
                />
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper withBorder p="md" radius="md" className={classes.paper}>
              <Stack align="center" gap="xs">
                <Text className={classes.statTitle}>
                  {t('cashBalance')}
                </Text>
                <RingProgress
                  size={120}
                  roundCaps
                  thickness={12}
                  sections={[
                    {
                      value: (totals.cash[currency] / totals.total[currency]) * 100,
                      color: 'green',
                    },
                  ]}
                  label={
                    <Center>
                      <Text className={classes.statLabel}>
                        {currency === 'usd' ? '$' : 'FC'}
                        {currency === 'usd'
                          ? totals.cash[currency].toFixed(2)
                          : totals.cash[currency].toLocaleString()}
                      </Text>
                    </Center>
                  }
                />
              </Stack>
            </Paper>
          </Grid.Col>
          <Grid.Col span={4}>
            <Paper withBorder p="md" radius="md" className={classes.paper}>
              <Stack align="center" gap="xs">
                <Text className={classes.statTitle}>
                  {t('totalBalance')}
                </Text>
                <RingProgress
                  size={120}
                  roundCaps
                  thickness={12}
                  sections={[
                    {
                      value: 100,
                      color: 'violet',
                    },
                  ]}
                  label={
                    <Center>
                      <Text className={classes.statLabel}>
                        {currency === 'usd' ? '$' : 'FC'}
                        {currency === 'usd'
                          ? totals.total[currency].toFixed(2)
                          : totals.total[currency].toLocaleString()}
                      </Text>
                    </Center>
                  }
                />
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
      )}

      <Paper withBorder p="md" radius="md" className={classes.paper}>
        <LoadingOverlay visible={loading} />
        {/* Add detailed breakdown tables here */}
      </Paper>
    </Container>
  );
}
