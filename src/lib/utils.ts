import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function triggerHaptic(style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      switch (style) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(20);
          break;
        case 'heavy':
          navigator.vibrate(40);
          break;
        case 'success':
          navigator.vibrate([15, 30, 15]);
          break;
        case 'warning':
          navigator.vibrate([30, 50, 30]);
          break;
        case 'error':
          navigator.vibrate([40, 40, 40]);
          break;
      }
    } catch (_) {}
  }
}
