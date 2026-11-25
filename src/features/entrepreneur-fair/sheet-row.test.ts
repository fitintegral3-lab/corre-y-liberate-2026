import { describe, expect, it } from 'vitest';

import { FAIR_HEADERS, toFairRow } from '@/features/entrepreneur-fair/sheet-row';
import { fairResponseSchema } from '@/features/entrepreneur-fair/schema';

const response = fairResponseSchema.parse({
  submissionId: '46f4a99e-015b-4f2a-8f91-e517a292dea6',
  fullName: 'Emprendedora de prueba',
  identification: '000123',
  age: '30',
  phone: '3000000000',
  email: 'feria@example.com',
  neighborhood: 'Sector de prueba',
  headOfHousehold: 'Sí',
  businessName: 'Emprendimiento de prueba',
  products: 'Productos locales',
  activities: ['Comercio'],
  operatingTime: 'Menos de 1 año',
  teamSize: '2',
  formalization: 'En proceso',
  consent: 'on',
});

describe('fila de la Feria Empresarial', () => {
  it('escribe la fecha de envío en hora de Colombia', () => {
    const row = toFairRow(response, '2026-11-21T03:30:05.123456+00:00', 'v1');
    expect(FAIR_HEADERS[1]).toBe('Fecha de envío (hora Colombia)');
    expect(row[1]).toBe('2026-11-20 22:30:05');
  });
});
