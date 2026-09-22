// Lösenordshashning med PBKDF2 (Web Crypto API, inbyggt i alla moderna
// webbläsare - ingen extra dependency). Lösenord lagras aldrig i klartext:
// bara ett unikt salt + det resulterande hash-värdet sparas i databasen.

const ITERATIONS = 150_000;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer as ArrayBuffer);
}

async function deriveHash(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromHex(saltHex), iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return toHex(derived);
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = generateSalt();
  const hash = await deriveHash(password, salt);
  return { hash, salt };
}

export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const candidate = await deriveHash(password, salt);
  return candidate === hash;
}
