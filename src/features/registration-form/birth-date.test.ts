import { describe, expect, it } from 'vitest';

import { registrationSchema } from '@/domain/registration/schema';

import { birthDateFromParts } from './birth-date';

const schema = registrationSchema.shape.birthDate;

describe('fecha de nacimiento sin calendario nativo', () => {
  it('envía al servidor la misma fecha ISO desde día, mes y año', () => {
    expect(birthDateFromParts('9', '2', '1985')).toBe('1985-02-09');
  });

  it.each([
    ['', '2', '1985'],
    ['9', '', '1985'],
    ['9', '2', '85'],
    ['9', '2', '1e03'],
  ])('rechaza partes incompletas o un año no numérico (%s/%s/%s)', (day, month, year) => {
    expect(schema.safeParse(birthDateFromParts(day, month, year)).success).toBe(false);
  });

  it.each([
    ['31', '4', '1985'],
    ['29', '2', '1900'],
    ['29', '2', '2001'],
    ['1', '1', '2999'],
  ])('el servidor rechaza fechas imposibles o futuras (%s/%s/%s)', (day, month, year) => {
    expect(schema.safeParse(birthDateFromParts(day, month, year)).success).toBe(false);
  });

  it('acepta el día bisiesto sin cambios de zona horaria', () => {
    expect(schema.parse(birthDateFromParts('29', '2', '2000'))).toBe('2000-02-29');
  });
});
