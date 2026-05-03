import { showToast, setHidden, $ } from './dom.js';

let deferredPrompt = null;

export function setupInstallPrompt() {
  const installButton = $('#installButton');
  if (!installButton) return;

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    setHidden(installButton, false);
  });

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) {
      showToast('En iPhone: Compartir → Añadir a pantalla de inicio.');
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    setHidden(installButton, true);
  });
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const updateBanner = $('#updateBanner');
  const refreshButton = $('#refreshButton');
  const dismissButton = $('#dismissUpdateButton');
  let waitingWorker = null;

  refreshButton?.addEventListener('click', () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
  });

  dismissButton?.addEventListener('click', () => {
    if (updateBanner) updateBanner.hidden = true;
  });

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            waitingWorker = installing;
            if (updateBanner) updateBanner.hidden = false;
          }
        });
      });

      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } catch (error) {
      console.warn('No se pudo registrar el service worker', error);
    }
  });
}
