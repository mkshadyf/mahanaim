import { notifications } from '@mantine/notifications';
import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        notifications.show({
          title: 'Update Available',
          message: 'New content is available, please refresh.',
          color: 'blue',
        });
      },
      onOfflineReady() {
        notifications.show({
          title: 'App Ready',
          message: 'App is ready to work offline.',
          color: 'green',
        });
      },
      onRegistered(r: ServiceWorkerRegistration | undefined) {
        if (r) {
          console.log('SW Registered:', r);
        }
      },
      onRegisterError(e: Error) {
        console.error('SW registration error', e);
      }
    });

    // Handle registration updates
    updateSW();
  }
}
