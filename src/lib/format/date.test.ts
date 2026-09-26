import { describe, expect, it } from 'vitest';

import {
  formatDateRange,
  formatDayAndShortMonth,
  formatLongDate,
  formatWeekdayLongDate,
  parseIsoDate,
  toEventIsoDate,
} from '@/lib/format/date';

describe('parseIsoDate', () => {
  it('interpreta la fecha en la zona local y no en UTC', () => {
    // La regresion que cubre: `new Date('2026-11-22')` es medianoche UTC, que
    // en America/Bogota (UTC-5) cae el 21 y corre toda la pagina un dia.
    const date = parseIsoDate('2026-11-22');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(22);
  });
});

describe('formatLongDate', () => {
  it('escribe la fecha del evento en espanol', () => {
    expect(formatLongDate('2026-11-22')).toBe('22 de noviembre de 2026');
  });
});

describe('formatWeekdayLongDate', () => {
  it('antepone el dia de la semana capitalizado', () => {
    expect(formatWeekdayLongDate('2026-11-22')).toBe('Domingo 22 de noviembre de 2026');
  });
});

describe('formatDayAndShortMonth', () => {
  it('usa la forma compacta sin preposicion ni punto', () => {
    expect(formatDayAndShortMonth('2026-11-22')).toBe('22 nov');
  });
});

describe('formatDateRange', () => {
  it('nombra los dos meses cuando son distintos', () => {
    expect(formatDateRange('2026-08-01', '2026-09-15')).toBe(
      '1 de agosto al 15 de septiembre de 2026',
    );
  });

  it('no repite el mes cuando el rango cae dentro de uno solo', () => {
    expect(formatDateRange('2026-11-01', '2026-11-21')).toBe('1 al 21 de noviembre de 2026');
  });

  it('nombra los dos anios cuando el rango los cruza', () => {
    expect(formatDateRange('2026-12-01', '2027-01-15')).toBe(
      '1 de diciembre de 2026 al 15 de enero de 2027',
    );
  });
});

describe('toEventIsoDate', () => {
  it('resuelve el dia en la hora de Jamundi y no en la del servidor', () => {
    // 2026-11-23T03:00Z es todavia el 22 por la noche en Colombia.
    expect(toEventIsoDate(new Date('2026-11-23T03:00:00Z'))).toBe('2026-11-22');
  });
});
