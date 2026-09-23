import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA service worker
// @ts-ignore
import { registerSW } from 'virtual:pwa-register';

import { isTestStepPath } from './lib/activeTest';

// En ny version laddar om sidan. Gör det aldrig mitt i ett prov – vänta
// tills inspektören har lämnat provflödet.
const updateSW = registerSW({
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

