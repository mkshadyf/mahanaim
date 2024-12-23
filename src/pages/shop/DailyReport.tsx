import { useState } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  NumberInput,
  Button,
  Stack,
  Text,
  Divider,
  Grid,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../../hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import classes from './DailyReport.module.css';

interface DailyReportForm {
  // Electronic Money Balances
  mpesaBalanceUSD: number;
  mpesaBalanceFC: number;
  airtelBalanceUSD: number;
  airtelBalanceFC: number;
  vodacomBalanceUSD: number;
  mvBalanceUSD: number;

  // Cash Balances
  cashUSD: number;
  cashFC: number;

  // Transactions
  sendTransactionsUSD: number;
  sendTransactionsFC: number;
  receiveTransactionsUSD: number;
  receiveTransactionsFC: number;
}

export default function DailyReport() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const form = useForm<DailyReportForm>({
    initialValues: {
      mpesaBalanceUSD: 0,
      mpesaBalanceFC: 0,
      airtelBalanceUSD: 0,
      airtelBalanceFC: 0,
      vodacomBalanceUSD: 0,
      mvBalanceUSD: 0,
      cashUSD: 0,
      cashFC: 0,
      sendTransactionsUSD: 0,
      sendTransactionsFC: 0,
      receiveTransactionsUSD: 0,
      receiveTransactionsFC: 0,
    },
  });

  const handleSubmit = async (values: DailyReportForm) => {
    if (!user) return;

    try {
      setLoading(true);
      await addDoc(collection(db, 'dailyReports'), {
        ...values,
        userId: user.uid,
        shopId: user.shopId,
        timestamp: serverTimestamp(),
      });

      notifications.show({
        title: t('success'),
        message: t('dailyReportSubmitted'),
        color: 'green',
      });

      form.reset();
    } catch (error) {
      console.error('Error submitting daily report:', error);
      notifications.show({
        title: t('error'),
        message: t('errorSubmittingReport'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="md">
      <Title order={2} className={classes.title}>
        {t('dailyReport')}
      </Title>

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Paper withBorder radius="md" className={classes.paper}>
          <LoadingOverlay visible={loading} />
          <Stack gap="xl">
            {/* Electronic Money Balances */}
            <div>
              <Text className={classes.sectionTitle}>
                {t('electronicBalance')}
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label="M-Pesa USD"
                    placeholder="0"
                    decimalSeparator="."
                    min={0}
                    step={0.01}
                    {...form.getInputProps('mpesaBalanceUSD')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="M-Pesa FC"
                    placeholder="0"
                    min={0}
                    {...form.getInputProps('mpesaBalanceFC')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Airtel USD"
                    placeholder="0"
                    decimalSeparator="."
                    min={0}
                    step={0.01}
                    {...form.getInputProps('airtelBalanceUSD')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Airtel FC"
                    placeholder="0"
                    min={0}
                    {...form.getInputProps('airtelBalanceFC')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Vodacom USD"
                    placeholder="0"
                    decimalSeparator="."
                    min={0}
                    step={0.01}
                    {...form.getInputProps('vodacomBalanceUSD')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="MV USD"
                    placeholder="0"
                    decimalSeparator="."
                    min={0}
                    step={0.01}
                    {...form.getInputProps('mvBalanceUSD')}
                  />
                </Grid.Col>
              </Grid>
            </div>

            <Divider />

            {/* Cash Balances */}
            <div>
              <Text className={classes.sectionTitle}>
                {t('cashBalance')}
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label={t('cashUSD')}
                    placeholder="0"
                    decimalSeparator="."
                    min={0}
                    step={0.01}
                    {...form.getInputProps('cashUSD')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label={t('cashFC')}
                    placeholder="0"
                    min={0}
                    {...form.getInputProps('cashFC')}
                  />
                </Grid.Col>
              </Grid>
            </div>

            <Divider />

            {/* Transactions */}
            <div>
              <Text className={classes.sectionTitle}>
                {t('dailyTransactions')}
              </Text>
              <Grid>
                <Grid.Col span={6}>
                  <NumberInput
                    label={t('sendUSD')}
                    placeholder="0"
                    decimalSeparator="."
                    min={0}
                    step={0.01}
                    {...form.getInputProps('sendTransactionsUSD')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label={t('sendFC')}
                    placeholder="0"
                    min={0}
                    {...form.getInputProps('sendTransactionsFC')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label={t('receiveUSD')}
                    placeholder="0"
                    decimalSeparator="."
                    min={0}
                    step={0.01}
                    {...form.getInputProps('receiveTransactionsUSD')}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label={t('receiveFC')}
                    placeholder="0"
                    min={0}
                    {...form.getInputProps('receiveTransactionsFC')}
                  />
                </Grid.Col>
              </Grid>
            </div>

            <Group justify="flex-end">
              <Button type="submit" loading={loading}>
                {t('submit')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      </form>
    </Container>
  );
}
