// localStorage-hjälpare som aldrig kastar. Korrupt data eller full lagring
// får inte krascha appen mitt i ett prov.

export function readJSON<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Kunde inte läsa "${key}" från lagringen`, err);
    // Spara undan den trasiga datan så att den inte går förlorad helt
    if (raw !== null) {
      try { localStorage.setItem(`${key}-corrupt`, raw); } catch (_) {}
    }
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Kunde inte spara "${key}" (lagringen kan vara full)`, err);
    return false;
  }
}
