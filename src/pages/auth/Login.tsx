import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import {
    Alert,
    Box,
    Button,
    Container,
    Group,
    LoadingOverlay,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconArrowLeft, IconAt, IconInfoCircle, IconLock } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import classes from './Login.module.css';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function Login() {
  const [isResetMode, setIsResetMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { signIn, loading } = useAuth();

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : t('auth.invalidEmail')),
      password: (value) => (value.length < 6 ? t('auth.passwordTooShort') : null),
    },
  });

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      await signIn(values.email, values.password);
      notifications.show({
        title: t('common.success'),
        message: t('auth.loginSuccess'),
        color: 'green',
      });

      // Get the redirect path from location state or default to dashboard
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      notifications.show({
        title: t('common.error'),
        message: t('auth.loginError'),
        color: 'red',
      });
    }
  };

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.languageSwitcher}>
        <LanguageSwitcher />
      </Box>

      <Container size={420} my={40}>
        <Stack spacing={7} align="center" mb="xl">
          <Title className={classes.title} order={1}>
            {t('common.appName')}
          </Title>
          <Text className={classes.subtitle} size="sm" mt={5}>
            {t('auth.loginSubtitle')}
          </Text>
        </Stack>

        {!isResetMode ? (
          <Paper className={classes.paper} withBorder shadow="md" p={30} radius="md" pos="relative">
            <LoadingOverlay visible={loading} />
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack spacing={7}>
                <TextInput
                  required
                  label={t('auth.email')}
                  placeholder={t('auth.emailPlaceholder')}
                    icon={<IconAt size={16} />}
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  required
                  label={t('auth.password')}
                  placeholder={t('auth.passwordPlaceholder')}
                  icon={<IconLock size={16} />}
                  {...form.getInputProps('password')}
                />

                <Alert 
                  icon={<IconInfoCircle size="1rem" />}
                  title="Test Credentials"
                  color="blue"
                  variant="light"
                >
                  <Text size="sm">
                    Email: admin@test.com<br />
                    Password: admin123
                  </Text>
                </Alert>

                <Group align="flex-end">
                  <Text
                    className={classes.forgotPassword}
                    onClick={() => setIsResetMode(true)}
                    role="button"
                    tabIndex={0}
                  >
                    {t('auth.forgotPassword')}
                  </Text>
                </Group>

                <Button fullWidth type="submit" loading={loading}>
                  {t('auth.signIn')}
                </Button>
              </Stack>
            </form>

            <Text ta="center" size="sm" mt="md" c="dimmed">
              {t('auth.noAccount')}{' '}
              <Text
                component="span"
                className={classes.link}
                onClick={() => void 0}
              >
                {t('auth.contactAdmin')}
              </Text>
            </Text>
          </Paper>
        ) : (
          <Paper className={classes.paper} withBorder shadow="md" p={30} radius="md" mt={30} pos="relative">
            <LoadingOverlay visible={loading} />
            <Stack spacing={7}>
              <div>
                <Title order={3} c="dark.7" mb="xs">
                  {t('auth.resetPassword.title')}
                </Title>
                <Text size="sm" c="dark.6">
                  {t('auth.resetPassword.description')}
                </Text>
              </div>

              <TextInput
                required
                label={t('auth.email')}
                placeholder={t('auth.emailPlaceholder')}
                icon={<IconAt size={16} />}
                {...form.getInputProps('email')}
              />

              <Group align="flex-end">
                <Text
                  className={classes.backButton}
                  onClick={() => setIsResetMode(false)}
                >
                  <IconArrowLeft size={14} stroke={1.5} />
                  {t('auth.resetPassword.backToLogin')}
                </Text>
                <Button loading={loading} onClick={() => {}}>
                  {t('auth.resetPassword.submit')}
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}

        <Text className={classes.footer} ta="center" size="xs" mt="xl" c="white">
          © {new Date().getFullYear()} {t('common.appName')}
        </Text>
      </Container>
    </Box>
  );
}
