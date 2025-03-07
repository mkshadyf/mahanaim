import {
    ActionIcon,
    Box,
    Collapse,
    Divider,
    Group,
    Navbar,
    ScrollArea,
    Text,
    ThemeIcon,
    Tooltip,
    UnstyledButton,
    useMantineTheme,
} from '@mantine/core';
import {
    IconBuildingStore,
    IconChevronLeft,
    IconChevronRight,
    IconHome,
    IconLogout,
    IconReceipt2,
    IconReportAnalytics,
    IconSettings,
    IconUsers,
    IconX
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  badge?: number;
  children?: { icon: React.ReactNode; label: string; to: string }[];
}

function NavItem({ icon, label, to, badge, children }: NavItemProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [opened, setOpened] = useState(false);
  const theme = useMantineTheme();
  const isActive = location.pathname === to || (children && children.some(child => location.pathname === child.to));
  const hasChildren = children && children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      setOpened((o) => !o);
    } else {
      navigate(to);
    }
  };

  return (
    <>
      <UnstyledButton
        onClick={handleClick}
        sx={{
          display: 'block',
          width: '100%',
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
          backgroundColor: isActive
            ? theme.colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.colors.gray[1]
            : 'transparent',
          '&:hover': {
            backgroundColor:
              theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
          },
        }}
      >
        <Group position="apart">
          <Group>
            <ThemeIcon
              size={30}
              variant={isActive ? 'filled' : 'light'}
              color={isActive ? theme.primaryColor : 'gray'}
            >
              {icon}
            </ThemeIcon>
            <Text size="sm" weight={isActive ? 600 : 400}>
              {label}
            </Text>
          </Group>
          {badge ? (
            <Box
              sx={{
                backgroundColor: theme.colors.red[6],
                borderRadius: '50%',
                height: 18,
                width: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="xs" color="white">
                {badge > 9 ? '9+' : badge}
              </Text>
            </Box>
          ) : hasChildren ? (
            <Box
              component={opened ? IconChevronLeft : IconChevronRight}
              size={16}
              color={theme.colors.gray[6]}
            />
          ) : null}
        </Group>
      </UnstyledButton>

      {hasChildren && (
        <Collapse in={opened}>
          <Box pl={30} pt={5}>
            {children.map((child, index) => (
              <NavItem key={index} {...child} />
            ))}
          </Box>
        </Collapse>
      )}
    </>
  );
}

interface AppNavigationProps {
  opened: boolean;
  onClose: () => void;
}

export function AppNavigation({ opened, onClose }: AppNavigationProps) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const mainLinks: NavItemProps[] = [
    {
      icon: <IconHome size={16} />,
      label: t('navigation.dashboard'),
      to: '/',
    },
    {
      icon: <IconReceipt2 size={16} />,
      label: t('navigation.transactions'),
      to: '/transactions',
      badge: 3,
    },
    {
      icon: <IconReportAnalytics size={16} />,
      label: t('navigation.reports'),
      to: '/reports',
    },
  ];

  const adminLinks: NavItemProps[] = [
    {
      icon: <IconUsers size={16} />,
      label: t('navigation.users'),
      to: '/admin/users',
    },
    {
      icon: <IconBuildingStore size={16} />,
      label: t('navigation.shops'),
      to: '/admin/shops',
    },
    {
      icon: <IconSettings size={16} />,
      label: t('navigation.settings'),
      to: '/admin/settings',
      children: [
        {
          icon: <IconSettings size={16} />,
          label: t('navigation.general'),
          to: '/admin/settings/general',
        },
        {
          icon: <IconSettings size={16} />,
          label: t('navigation.security'),
          to: '/admin/settings/security',
        },
      ],
    },
  ];

  return (
    <Navbar
      p="md"
      width={{ sm: 250 }}
      hiddenBreakpoint="sm"
      hidden={!opened}
      height="100vh"
    >
      <Navbar.Section>
        <Group position="apart" mb="md">
          <Text size="lg" weight={700}>
            Mahanaim Money
          </Text>
          <ActionIcon onClick={onClose} display={{ sm: 'none' }}>
            <IconX size={18} />
          </ActionIcon>
        </Group>
      </Navbar.Section>

      <Divider my="sm" />

      <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
        {mainLinks.map((link, index) => (
          <Box key={index} mb={8}>
            <NavItem {...link} />
          </Box>
        ))}

        {isAdmin && (
          <>
            <Divider my="sm" label={t('navigation.adminSection')} labelPosition="center" />
            {adminLinks.map((link, index) => (
              <Box key={index} mb={8}>
                <NavItem {...link} />
              </Box>
            ))}
          </>
        )}
      </Navbar.Section>

      <Divider my="sm" />

      <Navbar.Section>
        <Group position="apart">
          <Group>
            <ThemeIcon radius="xl" size="md">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                />
              ) : (
                <IconUsers size={16} />
              )}
            </ThemeIcon>
            <Box>
              <Text size="sm" weight={500}>
                {user?.displayName || user?.email || 'User'}
              </Text>
              <Text size="xs" color="dimmed">
                {user?.role || 'User'}
              </Text>
            </Box>
          </Group>
          <Tooltip label={t('logout')} position="right">
            <ActionIcon onClick={logout} color="red" variant="light">
              <IconLogout size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Navbar.Section>
    </Navbar>
  );
} 