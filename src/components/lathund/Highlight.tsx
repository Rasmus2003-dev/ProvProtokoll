import { useEffect, useState, type RefObject } from 'react';

// Sökord: flera ord separerade med mellanslag – alla måste finnas med
function terms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

// Markerar sökträffar i en text
export function Highlight({ text, query }: { text: string; query: string }) {
  const words = terms(query);
  if (words.length === 0) return <>{text}</>;
  const escaped = words
    .sort((a, b) => b.length - a.length)
    .map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        words.includes(part.toLowerCase())
          ? <mark key={i} className="bg-yellow-200 dark:bg-yellow-500/40 text-inherit rounded px-0.5">{part}</mark>
          : <span key={i}>{part}</span>
      )}
    </>
  );
}

export function matches(text: string | undefined, query: string): boolean {
  const words = terms(query);
  if (words.length === 0) return true;
  if (!text) return false;
  const t = text.toLowerCase();
  return words.every(w => t.includes(w));
}

// Matchar om alla sökord finns någonstans bland texterna (inte nödvändigtvis i samma)
export function matchesAny(texts: (string | undefined)[], query: string): boolean {
  const words = terms(query);
  if (words.length === 0) return true;
  const all = texts.filter(Boolean).join(' \n ').toLowerCase();
  return words.every(w => all.includes(w));
}

// "/" fokuserar sökfältet (om man inte redan skriver i ett fält)
export function useSlashFocus(ref: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (!ref.current || ref.current.offsetParent === null) return;
      e.preventDefault();
      ref.current.focus();
      ref.current.select();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ref]);
}

// Enkel state som sparas i web storage; tål att lagringen saknas eller kastar
export function useStoredState<T>(key: string, initial: T, storage: 'local' | 'session' = 'local') {
  const read = (): T => {
    try {
      const s = storage === 'local' ? window.localStorage : window.sessionStorage;
      const raw = s.getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  };
  const [value, setValue] = useState<T>(read);
  useEffect(() => {
    try {
      const s = storage === 'local' ? window.localStorage : window.sessionStorage;
      s.setItem(key, JSON.stringify(value));
    } catch { /* ignoreras */ }
  }, [key, value, storage]);
  return [value, setValue] as const;
}
