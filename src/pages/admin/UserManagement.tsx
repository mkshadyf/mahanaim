import {
  Box,
  Button,
  Container,
  Group,
  LoadingOverlay,
  Modal,
  Paper,
  PasswordInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAt, IconLock, IconPlus, IconUser } from '@tabler/icons-react';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  type User,
  type UserCredential,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../../config/firebase';
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

      <Paper withBorder radius="md" className={classes.paper}>
        <LoadingOverlay visible={loading} />
        <Table>
          <thead>
            <tr>
              <th>{t('name')}</th>
              <th>{t('email')}</th>
              <th>{t('role')}</th>
              <th>{t('shop')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
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
                <td>
                  <Group align="center" position="left" spacing={7}>
                    <Text className={classes.userName}>
                      {user.displayName}
                    </Text>
                  </Group>
                </td>
                <td>
                  <Text className={classes.userEmail}>{user.email}</Text>
                </td>
                <td>
                  <Text className={classes.userRole}>
                    {t(user.role)}
                  </Text>
                </td>
                <td>
                  <Text className={classes.userShop}>
                    {user.shopId || '-'}
                  </Text>
                </td>
                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
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
            <Stack spacing={7}>
            <TextInput
              label={t('email')}
              placeholder={t('enterEmail')}
              disabled={!!editingUser}
              required
              icon={<IconAt size={16} />}
              {...form.getInputProps('email')}
            />

            {!editingUser && (
              <PasswordInput
                label={t('password')}
                placeholder={t('enterPassword')}
                required
                icon={<IconLock size={16} />}
                {...form.getInputProps('password')}
              />
            )}

            <TextInput
              label={t('displayName')}
              placeholder={t('enterDisplayName')}
              required
              icon={<IconUser size={16} />}
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

            <Group align="flex-end">
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
