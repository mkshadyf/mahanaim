import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  TextInput,
  Button,
  Table,
  Text,
  Badge,
  Avatar,
  Group,
  Modal,
  Stack,
  Select,
  Box,
  LoadingOverlay,
  useMantineTheme,
  MantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus } from '@tabler/icons-react';
import { collection, getDocs, addDoc, updateDoc, doc, FirestoreError } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'agent';
  shopId?: string;
}

interface UserForm {
  email: string;
  displayName: string;
  role: 'admin' | 'agent';
  shopId?: string;
}

interface Shop {
  value: string;
  label: string;
}

const useStyles = (theme: MantineTheme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  paper: {
    position: 'relative',
    padding: theme.spacing.md,
  },
  userName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,
  },
  userEmail: {
    fontSize: theme.fontSizes.sm,
  },
  userShop: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.gray[6],
  },
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.colors.gray[0],
    },
  },
});

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const styles = useStyles(theme);

  const form = useForm<UserForm>({
    initialValues: {
      email: '',
      displayName: '',
      role: 'agent',
      shopId: '',
    },
    validate: {
      email: (value) => {
        if (!value) return t('emailRequired');
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return t('invalidEmail');
        }
        return null;
      },
      displayName: (value) => (!value ? t('displayNameRequired') : null),
      role: (value) => (!value ? t('roleRequired') : null),
    },
  });

  const handleError = (error: unknown) => {
    console.error('Error:', error);
    if (error instanceof FirestoreError) {
      notifications.show({
        title: t('error'),
        message: t(`firestore.${error.code}`) || error.message,
        color: 'red',
      });
    } else {
      notifications.show({
        title: t('error'),
        message: t('unknownError'),
        color: 'red',
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'shops'));
      const shopsData = querySnapshot.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().name,
      }));
      setShops(shopsData);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchShops();
  }, []);

  const handleSubmit = async (values: UserForm) => {
    try {
      setLoading(true);
      if (editingUser) {
        const updateData = {
          ...values,
          shopId: values.role === 'admin' ? null : values.shopId,
        };
        await updateDoc(doc(db, 'users', editingUser.id), updateData);
        notifications.show({
          title: t('success'),
          message: t('userUpdated'),
          color: 'green',
        });
      } else {
        const newUserData = {
          ...values,
          shopId: values.role === 'admin' ? null : values.shopId,
        };
        await addDoc(collection(db, 'users'), newUserData);
        notifications.show({
          title: t('success'),
          message: t('userAdded'),
          color: 'green',
        });
      }

      setModalOpened(false);
      form.reset();
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setValues({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      shopId: user.shopId,
    });
    setModalOpened(true);
  };

  const closeModal = () => {
    setModalOpened(false);
    form.reset();
    setEditingUser(null);
  };

  return (
    <Container size="lg">
      <Box sx={styles.header}>
        <Title order={2}>{t('userManagement')}</Title>
        <Button
          leftIcon={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingUser(null);
            setModalOpened(true);
          }}
        >
          {t('addUser')}
        </Button>
      </Box>

      <Paper withBorder radius="md" sx={styles.paper}>
        <LoadingOverlay visible={loading} />
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('user')}</Table.Th>
              <Table.Th>{t('email')}</Table.Th>
              <Table.Th>{t('role')}</Table.Th>
              <Table.Th>{t('shop')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr
                key={user.id}
                onClick={() => handleEdit(user)}
                sx={styles.tableRow}
              >
                <Table.Td>
                  <Group spacing="sm">
                    <Avatar
                      size="sm"
                      radius="xl"
                      color={user.role === 'admin' ? 'blue' : 'cyan'}
                    >
                      {user.displayName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Text sx={styles.userName}>
                      {user.displayName}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text sx={styles.userEmail}>{user.email}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={user.role === 'admin' ? 'blue' : 'cyan'}
                    radius="sm"
                  >
                    {user.role}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {user.shopId ? (
                    <Text sx={styles.userEmail}>
                      {shops.find((s) => s.value === user.shopId)?.label}
                    </Text>
                  ) : (
                    <Text sx={styles.userShop}>-</Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={editingUser ? t('editUser') : t('addUser')}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack spacing="md">
            <TextInput
              label={t('email')}
              placeholder={t('enterEmail')}
              required
              {...form.getInputProps('email')}
            />
            <TextInput
              label={t('displayName')}
              placeholder={t('enterDisplayName')}
              required
              {...form.getInputProps('displayName')}
            />
            <Select
              label={t('role')}
              data={[
                { value: 'admin', label: t('admin') },
                { value: 'agent', label: t('agent') },
              ]}
              required
              {...form.getInputProps('role')}
            />
            {form.values.role === 'agent' && (
              <Select
                label={t('shop')}
                data={shops}
                clearable
                {...form.getInputProps('shopId')}
              />
            )}
            <Group position="right">
              <Button variant="outline" onClick={closeModal}>
                {t('cancel')}
              </Button>
              <Button type="submit" loading={loading}>
                {editingUser ? t('update') : t('add')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
