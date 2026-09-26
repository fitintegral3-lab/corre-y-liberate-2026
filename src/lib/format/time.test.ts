import { describe, expect, it } from 'vitest';

import { to24Hour, toIsoDateTime } from '@/lib/format/time';

describe('to24Hour', () => {
  it('convierte la manana', () => {
    expect(to24Hour('6:20 am')).toBe('06:20');
  });

  it('acepta la forma con puntos que usa la sede', () => {
    expect(to24Hour('5:00 A.M.')).toBe('05:00');
  });

  it('convierte el mediodia y la tarde', () => {
    expect(to24Hour('12:00 pm')).toBe('12:00');
    expect(to24Hour('1:30 pm')).toBe('13:30');
  });

  it('trata la medianoche como hora cero', () => {
    expect(to24Hour('12:15 am')).toBe('00:15');
  });

  it('rechaza lo que no es una hora', () => {
    expect(() => to24Hour('temprano')).toThrow(/Hora invalida/);
  });
});

describe('toIsoDateTime', () => {
  it('arma el instante con el desfase fijo de Colombia', () => {
    expect(toIsoDateTime('2026-11-22', '5:00 A.M.')).toBe('2026-11-22T05:00:00-05:00');
  });
});
