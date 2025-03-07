import type { ColorScheme } from '@mantine/core';
import { ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AuthProvider } from './contexts/AuthContext';
import { ServiceProvider } from './contexts/ServiceContext';
import { AppRoutes } from './routes/AppRoutes';

/**
 * Main application component
 */
export default function App() {
  // Color scheme state
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
    getInitialValueInEffect: true,
  });
  
  // Toggle color scheme
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
  
  return (
    <BrowserRouter>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          theme={{
            colorScheme,
            primaryColor: 'blue',
            components: {
              Button: {
                defaultProps: {
                  radius: 'md',
                },
              },
              TextInput: {
                defaultProps: {
                  radius: 'md',
                },
              },
              Select: {
                defaultProps: {
                  radius: 'md',
                },
              },
            },
          }}
          withGlobalStyles
          withNormalizeCSS
        >
          <Notifications position="top-right" />
          <ServiceProvider>
            <AuthProvider>
              <AppLayout>
                <AppRoutes />
              </AppLayout>
            </AuthProvider>
          </ServiceProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </BrowserRouter>
  );
}
