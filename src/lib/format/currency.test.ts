import { describe, expect, it } from 'vitest';

import { formatCop, formatCopWithCode } from '@/lib/format/currency';

describe('formatCop', () => {
  it('usa el punto como separador de miles', () => {
    expect(formatCop(100_000)).toBe('$100.000');
    expect(formatCop(1_500_000)).toBe('$1.500.000');
  });

  it('no muestra centavos', () => {
    expect(formatCop(90_000)).toBe('$90.000');
  });
});

describe('formatCopWithCode', () => {
  it('nombra la moneda para lectores de pantalla y datos estructurados', () => {
    expect(formatCopWithCode(250_000)).toBe('250.000 COP');
  });
});
