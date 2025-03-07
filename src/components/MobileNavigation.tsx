import { Group, Paper, Stack, Text, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
    IconList,
    IconReportMoney,
    IconSettings
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './MobileNavigation.module.css';

export interface MobileNavigationProps {
  onSignOut?: () => void;
}

/**
 * Mobile navigation component for small screens
 * Displays a bottom navigation bar with icons
 */
export function MobileNavigation({ onSignOut }: MobileNavigationProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  if (!isMobile) {
    return null;
  }
  
  const isActive = (path: string) => location.pathname === path;
  
  const items = [
    {
      icon: <IconList size={24} />,
      label: t('transaction.transactions'),
      path: '/transactions',
    },
    {
      icon: <IconReportMoney size={24} />,
      label: t('reports.title'),
      path: '/reports',
    },
    {
      icon: <IconSettings size={24} />,
      label: t('navigation.settings'),
      path: '/settings',
    },
  ];
  
  return (
    <Paper
      className={styles.mobileNavigation}
      p="md"
      withBorder
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <Group position="apart" spacing="xs" noWrap>
        {items.map((item) => (
          <UnstyledButton
            key={item.path}
            className={`${styles.navItem} ${isActive(item.path) ? styles.active : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Stack spacing={4} align="center">
              {item.icon}
              <Text size="xs">{item.label}</Text>
            </Stack>
          </UnstyledButton>
        ))}
      </Group>
    </Paper>
  );
} 