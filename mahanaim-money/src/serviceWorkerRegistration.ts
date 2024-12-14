import { registerSW } from 'virtual:pwa-register';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    registerSW({
      onRegistered(registration) {
        if (registration) {
          setInterval(
            () => {
              registration.update();
            },
            60 * 60 * 1000
          ); // Check for updates every hour
        }
      },
      onRegisterError(error) {
        console.error('Service worker registration failed:', error);
      },
    });
  }
}
