// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function (registration) {
        console.log('[PWA] Service Worker registered:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                // New version available - you can show a toast here
                console.log('[PWA] Update tersedia, refresh untuk memperbarui.');
              }
            });
          }
        });
      })
      .catch(function (error) {
        console.error('[PWA] Service Worker gagal:', error);
      });
  });
}
