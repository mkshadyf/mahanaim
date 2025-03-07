import { ActionIcon, AppShell, Box, Burger, Group, Header, MediaQuery, Text, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppNavigation } from './AppNavigation';
import { MobileNavigation } from './MobileNavigation';

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * Main application layout
 * Responsive design with desktop sidebar and mobile bottom navigation
 */
export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm}px)`);
  
  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={!isMobile ? <AppNavigation opened={true} onClose={() => setOpened(false)} /> : undefined}
      header={
        <Header height={{ base: 50, md: 70 }} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Text size="lg" weight={700}>
              {t('common.appName')}
            </Text>
            <Group>
              <ActionIcon
                variant="default"
                onClick={() => toggleColorScheme()}
                size={30}
              >
                {colorScheme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
              </ActionIcon>
            </Group>
          </div>
        </Header>
      }
    >
      {isMobile && opened ? (
        <AppNavigation opened={opened} onClose={() => setOpened(false)} />
      ) : (
        <Box p="md">
          {children}
        </Box>
      )}
      <MobileNavigation />
    </AppShell>
  );
} 