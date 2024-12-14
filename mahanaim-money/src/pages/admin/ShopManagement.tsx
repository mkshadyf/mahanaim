import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Button,
  Group,
  Table,
  ActionIcon,
  Text,
  Modal,
  NumberInput,
  Stack,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';

interface Shop {
  id: string;
  name: string;
  location: string;
  initialCapitalUSD: number;
  initialCapitalFC: number;
}

interface ShopForm {
  name: string;
  location: string;
  initialCapitalUSD: number;
  initialCapitalFC: number;
}

export default function ShopManagement() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const { t } = useTranslation();

  const form = useForm<ShopForm>({
    initialValues: {
      name: '',
      location: '',
      initialCapitalUSD: 5000,
      initialCapitalFC: 5000000,
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
      location: (value) => (value.length < 2 ? 'Location must have at least 2 letters' : null),
      initialCapitalUSD: (value) => (value < 0 ? 'Capital cannot be negative' : null),
      initialCapitalFC: (value) => (value < 0 ? 'Capital cannot be negative' : null),
    },
  });

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const shopsRef = collection(db, 'shops');
      const snapshot = await getDocs(shopsRef);
      const shopsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Shop[];
      setShops(shopsList);
    } catch (error) {
      console.error('Error fetching shops:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch shops',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: ShopForm) => {
    try {
      setLoading(true);
      if (editingShop) {
        await updateDoc(doc(db, 'shops', editingShop.id), values);
        notifications.show({
          title: 'Success',
          message: 'Shop updated successfully',
          color: 'green',
        });
      } else {
        await addDoc(collection(db, 'shops'), values);
        notifications.show({
          title: 'Success',
          message: 'Shop created successfully',
          color: 'green',
        });
      }
      form.reset();
      setModalOpened(false);
      setEditingShop(null);
      fetchShops();
    } catch (error) {
      console.error('Error saving shop:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to save shop',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shop: Shop) => {
    setEditingShop(shop);
    form.setValues(shop);
    setModalOpened(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'shops', id));
        notifications.show({
          title: 'Success',
          message: 'Shop deleted successfully',
          color: 'green',
        });
        fetchShops();
      } catch (error) {
        console.error('Error deleting shop:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete shop',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container fluid>
      <Group position="apart" mb="md">
        <Title order={2}>{t('shops')}</Title>
        <Button
          onClick={() => {
            form.reset();
            setEditingShop(null);
            setModalOpened(true);
          }}
        >
          {t('addShop')}
        </Button>
      </Group>

      <Paper withBorder radius="md" p="md">
        <Table>
          <thead>
            <tr>
              <th>{t('name')}</th>
              <th>{t('location')}</th>
              <th>{t('initialCapitalUSD')}</th>
              <th>{t('initialCapitalFC')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((shop) => (
              <tr key={shop.id}>
                <td>{shop.name}</td>
                <td>{shop.location}</td>
                <td>${shop.initialCapitalUSD.toLocaleString()}</td>
                <td>FC {shop.initialCapitalFC.toLocaleString()}</td>
                <td>
                  <Group spacing={0} position="left">
                    <ActionIcon onClick={() => handleEdit(shop)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon color="red" onClick={() => handleDelete(shop.id)}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </td>
              </tr>
            ))}
            {shops.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <Text align="center" color="dimmed">
                    {t('noShops')}
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title={editingShop ? t('editShop') : t('addShop')}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              required
              label={t('name')}
              placeholder={t('enterShopName')}
              {...form.getInputProps('name')}
            />
            <TextInput
              required
              label={t('location')}
              placeholder={t('enterShopLocation')}
              {...form.getInputProps('location')}
            />
            <NumberInput
              required
              label={t('initialCapitalUSD')}
              placeholder="5000"
              min={0}
              {...form.getInputProps('initialCapitalUSD')}
            />
            <NumberInput
              required
              label={t('initialCapitalFC')}
              placeholder="5000000"
              min={0}
              {...form.getInputProps('initialCapitalFC')}
            />
            <Button type="submit" loading={loading}>
              {editingShop ? t('update') : t('create')}
            </Button>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
