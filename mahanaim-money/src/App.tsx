import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './i18n/config';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorBoundary';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        theme={{
          primaryColor: 'blue',
          fontFamily: 'Inter, sans-serif',
          defaultRadius: 'sm',
          colors: {
            // Add custom colors here if needed
          },
        }}
      >
        <ErrorBoundary>
          <Notifications position="top-right" />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ErrorBoundary>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
