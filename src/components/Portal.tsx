import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

// Renderar innehållet direkt i <body>. Behövs för modaler inne i provflödet:
// sidövergångarna använder transform/filter, vilket annars gör att
// position: fixed placeras relativt sidan istället för hela skärmen.
export function Portal({ children }: { children: ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}
