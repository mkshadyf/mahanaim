import { Button, Container, Paper, Stack, Text, Title } from '@mantine/core';
import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallback({ error }: { error: Error | null }): JSX.Element {
  const { t } = useTranslation();

  return (
    <Container size="md" py="xl">
      <Paper shadow="md" p="xl" radius="md" withBorder>
        <Stack align="center" justify="center" spacing={10}>
          <Title order={1} c="red">
            {t('error.title', 'Oops! Something went wrong')}
          </Title>
          <Text size="lg" color="dimmed" ta="center">
            {t('error.description', 'An unexpected error has occurred. Our team has been notified.')}
          </Text>
          {error && (
            <Paper withBorder p="md" bg="gray.0" style={{ width: '100%' }}>
              <Text size="sm">
                {error.message}
              </Text>
            </Paper>
          )}
          <Button
            onClick={() => window.location.reload()}
            size="md"
            variant="filled"
            color="blue"
          >
            {t('error.refresh', 'Refresh Page')}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to your error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 