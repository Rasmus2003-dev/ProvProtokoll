import { useEffect, useRef } from 'react';

// Androids bakåtknapp/bakåtgest ska stänga en öppen dialog i stället för att
// lämna sidan. När dialogen öppnas läggs ett historiksteg till; bakåt tar bort
// det och stänger dialogen. Stängs dialogen på annat sätt tas steget bort.
// Nästlade dialoger stängs en i taget – bara den översta reagerar.
export function useBackToClose(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const token = `dlg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    // Behåll routerns egna fält i state så att sidan inte räknas som ny
    window.history.pushState({ ...(window.history.state || {}), __dialog: token }, '');
    let closedByBack = false;

    const onPop = () => {
      // Ligger vårt steg fortfarande överst var det en annan (inre) dialog som stängdes
      if (window.history.state?.__dialog === token) return;
      if (closedByBack) return;
      closedByBack = true;
      onCloseRef.current();
    };
    window.addEventListener('popstate', onPop);

    return () => {
      window.removeEventListener('popstate', onPop);
      // Stängd med knapp/Esc: ta bort vårt historiksteg – men bara om det ligger
      // överst (har appen hunnit navigera vidare ska vi inte backa)
      if (!closedByBack && window.history.state?.__dialog === token) window.history.back();
    };
  }, [open]);
}
