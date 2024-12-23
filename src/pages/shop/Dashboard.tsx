import { useEffect, useState } from 'react';
import {
  Container,
  Title,
  Grid,
  Paper,
  Text,
  Group,
  RingProgress,
  Stack,
  Center,
  Button,
  Modal,
  NumberInput,
  Select,
  TextInput,
  SegmentedControl,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTransaction } from '@/hooks/useTransaction';
import type { TransactionStats, TransactionInput, Money } from '@/types/transaction';

interface TransactionForm {
  type: 'send' | 'receive';
  amount: number;
  currency: 'USD' | 'FC';
  recipientName: string;
  recipientContact?: string;
  notes?: string;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { createTransaction, getTransactionStats, loading } = useTransaction();
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'FC'>('USD');

  const form = useForm<TransactionForm>({
    initialValues: {
      type: 'send',
      amount: 0,
      currency: 'USD',
      recipientName: '',
      recipientContact: '',
      notes: '',
    },
    validate: {
      amount: (value: number) => (value <= 0 ? t('invalidAmount') : null),
      recipientName: (value: string) => (!value ? t('recipientRequired') : null),
    },
  });

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const stats = await getTransactionStats(undefined, today);
      if (stats) setStats(stats);
    };

    void fetchStats();
  }, [getTransactionStats]);

  const handleSubmit = async (values: TransactionForm) => {
    if (!user) return;

    const amount: Money = {
      amount: values.amount,
      currency: values.currency,
    };

    const input: TransactionInput = {
      type: values.type,
      amount,
      sender: {
        type: values.type === 'send' ? 'shop' : 'customer',
        name: values.type === 'send' ? user.displayName || user.email || 'Shop' : values.recipientName,
      },
      receiver: {
        type: values.type === 'receive' ? 'shop' : 'customer',
        name: values.type === 'receive' ? user.displayName || user.email || 'Shop' : values.recipientName,
        contact: values.recipientContact,
      },
      metadata: {
        platform: 'web',
        deviceId: 'shop-dashboard',
      },
      notes: values.notes,
    };

    const result = await createTransaction(input);
    if (result) {
      setModalOpened(false);
      form.reset();
    }
  };

  return (
    <Container size="lg">
      <Group position="apart" mb="xl">
        <Title order={2}>{t('dashboard')}</Title>
        <Group>
          <SegmentedControl
            value={selectedCurrency}
            onChange={(value: 'USD' | 'FC') => setSelectedCurrency(value)}
            data={[
              { label: 'USD', value: 'USD' },
              { label: 'FC', value: 'FC' },
            ]}
          />
          <Button onClick={() => setModalOpened(true)}>{t('newTransaction')}</Button>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={4}>
          <Paper withBorder p="md" radius="md">
            <Stack align="center" spacing="xs">
              <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
                {t('totalTransactions')}
              </Text>
              <Title order={3}>{stats?.count || 0}</Title>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper withBorder p="md" radius="md">
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
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper withBorder p="md" radius="md">
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
        </Grid.Col>
      </Grid>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={t('newTransaction')}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <Select
              label={t('transactionType')}
              data={[
                { value: 'send', label: t('send') },
                { value: 'receive', label: t('receive') },
              ]}
              {...form.getInputProps('type')}
            />

            <Group grow>
              <NumberInput
                label={t('amount')}
                placeholder="0.00"
                precision={2}
                min={0}
                {...form.getInputProps('amount')}
              />
              <Select
                label={t('currency')}
                data={[
                  { value: 'USD', label: 'USD' },
                  { value: 'FC', label: 'FC' },
                ]}
                {...form.getInputProps('currency')}
              />
            </Group>

            <TextInput
              label={t('recipientName')}
              placeholder={t('enterRecipientName')}
              {...form.getInputProps('recipientName')}
            />

            <TextInput
              label={t('recipientContact')}
              placeholder={t('enterRecipientContact')}
              {...form.getInputProps('recipientContact')}
            />

            <TextInput
              label={t('notes')}
              placeholder={t('enterNotes')}
              {...form.getInputProps('notes')}
            />

            <Button type="submit" loading={loading}>
              {t('submit')}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
} 