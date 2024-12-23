import { notifications } from '@mantine/notifications';
import { registerSW, type RegisterSWOptions } from 'virtual:pwa-register';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        notifications.show({
          title: 'Update Available',
          message: 'New version available. Click to update.',
          color: 'blue',
          autoClose: false,
          withCloseButton: true,
          onClick: () => void updateSW(true),
        });
      },
      onOfflineReady() {
        notifications.show({
          title: 'App Ready',
          message: 'App is ready for offline use',
          color: 'green',
        });
      },
      onRegistered(registration) {
        if (registration) {
          console.log('Service Worker registered');

          // Check for updates every hour
          setInterval(() => {
            void registration.update();
          }, 60 * 60 * 1000);
        }
      },
      onRegisterError(error) {
        console.error('Service Worker registration failed:', error);
        notifications.show({
          title: 'Registration Error',
          message: 'Failed to register service worker',
          color: 'red',
        });
      }
    } satisfies RegisterSWOptions);
  }
}
