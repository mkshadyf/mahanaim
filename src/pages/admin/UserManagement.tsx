import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Modal,
  TextInput,
  PasswordInput,
  Stack,
  Group,
  Box,
  Table,
  Select,
  LoadingOverlay,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconAt, IconLock } from '@tabler/icons-react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  type DocumentData,
} from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import classes from './UserManagement.module.css';

interface UserForm {
  email: string;
  password: string;
  displayName: string;
  role: string;
  shopId?: string;
}

interface UserData extends DocumentData {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  shopId?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const { t } = useTranslation();

  const form = useForm<UserForm>({
    initialValues: {
      email: '',
      password: '',
      displayName: '',
      role: 'user',
      shopId: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('invalidEmail')),
      password: (value) => (value.length < 6 ? t('passwordTooShort') : null),
      displayName: (value) => (!value ? t('displayNameRequired') : null),
      role: (value) => (!value ? t('roleRequired') : null),
    },
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
      })) as UserData[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      notifications.show({
        title: t('error'),
        message: t('errorFetchingUsers'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const handleSubmit = async (values: UserForm) => {
    try {
      setLoading(true);
      let user: User;

      if (editingUser) {
        await updateDoc(doc(db, 'users', editingUser.uid), {
          displayName: values.displayName,
          role: values.role,
          shopId: values.shopId,
        });
        user = editingUser as unknown as User;
      } else {
        const userCredential: UserCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        user = userCredential.user;

        await updateProfile(user, {
          displayName: values.displayName,
        });

        await setDoc(doc(db, 'users', user.uid), {
          email: values.email,
          displayName: values.displayName,
          role: values.role,
          shopId: values.shopId,
        });
      }

      notifications.show({
        title: t('success'),
        message: editingUser ? t('userUpdated') : t('userCreated'),
        color: 'green',
      });

      setModalOpened(false);
      form.reset();
      setEditingUser(null);
      void fetchUsers();
    } catch (error) {
      console.error('Error managing user:', error);
      notifications.show({
        title: t('error'),
        message: t('errorManagingUser'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'users', uid));
      notifications.show({
        title: t('success'),
        message: t('userDeleted'),
        color: 'green',
      });
      void fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      notifications.show({
        title: t('error'),
        message: t('errorDeletingUser'),
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="lg">
      <Box className={classes.header}>
        <Title order={2}>{t('userManagement')}</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => {
            form.reset();
            setEditingUser(null);
            setModalOpened(true);
          }}
        >
          {t('addUser')}
        </Button>
      </Box>

      <Paper withBorder radius="md" className={classes.paper}>
        <LoadingOverlay visible={loading} />
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('name')}</Table.Th>
              <Table.Th>{t('email')}</Table.Th>
              <Table.Th>{t('role')}</Table.Th>
              <Table.Th>{t('shop')}</Table.Th>
              <Table.Th>{t('actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr
                key={user.uid}
                className={classes.tableRow}
                onClick={() => {
                  setEditingUser(user);
                  form.setValues({
                    email: user.email,
                    password: '',
                    displayName: user.displayName,
                    role: user.role,
                    shopId: user.shopId,
                  });
                  setModalOpened(true);
                }}
              >
                <Table.Td>
                  <Group gap="sm">
                    <Text className={classes.userName}>
                      {user.displayName}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text className={classes.userEmail}>{user.email}</Text>
                </Table.Td>
                <Table.Td>
                  <Text className={classes.userRole}>
                    {t(user.role)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text className={classes.userShop}>
                    {user.shopId || '-'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    color="red"
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleDelete(user.uid);
                    }}
                  >
                    {t('delete')}
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          form.reset();
          setEditingUser(null);
        }}
        title={editingUser ? t('editUser') : t('addUser')}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label={t('email')}
              placeholder={t('enterEmail')}
              disabled={!!editingUser}
              required
              leftSection={<IconAt size={16} />}
              {...form.getInputProps('email')}
            />

            {!editingUser && (
              <PasswordInput
                label={t('password')}
                placeholder={t('enterPassword')}
                required
                leftSection={<IconLock size={16} />}
                {...form.getInputProps('password')}
              />
            )}

            <TextInput
              label={t('displayName')}
              placeholder={t('enterDisplayName')}
              required
              {...form.getInputProps('displayName')}
            />

            <Select
              label={t('role')}
              placeholder={t('selectRole')}
              required
              data={[
                { value: 'admin', label: t('admin') },
                { value: 'manager', label: t('manager') },
                { value: 'user', label: t('user') },
              ]}
              {...form.getInputProps('role')}
            />

            <TextInput
              label={t('shopId')}
              placeholder={t('enterShopId')}
              {...form.getInputProps('shopId')}
            />

            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setModalOpened(false)}>
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
