import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import AppRoutes from '@/routes';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MantineProvider
          theme={{
            primaryColor: 'blue',
            fontFamily: 'Inter, system-ui, sans-serif',
            defaultRadius: 'sm',
            components: {
              Button: {
                defaultProps: {
                  size: 'sm',
                },
              },
              TextInput: {
                defaultProps: {
                  size: 'sm',
                },
              },
              Select: {
                defaultProps: {
                  size: 'sm',
                },
              },
            },
          }}
        >
          <Notifications position="top-right" />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </MantineProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
