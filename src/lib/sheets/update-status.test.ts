import { describe, expect, it } from 'vitest';

import { SHEET_HEADERS } from '@/lib/sheets/registration-row';
import { columnLetter } from '@/lib/sheets/update-status';

describe('columnLetter', () => {
  it('convierte indices en letras de columna', () => {
    expect(columnLetter(0)).toBe('A');
    expect(columnLetter(25)).toBe('Z');
    expect(columnLetter(26)).toBe('AA');
    expect(columnLetter(27)).toBe('AB');
    expect(columnLetter(51)).toBe('AZ');
    expect(columnLetter(52)).toBe('BA');
  });

  it('ubica "Estado pago" en B y el ID en AA, como en la hoja real', () => {
    expect(columnLetter(SHEET_HEADERS.indexOf('Estado pago'))).toBe('B');
    expect(columnLetter(SHEET_HEADERS.indexOf('ID'))).toBe('AA');
  });
});
