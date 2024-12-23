import { useTranslation } from 'react-i18next';
import {
  Modal,
  Group,
  Stack,
  Text,
  Badge,
  Divider,
  Button,
  Paper,
  Grid,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconCopy, IconPrinter } from '@tabler/icons-react';
import type { Transaction } from '@/types/transaction';

interface TransactionDetailsProps {
  transaction: Transaction;
  opened: boolean;
  onClose: () => void;
  onUpdateStatus?: (status: string) => Promise<void>;
}

interface CopyButtonRenderProps {
  copied: boolean;
  copy: () => void;
}

export function TransactionDetails({
  transaction,
  opened,
  onClose,
  onUpdateStatus,
}: TransactionDetailsProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: 'yellow',
      processing: 'blue',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray',
    };
    return colors[status] || 'gray';
  };

  const formatAmount = (amount: number, currency: string) => {
    return currency === 'USD'
      ? `$${amount.toLocaleString()}`
      : `FC ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('transactionDetails')}
      size="lg"
    >
      <Stack spacing="md">
        <Paper withBorder p="md">
          <Grid>
            <Grid.Col span={6}>
              <Stack spacing="xs">
                <Text size="sm" color="dimmed">
                  {t('transactionId')}
                </Text>
                <Group spacing="xs">
                  <Text weight={500}>{transaction.id}</Text>
                  <CopyButton value={transaction.id}>
                    {({ copied, copy }: CopyButtonRenderProps) => (
                      <Tooltip label={copied ? t('copied') : t('copy')}>
                        <ActionIcon size="sm" onClick={copy}>
                          <IconCopy size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={6}>
              <Stack spacing="xs" align="flex-end">
                <Text size="sm" color="dimmed">
                  {t('status')}
                </Text>
                <Badge color={getStatusColor(transaction.status)} size="lg">
                  {t(transaction.status)}
                </Badge>
              </Stack>
            </Grid.Col>
          </Grid>
        </Paper>

        <Paper withBorder p="md">
          <Stack spacing="md">
            <Text weight={500}>{t('amountDetails')}</Text>
            <Grid>
              <Grid.Col span={6}>
                <Stack spacing="xs">
                  <Text size="sm" color="dimmed">
                    {t('amount')}
                  </Text>
                  <Text size="lg" weight={700}>
                    {formatAmount(
                      transaction.amount.amount,
                      transaction.amount.currency
                    )}
                  </Text>
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack spacing="xs">
                  <Text size="sm" color="dimmed">
                    {t('fees')}
                  </Text>
                  <Text size="lg">
                    {formatAmount(
                      transaction.fees.total.amount,
                      transaction.fees.total.currency
                    )}
                  </Text>
                </Stack>
              </Grid.Col>

              {transaction.exchangeRate && (
                <Grid.Col span={12}>
                  <Stack spacing="xs">
                    <Text size="sm" color="dimmed">
                      {t('exchangeRate')}
                    </Text>
                    <Text>1 USD = {transaction.exchangeRate} FC</Text>
                  </Stack>
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Paper>

        <Paper withBorder p="md">
          <Stack spacing="md">
            <Text weight={500}>{t('partyDetails')}</Text>
            <Grid>
              <Grid.Col span={6}>
                <Stack spacing="xs">
                  <Text size="sm" color="dimmed">
                    {t('sender')}
                  </Text>
                  <Text>{transaction.sender.name}</Text>
                  {transaction.sender.contact && (
                    <Text size="sm" color="dimmed">
                      {transaction.sender.contact}
                    </Text>
                  )}
                </Stack>
              </Grid.Col>

              <Grid.Col span={6}>
                <Stack spacing="xs">
                  <Text size="sm" color="dimmed">
                    {t('receiver')}
                  </Text>
                  <Text>{transaction.receiver.name}</Text>
                  {transaction.receiver.contact && (
                    <Text size="sm" color="dimmed">
                      {transaction.receiver.contact}
                    </Text>
                  )}
                </Stack>
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>

        <Paper withBorder p="md">
          <Stack spacing="md">
            <Text weight={500}>{t('timestamps')}</Text>
            <Grid>
              <Grid.Col span={6}>
                <Stack spacing="xs">
                  <Text size="sm" color="dimmed">
                    {t('created')}
                  </Text>
                  <Text>
                    {formatDate(transaction.timestamps.created.toDate())}
                  </Text>
                </Stack>
              </Grid.Col>

              {transaction.timestamps.completed && (
                <Grid.Col span={6}>
                  <Stack spacing="xs">
                    <Text size="sm" color="dimmed">
                      {t('completed')}
                    </Text>
                    <Text>
                      {formatDate(transaction.timestamps.completed.toDate())}
                    </Text>
                  </Stack>
                </Grid.Col>
              )}
            </Grid>
          </Stack>
        </Paper>

        {transaction.notes && (
          <Paper withBorder p="md">
            <Stack spacing="xs">
              <Text weight={500}>{t('notes')}</Text>
              <Text>{transaction.notes}</Text>
            </Stack>
          </Paper>
        )}

        <Divider />

        <Group position="apart">
          <Button
            variant="subtle"
            leftIcon={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            {t('print')}
          </Button>

          {onUpdateStatus && transaction.status === 'pending' && (
            <Group>
              <Button
                variant="light"
                color="red"
                onClick={() => onUpdateStatus('cancelled')}
              >
                {t('cancel')}
              </Button>
              <Button onClick={() => onUpdateStatus('completed')}>
                {t('complete')}
              </Button>
            </Group>
          )}
        </Group>
      </Stack>
    </Modal>
  );
} 