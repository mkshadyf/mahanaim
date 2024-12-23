import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Button,
  Table,
  ActionIcon,
  Text,
  Modal,
  Stack,
  NumberInput,
  Select,
  Grid,
  Tabs,
  RingProgress,
  Box,
  LoadingOverlay,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import classes from './DebtManagement.module.css';

interface Debt {
  id: string;
  agentName: string;
  agentId?: string;
  amountUSD: number;
  amountFC: number;
  date: Date;
  type: 'receivable' | 'payable';
  notes?: string;
}

interface DebtForm {
  agentName: string;
  agentId?: string;
  amountUSD: number;
  amountFC: number;
  type: 'receivable' | 'payable';
  notes?: string;
}

interface DebtTotals {
  receivableUSD: number;
  receivableFC: number;
  payableUSD: number;
  payableFC: number;
}

export default function DebtManagement() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const { t } = useTranslation();

  const form = useForm<DebtForm>({
    initialValues: {
      agentName: '',
      amountUSD: 0,
      amountFC: 0,
      type: 'receivable',
      notes: '',
    },
  });

  const totals = debts.reduce<DebtTotals>(
    (acc, debt) => {
      if (debt.type === 'receivable') {
        acc.receivableUSD += debt.amountUSD;
        acc.receivableFC += debt.amountFC;
      } else {
        acc.payableUSD += debt.amountUSD;
        acc.payableFC += debt.amountFC;
      }
      return acc;
    },
    { receivableUSD: 0, receivableFC: 0, payableUSD: 0, payableFC: 0 }
  );

  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'debts'));
      const debtsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as Debt[];
      setDebts(debtsData);
    } catch (error) {
      console.error('Error fetching debts:', error);
      notifications.show({
        title: t('error'),
        message: t('errorFetchingDebts'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void fetchDebts();
  }, [fetchDebts]);

  const handleSubmit = async (values: DebtForm) => {
    try {
      setLoading(true);
      if (editingDebt) {
        await updateDoc(doc(db, 'debts', editingDebt.id), {
          ...values,
          date: new Date(),
        });
      } else {
        await addDoc(collection(db, 'debts'), {
          ...values,
          date: new Date(),
        });
      }

      notifications.show({
        title: t('success'),
        message: editingDebt ? t('debtUpdated') : t('debtAdded'),
        color: 'green',
      });

      setModalOpened(false);
      form.reset();
      setEditingDebt(null);
      void fetchDebts();
    } catch (error) {
      console.error('Error managing debt:', error);
      notifications.show({
        title: t('error'),
        message: t('errorManagingDebt'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    form.setValues({
      agentName: debt.agentName,
      agentId: debt.agentId,
      amountUSD: debt.amountUSD,
      amountFC: debt.amountFC,
      type: debt.type,
      notes: debt.notes,
    });
    setModalOpened(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'debts', id));
      notifications.show({
        title: t('success'),
        message: t('debtDeleted'),
        color: 'green',
      });
      void fetchDebts();
    } catch (error) {
      console.error('Error deleting debt:', error);
      notifications.show({
        title: t('error'),
        message: t('errorDeletingDebt'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    form.reset();
    setEditingDebt(null);
  };

  return (
    <Container size="lg">
      <Box className={classes.header}>
        <Title order={2}>{t('debtManagement')}</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingDebt(null);
            setModalOpened(true);
          }}
        >
          {t('addDebt')}
        </Button>
      </Box>

      <Grid mb="xl">
        <Grid.Col span={6}>
          <Paper withBorder p="md" radius="md" className={classes.paper}>
            <Text className={classes.statTitle}>
              {t('receivables')}
            </Text>
            <Box className={classes.statContainer}>
              <div>
                <Text className={classes.statValue}>
                  ${totals.receivableUSD.toFixed(2)}
                </Text>
                <Text className={classes.statSubtext}>
                  FC {totals.receivableFC.toLocaleString()}
                </Text>
              </div>
              <RingProgress
                size={80}
                roundCaps
                thickness={8}
                sections={[
                  {
                    value:
                      (totals.receivableUSD / (totals.receivableUSD + totals.payableUSD)) * 100 || 0,
                    color: 'blue',
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid.Col>
        <Grid.Col span={6}>
          <Paper withBorder p="md" radius="md" className={classes.paper}>
            <Text className={classes.statTitle}>
              {t('payables')}
            </Text>
            <Box className={classes.statContainer}>
              <div>
                <Text className={classes.statValue}>
                  ${totals.payableUSD.toFixed(2)}
                </Text>
                <Text className={classes.statSubtext}>
                  FC {totals.payableFC.toLocaleString()}
                </Text>
              </div>
              <RingProgress
                size={80}
                roundCaps
                thickness={8}
                sections={[
                  {
                    value:
                      (totals.payableUSD / (totals.receivableUSD + totals.payableUSD)) * 100 || 0,
                    color: 'red',
                  },
                ]}
              />
            </Box>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={loading} />
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value as 'receivable' | 'payable')}>
          <Tabs.List>
            <Tabs.Tab value="receivable">{t('receivables')}</Tabs.Tab>
            <Tabs.Tab value="payable">{t('payables')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="receivable">
            <Table mt="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('agent')}</Table.Th>
                  <Table.Th>{t('amountUSD')}</Table.Th>
                  <Table.Th>{t('amountFC')}</Table.Th>
                  <Table.Th>{t('date')}</Table.Th>
                  <Table.Th>{t('notes')}</Table.Th>
                  <Table.Th>{t('actions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {debts
                  .filter((debt) => debt.type === 'receivable')
                  .map((debt) => (
                    <Table.Tr key={debt.id}>
                      <Table.Td>{debt.agentName}</Table.Td>
                      <Table.Td>${debt.amountUSD.toFixed(2)}</Table.Td>
                      <Table.Td>FC {debt.amountFC.toLocaleString()}</Table.Td>
                      <Table.Td>{debt.date.toLocaleDateString()}</Table.Td>
                      <Table.Td>{debt.notes}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEdit(debt)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => void handleDelete(debt.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>

          <Tabs.Panel value="payable">
            <Table mt="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('agent')}</Table.Th>
                  <Table.Th>{t('amountUSD')}</Table.Th>
                  <Table.Th>{t('amountFC')}</Table.Th>
                  <Table.Th>{t('date')}</Table.Th>
                  <Table.Th>{t('notes')}</Table.Th>
                  <Table.Th>{t('actions')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {debts
                  .filter((debt) => debt.type === 'payable')
                  .map((debt) => (
                    <Table.Tr key={debt.id}>
                      <Table.Td>{debt.agentName}</Table.Td>
                      <Table.Td>${debt.amountUSD.toFixed(2)}</Table.Td>
                      <Table.Td>FC {debt.amountFC.toLocaleString()}</Table.Td>
                      <Table.Td>{debt.date.toLocaleDateString()}</Table.Td>
                      <Table.Td>{debt.notes}</Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => handleEdit(debt)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => void handleDelete(debt.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>
          </Tabs.Panel>
        </Tabs>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title={editingDebt ? t('editDebt') : t('addDebt')}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label={t('agentName')}
              placeholder={t('enterAgentName')}
              required
              {...form.getInputProps('agentName')}
            />
            <TextInput
              label={t('agentId')}
              placeholder={t('enterAgentId')}
              {...form.getInputProps('agentId')}
            />
            <Grid>
              <Grid.Col span={6}>
                <NumberInput
                  label={t('amountUSD')}
                  placeholder="0"
                  min={0}
                  step={0.01}
                  required
                  {...form.getInputProps('amountUSD')}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label={t('amountFC')}
                  placeholder="0"
                  min={0}
                  required
                  {...form.getInputProps('amountFC')}
                />
              </Grid.Col>
            </Grid>
            <Select
              label={t('type')}
              data={[
                { value: 'receivable', label: t('receivable') },
                { value: 'payable', label: t('payable') },
              ]}
              required
              {...form.getInputProps('type')}
            />
            <TextInput
              label={t('notes')}
              placeholder={t('enterNotes')}
              {...form.getInputProps('notes')}
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={handleCloseModal}>
                {t('cancel')}
              </Button>
              <Button type="submit" loading={loading}>
                {editingDebt ? t('update') : t('add')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
