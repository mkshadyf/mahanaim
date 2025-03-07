import { useAuth } from '@/hooks/useAuth';
import { useTransaction } from '@/hooks/useTransaction';
import { TransactionStatus, TransactionType } from '@/types';
import {
  Button,
  Center,
  Container,
  Grid,
  Group,
  Text as MantineText,
  Modal,
  NumberInput,
  Paper,
  RingProgress,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Mock transaction service functions
const createTransaction = async (input: any) => {
  // This would normally call a service
  console.log('Creating transaction:', input);
  return { id: 'mock-id-' + Date.now() };
};

interface TransactionForm {
  type: 'send' | 'receive';
  amount: number;
  currency: 'USD' | 'FC';
  recipientName: string;
  recipientContact?: string;
  notes?: string;
}

interface TransactionStats {
  count: number;
  volume: Record<string, number>;
  fees: Record<string, number>;
  successRate: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  useTransaction();
  const [stats, setStats] = useState<any>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'FC'>('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    fetchStats();
  }, [selectedCurrency]);

  const fetchStats = async () => {
    try {
      // Mock stats data
      const mockStats: TransactionStats = {
        count: 125,
        volume: { USD: 5250.75, FC: 12500000 },
        fees: { USD: 125.25, FC: 250000 },
        successRate: 0.98
      };
      
      setStats(mockStats as any);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (values: TransactionForm) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      const input = {
        amount: values.amount,
        currency: values.currency,
        type: values.type.toUpperCase() as TransactionType,
        description: `${values.type === 'send' ? 'Sent to' : 'Received from'} ${values.recipientName}`,
        status: 'COMPLETED' as TransactionStatus,
        sender: {
          type: values.type === 'send' ? 'shop' : 'customer',
          name: values.type === 'send' ? (user?.displayName || user?.email || 'Shop') : values.recipientName,
          contact: values.type === 'send' ? (user?.phoneNumber || '') : values.recipientContact,
        },
        receiver: {
          type: values.type === 'send' ? 'customer' : 'shop',
          name: values.type === 'send' ? values.recipientName : (user?.displayName || user?.email || 'Shop'),
          contact: values.recipientContact,
        },
        metadata: {
          platform: 'web',
          deviceId: 'shop-dashboard',
        },
      };

      const result = await createTransaction(input);
      if (result) {
        notifications.show({
          title: t('transactionSuccess'),
          message: t('transactionCreatedSuccessfully'),
          color: 'green',
        });
        setModalOpened(false);
        form.reset();
        // Refresh stats after successful transaction
        void fetchStats();
      }
    } catch (error) {
      notifications.show({
        title: t('transactionError'),
        message: error instanceof Error ? error.message : t('unknownError'),
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container size="lg">
      <Group align="center" position="apart" mb="xl">
        <Title order={2}>{t('dashboard')}</Title>
        <Group>
          <SegmentedControl
            value={selectedCurrency}
            onChange={(value: string) => setSelectedCurrency(value as 'USD' | 'FC')}
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
            <Stack align="center" justify="center" spacing={7}>
              <MantineText size="xs" color="dimmed" fw={700}>
                {t('totalTransactions')}
              </MantineText>
              <Title order={3}>{stats?.count || 0}</Title>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper withBorder p="md" radius="md">
            <Stack align="center" justify="center" spacing={7}>
              <MantineText size="xs" color="dimmed" fw={700}>
                {t('totalVolume')} ({selectedCurrency})
              </MantineText>
              <Title order={3}>
                {selectedCurrency === 'USD' ? '$' : 'FC'}{' '}
                {((stats?.volume?.[selectedCurrency] || 0) + (stats?.fees?.[selectedCurrency] || 0)).toLocaleString()}
              </Title>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper withBorder p="md" radius="md">
            <Stack align="center" justify="center" spacing={7}>
              <MantineText size="xs" color="dimmed" fw={700}>
                {t('successRate')}
              </MantineText>
              <RingProgress
                size={80}
                roundCaps
                thickness={8}
                sections={[{ value: stats?.success_rate || 0, color: 'blue' }]}
                label={
                  <Center>
                    <MantineText fw={700} size="sm">
                      {Math.round(stats?.success_rate || 0)}%
                    </MantineText>
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
        title={<Title order={3}>{t('newTransaction')}</Title>}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <SegmentedControl
              data={[
                { label: t('send'), value: 'send' },
                { label: t('receive'), value: 'receive' },
              ]}
              {...form.getInputProps('type')}
            />
            
            <NumberInput
              label={t('amount')}
              placeholder="0.00"
              precision={2}
              min={0.01}
              step={0.01}
              required
              icon={selectedCurrency === 'USD' ? '$' : 'FC'}
              {...form.getInputProps('amount')}
            />
            
            <Select
              label={t('currency')}
              data={[
                { label: 'USD', value: 'USD' },
                { label: 'FC', value: 'FC' },
              ]}
              required
              {...form.getInputProps('currency')}
            />
            
            <TextInput
              label={form.values.type === 'send' ? t('recipientName') : t('senderName')}
              placeholder={form.values.type === 'send' ? t('enterRecipientName') : t('enterSenderName')}
              required
              {...form.getInputProps('recipientName')}
            />
            
            <TextInput
              label={t('contactInformation')}
              placeholder={t('phoneOrEmail')}
              {...form.getInputProps('recipientContact')}
            />
            
            <Textarea
              label={t('notes')}
              placeholder={t('optionalNotes')}
              {...form.getInputProps('notes')}
            />
            
            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => setModalOpened(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {t('submit')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
} 