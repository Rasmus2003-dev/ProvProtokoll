// Delas mellan appen och serverfunktionerna.
// Inspektörer loggar in med användarnamn; i Supabase Auth blir det en
// e-postadress på en egen underdomän. Ingen e-post skickas dit.
export const INSPECTOR_EMAIL_DOMAIN = 'provprotokoll.se';

// "rasmus" -> rasmus@provprotokoll.se. Skriver man hela e-postadressen används den som den är.
export function usernameToEmail(username: string): string {
  const value = username.trim().toLowerCase();
  return value.includes('@') ? value : `${value}@${INSPECTOR_EMAIL_DOMAIN}`;
}

export function isValidUsername(username: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{1,39}$/.test(username.trim().toLowerCase());
}

export const MIN_PASSWORD_LENGTH = 8;
