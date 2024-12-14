import { useState } from 'react';
import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Text,
  LoadingOverlay,
  Box,
  Stack,
  Image,
  Center,
  Divider,
  Group,
  Modal,
  useMantineTheme,
  MantineTheme,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { notifications } from '@mantine/notifications';
import { IconAt, IconLock, IconArrowLeft } from '@tabler/icons-react';
import { FirebaseError } from 'firebase/app';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';

interface LoginForm {
  email: string;
  password: string;
}

interface ResetPasswordForm {
  email: string;
}

const useStyles = (theme: MantineTheme) => ({
  wrapper: {
    minHeight: '100vh',
    backgroundImage: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,

    '@media (max-width: 768px)': {
      padding: theme.spacing.md,
    },
  },
  title: {
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    fontWeight: 900,
    color: theme.white,
    fontSize: '32px',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',

    '@media (max-width: 768px)': {
      fontSize: '28px',
    },
  },
  subtitle: {
    color: theme.white,
    opacity: 0.8,
  },
  paper: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  },
  link: {
    color: theme.colors.blue[6],
    textDecoration: 'none',
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
      color: theme.colors.blue[7],
    },
  },
  forgotPassword: {
    color: theme.colors.blue[6],
    fontSize: theme.fontSizes.sm,
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
      color: theme.colors.blue[7],
    },
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    color: theme.colors.blue[6],
    fontSize: theme.fontSizes.sm,
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
      color: theme.colors.blue[7],
    },
  },
  input: {
    '&:focus': {
      borderColor: theme.colors.blue[6],
    },
  },
  footer: {
    color: theme.white,
    opacity: 0.7,
  },
});

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [resetPasswordModalOpened, setResetPasswordModalOpened] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const styles = useStyles(theme);

  const form = useForm<LoginForm>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return t('auth.emailRequired');
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return t('auth.invalidEmail');
        }
        return null;
      },
      password: (value) => (!value ? t('auth.passwordRequired') : null),
    },
  });

  const resetPasswordForm = useForm<ResetPasswordForm>({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => {
        if (!value) return t('auth.emailRequired');
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
          return t('auth.invalidEmail');
        }
        return null;
      },
    },
  });

  const handleError = (error: unknown) => {
    console.error('Login error:', error);
    
    if (error instanceof FirebaseError) {
      const errorMessage = (() => {
        switch (error.code) {
          case 'auth/invalid-email':
            return t('auth.invalidEmail');
          case 'auth/user-disabled':
            return t('auth.userDisabled');
          case 'auth/user-not-found':
            return t('auth.userNotFound');
          case 'auth/wrong-password':
            return t('auth.wrongPassword');
          case 'auth/too-many-requests':
            return t('auth.tooManyRequests');
          default:
            return t('auth.generalError');
        }
      })();

      notifications.show({
        title: t('auth.loginError'),
        message: errorMessage,
        color: 'red',
      });
    } else {
      notifications.show({
        title: t('auth.loginError'),
        message: t('auth.generalError'),
        color: 'red',
      });
    }
  };

  const handleSubmit = async (values: LoginForm) => {
    try {
      setLoading(true);
      const user = await signIn(values.email, values.password);

      notifications.show({
        title: t('auth.welcome'),
        message: t('auth.loginSuccess'),
        color: 'green',
      });

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/shop');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values: ResetPasswordForm) => {
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, values.email);
      notifications.show({
        title: t('auth.resetPassword.title'),
        message: t('auth.resetPassword.success'),
        color: 'green',
      });
      setResetPasswordModalOpened(false);
      resetPasswordForm.reset();
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const closeResetPasswordModal = () => {
    setResetPasswordModalOpened(false);
    resetPasswordForm.reset();
  };

  return (
    <Box sx={styles.wrapper}>
      <Container size={420}>
        <Center mb={40}>
          <Stack spacing={0} align="center">
            <Image
              src="/logo.png"
              alt="Mahanaim Money"
              width={120}
              height={120}
              fit="contain"
            />
            <Title order={1} sx={styles.title}>
              Mahanaim Money
            </Title>
            <Text sx={styles.subtitle} size="sm" mt={5}>
              {t('auth.loginSubtitle')}
            </Text>
          </Stack>
        </Center>

        <Paper 
          withBorder 
          shadow="md" 
          p={30} 
          radius="md" 
          sx={styles.paper}
          style={{ position: 'relative' }}
        >
          <LoadingOverlay visible={loading} />

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack spacing="md">
              <TextInput
                label={t('auth.email')}
                placeholder="your@email.com"
                required
                size="md"
                radius="md"
                icon={<IconAt size={16} />}
                styles={{ input: styles.input }}
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label={t('auth.password')}
                placeholder="********"
                required
                size="md"
                radius="md"
                icon={<IconLock size={16} />}
                styles={{ input: styles.input }}
                {...form.getInputProps('password')}
              />

              <Group position="right">
                <Text 
                  sx={styles.forgotPassword}
                  onClick={() => setResetPasswordModalOpened(true)}
                  role="button"
                  tabIndex={0}
                >
                  {t('auth.forgotPassword')}
                </Text>
              </Group>

              <Button 
                fullWidth 
                size="md" 
                radius="md"
                type="submit"
                variant="gradient"
                gradient={{ from: '#1a237e', to: '#0d47a1', deg: 45 }}
              >
                {t('auth.login')}
              </Button>
            </Stack>
          </form>

          <Divider label={t('auth.or')} labelPosition="center" my="lg" />

          <Text align="center" size="sm" mt="md" color="dimmed">
            {t('auth.noAccount')}{' '}
            <Text component="a" href="#" sx={styles.link}>
              {t('auth.contactAdmin')}
            </Text>
          </Text>
        </Paper>

        <Text sx={styles.footer} align="center" size="xs" mt="xl">
          © {new Date().getFullYear()} Mahanaim Money. {t('auth.allRightsReserved')}
        </Text>
      </Container>

      <Modal
        opened={resetPasswordModalOpened}
        onClose={closeResetPasswordModal}
        title={t('auth.resetPassword.title')}
        size="md"
      >
        <Text size="sm" color="dimmed" mb="lg">
          {t('auth.resetPassword.subtitle')}
        </Text>

        <form onSubmit={resetPasswordForm.onSubmit(handleResetPassword)}>
          <Stack spacing="md">
            <TextInput
              label={t('auth.email')}
              placeholder="your@email.com"
              required
              size="md"
              radius="md"
              icon={<IconAt size={16} />}
              styles={{ input: styles.input }}
              {...resetPasswordForm.getInputProps('email')}
            />

            <Group position="apart" mt="md">
              <Text
                sx={styles.backButton}
                onClick={closeResetPasswordModal}
              >
                <IconArrowLeft size={16} />
                {t('auth.resetPassword.backToLogin')}
              </Text>
              <Button 
                type="submit"
                loading={loading}
                radius="md"
              >
                {t('auth.resetPassword.submit')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Box>
  );
}
