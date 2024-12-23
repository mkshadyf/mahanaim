import { useState, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppShell,
  Burger,
  Group,
  UnstyledButton,
  Text,
  Avatar,
  Menu,
  rem,
  useMantineTheme,
  Box,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconLogout,
  IconUser,
  IconSettings,
  IconChevronDown,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { notifications } from '@mantine/notifications';
import classes from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [opened, { toggle }] = useDisclosure();
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      notifications.show({
        title: t('common.success'),
        message: t('auth.signOutSuccess'),
        color: 'green',
      });
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      notifications.show({
        title: t('common.error'),
        message: t('auth.signOutError'),
        color: 'red',
      });
    }
  };

  const isAdmin = user?.role === 'admin';
  const adminLinks = [
    { label: t('nav.dashboard'), path: '/admin/dashboard' },
    { label: t('nav.users'), path: '/admin/users' },
    { label: t('nav.debts'), path: '/admin/debts' },
    { label: t('nav.inventory'), path: '/admin/inventory' },
  ];

  const shopLinks = [
    { label: t('nav.dashboard'), path: '/shop/dashboard' },
    { label: t('nav.dailyReport'), path: '/shop/daily-report' },
  ];

  const links = isAdmin ? adminLinks : shopLinks;

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Text size="lg" fw={700}>
              {t('common.appName')}
            </Text>
          </Group>

          <Menu
            width={260}
            position="bottom-end"
            transitionProps={{ transition: 'pop-top-right' }}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
            withinPortal
          >
            <Menu.Target>
              <UnstyledButton
                className={classes.user}
                data-active={userMenuOpened || undefined}
              >
                <Group gap={7}>
                  <Avatar
                    src={user?.photoURL}
                    alt={user?.displayName || undefined}
                    radius="xl"
                    size={20}
                  >
                    {user?.email?.[0].toUpperCase()}
                  </Avatar>
                  <Text size="sm" fw={500} lh={1} mr={3}>
                    {user?.email}
                  </Text>
                  <IconChevronDown
                    style={{ width: rem(12), height: rem(12) }}
                    stroke={1.5}
                  />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={
                  <IconUser style={{ width: rem(16), height: rem(16) }} />
                }
              >
                {t('nav.profile')}
              </Menu.Item>
              <Menu.Item
                leftSection={
                  <IconSettings style={{ width: rem(16), height: rem(16) }} />
                }
              >
                {t('nav.settings')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={
                  <IconLogout style={{ width: rem(16), height: rem(16) }} />
                }
                onClick={handleSignOut}
              >
                {t('nav.signOut')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Box className={classes.navLinks}>
          {links.map((link) => (
            <UnstyledButton
              key={link.path}
              className={classes.navLink}
              data-active={location.pathname === link.path || undefined}
              onClick={() => {
                navigate(link.path);
                if (isMobile) {
                  toggle();
                }
              }}
            >
              {link.label}
            </UnstyledButton>
          ))}
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
