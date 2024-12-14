import { Container, Title, Grid, Paper, Text, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <Container size="lg">
      <Title order={2} mb="xl">
        {t('dashboard')}
      </Title>

      <Grid>
        <Grid.Col span={12}>
          <Paper withBorder p="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" color="dimmed">
                  {t('welcome')}
                </Text>
                <Text size="lg" fw={500}>
                  {user?.displayName || user?.email}
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
} 