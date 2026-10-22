/**
 * Generering och validering av fiktiva personnummer (Testpersonnummer).
 * Skatteverkets standard för testpersonnummer:
 * - Födelsedatum använder ofta dag 61–91 (samordningsnummer) eller godkända fiktiva datum.
 * - Kontrollsiffran beräknas enligt Luhn-algoritmen (modulus 10).
 */

export function calculateLuhnChecksum(digitsWithoutCheck: string): number {
  const sum = digitsWithoutCheck.split('').map(Number).reduce((acc, d, i) => {
    let v = d * (i % 2 === 0 ? 2 : 1);
    if (v > 9) v -= 9;
    return acc + v;
  }, 0);
  return (10 - (sum % 10)) % 10;
}

/**
 * Genererar ett fiktivt svenskt testpersonnummer (format: ÅÅÅÅMMDD-XXXX).
 * Använder Skatteverkets fiktiva datum med dag +60 (samordningsnummer/testpersonnummer)
 * så att det garanterat inte krockar med någon verklig person, samtidigt som Luhn stämmer.
 */
export function generateFictitiousPnr(): string {
  const startYear = 1975;
  const endYear = 2006;
  const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
  const month = Math.floor(Math.random() * 12) + 1;
  // Dag 61–88 för att simulera fiktivt samordnings-/testnummer (dag + 60)
  const baseDay = Math.floor(Math.random() * 28) + 1;
  const fictitiousDay = baseDay + 60; // t.ex. 61–88

  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(fictitiousDay).padStart(2, '0');
  const serial = Math.floor(Math.random() * 899) + 100; // 100-998

  // De 9 siffrorna som ingår i Luhn (ÅÅMMDDNNN)
  const nineDigits = `${String(year).slice(2)}${monthStr}${dayStr}${serial}`;
  const checksum = calculateLuhnChecksum(nineDigits);

  return `${year}${monthStr}${dayStr}-${serial}${checksum}`;
}

/**
 * Kontrollerar om ett svenskt personnummer (10 eller 12 siffror) har ett giltigt format och stämmer mot Luhn-algoritmen.
 */
export function isValidPnrFormat(pnr: string): boolean {
  if (!pnr) return false;
  const clean = pnr.replace(/[^\d]/g, '');
  if (clean.length !== 10 && clean.length !== 12) return false;
  const tenDigits = clean.length === 12 ? clean.slice(2) : clean;
  const checksum = calculateLuhnChecksum(tenDigits.slice(0, 9));
  return Number(tenDigits[9]) === checksum;
}

/**
 * Formaterar inmatat personnummer stabilt: ÅÅÅÅMMDD-XXXX eller ÅÅMMDD-XXXX
 */
export function formatPnrInput(input: string): string {
  const digits = input.replace(/[^\d]/g, '');
  if (digits.length <= 6) return digits;
  if (digits.length <= 8) return digits;
  if (digits.length === 10) return `${digits.slice(0, 6)}-${digits.slice(6)}`;
  if (digits.length > 8) return `${digits.slice(0, 8)}-${digits.slice(8, 12)}`;
  return digits;
}

