import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker
// @ts-ignore
import { registerSW } from 'virtual:pwa-register';

import { isTestStepPath } from './lib/activeTest';

// Utvecklingsläge: en service worker från en tidigare byggd version (t.ex. efter
// `npm start` på samma port) serverar annars gamla filer ovanpå dev-servern, och
// skärmar kraschar när gamla och nya filer blandas. Ta bort den och dess cache.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(async (registrations) => {
    if (registrations.length === 0) return;
    await Promise.all(registrations.map(r => r.unregister()));
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    // Ladda om en gång så att sidan hämtas direkt från dev-servern
    if (navigator.serviceWorker.controller && !sessionStorage.getItem('provprotokoll-dev-sw-cleared')) {
      sessionStorage.setItem('provprotokoll-dev-sw-cleared', '1');
      window.location.reload();
    }
  }).catch(() => {});
}

// En ny version laddar om sidan. Gör det aldrig mitt i ett prov – vänta
// tills inspektören har lämnat provflödet.
const updateSW = import.meta.env.DEV ? (() => {}) as (reload?: boolean) => void : registerSW({
  onNeedRefresh() {
    const applyWhenSafe = () => {
      if (!isTestStepPath(window.location.pathname)) {
        updateSW(true);
        return true;
      }
      return false;
    };
    if (!applyWhenSafe()) {
      const timer = window.setInterval(() => {
        if (applyWhenSafe()) window.clearInterval(timer);
      }, 15000);
    }
  },
  onOfflineReady() {},
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

