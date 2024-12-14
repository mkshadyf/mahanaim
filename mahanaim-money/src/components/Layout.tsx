import { type ReactNode } from 'react';
import {
  AppShell,
  Text,
  Group,
  Avatar,
  Menu,
  UnstyledButton,
  Box,
  Drawer,
  ScrollArea,
  ActionIcon,
  Container,
  Burger,
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconLogout, IconUser } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import classes from './Layout.module.css';

interface NavItemProps {
  icon: JSX.Element;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps): JSX.Element {
  return (
    <UnstyledButton
      onClick={onClick}
      className={classes.navButton}
      data-active={active || undefined}
    >
      <Group>
        {icon}
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps): JSX.Element {
  const [opened, { toggle: toggleOpened, close: closeOpened }] = useDisclosure(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const adminNavItems = [
    { path: '/admin', label: t('dashboard'), icon: '📊' },
    { path: '/admin/shops', label: t('shops'), icon: '🏪' },
    { path: '/admin/users', label: t('users'), icon: '👥' },
    { path: '/admin/inventory', label: t('inventory'), icon: '📦' },
    { path: '/admin/debt', label: t('debt'), icon: '💰' },
  ];

  const agentNavItems = [
    { path: '/shop', label: t('dashboard'), icon: '📊' },
    { path: '/shop/report', label: t('dailyReport'), icon: '📝' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : agentNavItems;

  const handleNavigation = (path: string): void => {
    navigate(path);
    closeOpened();
  };

  const renderNavItems = (): JSX.Element => (
    <ScrollArea h="calc(100vh - 60px)" type="auto" scrollbarSize={8}>
      {navItems.map((item) => (
        <NavItem
          key={item.path}
          icon={<Text>{item.icon}</Text>}
          label={item.label}
          active={location.pathname === item.path}
          onClick={() => handleNavigation(item.path)}
        />
      ))}
    </ScrollArea>
  );

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: { base: 0, sm: 300 },
        breakpoint: 'sm',
        collapsed: { mobile: true, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="lg" h="100%">
          <div className={classes.header}>
            <Group gap="xs">
              <Box hiddenFrom="sm">
                <Burger
                  opened={opened}
                  onClick={toggleOpened}
                  size="sm"
                  aria-label="Toggle navigation"
                />
              </Box>

              <Text className={classes.logo}>Mahanaim Money</Text>
            </Group>

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton className={classes.menuTarget}>
                  <Group gap="xs">
                    <Avatar size={30} radius="xl" />
                    <Box visibleFrom="sm">
                      <Text size="sm" className={classes.lineHeight1}>
                        {user?.displayName || user?.email}
                      </Text>
                    </Box>
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<IconUser size={14} />}>Profile</Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={<IconLogout size={14} />}
                  onClick={() => void signOut()}
                >
                  {t('logout')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </Container>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {renderNavItems()}
      </AppShell.Navbar>

      <Drawer
        opened={opened}
        onClose={closeOpened}
        size="100%"
        padding="md"
        title={<Text className={classes.logo}>Navigation</Text>}
        hiddenFrom="sm"
        zIndex={1000}
      >
        <Box className={classes.drawer}>
          {renderNavItems()}
        </Box>
      </Drawer>

      <AppShell.Main>
        <Container size="lg">
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
