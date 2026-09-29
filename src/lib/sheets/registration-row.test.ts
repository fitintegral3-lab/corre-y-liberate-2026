import { describe, expect, it } from 'vitest';

import {
  colombiaDateTime,
  SHEET_HEADERS,
  toSheetRow,
  type SheetRegistration,
} from '@/lib/sheets/registration-row';
import { readSheetsConfig } from '@/lib/sheets/config';

const registration: SheetRegistration = {
  id: '0b0f8c9e-1d2a-4c3b-9e8f-7a6b5c4d3e2f',
  createdAt: '2026-09-29T19:05:33.123Z',
  paymentStatus: 'pendiente',
  distanceLabel: '5K',
  gender: 'femenino',
  category: '5K ( FEMENINO )',
  firstName: 'Ana',
  lastName: 'Pérez',
  email: 'ana@example.com',
  city: null,
  shirtSize: 'Small (S)',
  birthDate: '1990-05-10',
  cedula: 'PRUEBA0001',
  phone: '3000000001',
  eps: 'Sura',
  bloodType: 'A+',
  team: null,
  emergencyName: 'Luis',
  emergencyPhone: '3000000002',
  recentCompetition: false,
  hasIllness: true,
  medicalCondition: 'Asma',
  referralCode: 'VALECORRE',
  basePrice: 120_000,
  total: 108_000,
  receiptPath: 'pendientes/x.png',
  observation: null,
};

describe('toSheetRow', () => {
  it('tiene una celda por encabezado, en el mismo orden', () => {
    const row = toSheetRow(registration);
    expect(row).toHaveLength(SHEET_HEADERS.length);
    const byHeader = Object.fromEntries(SHEET_HEADERS.map((header, index) => [header, row[index]]));
    expect(byHeader).toMatchObject({
      'Fecha inscripción': '2026-09-29 14:05:33',
      Género: 'F',
      Categoría: '5K ( FEMENINO )',
      Cédula: 'PRUEBA0001',
      '¿Participó en una competencia últimamente?': 'NO',
      '¿Se encuentra padeciendo alguna enfermedad?': 'SI',
      'Código de descuento': 'VALECORRE',
      'Total a pagar': '108000',
      Ciudad: '',
      ID: registration.id,
    });
  });

  it('deja todo como texto, sin nulos', () => {
    expect(toSheetRow(registration).every((cell) => typeof cell === 'string')).toBe(true);
  });
});

describe('colombiaDateTime', () => {
  it('pasa de UTC a la hora de Colombia (UTC-5)', () => {
    expect(colombiaDateTime('2026-09-30T03:00:00Z')).toBe('2026-09-29 22:00:00');
  });
});

describe('readSheetsConfig', () => {
  const valid = {
    GOOGLE_SHEETS_SPREADSHEET_ID: '1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789',
    GOOGLE_SERVICE_ACCOUNT_EMAIL: 'inscripciones@proyecto.iam.gserviceaccount.com',
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY:
      '-----BEGIN PRIVATE KEY-----\\nABC\\n-----END PRIVATE KEY-----\\n',
  };

  it('sin variables la copia a Drive queda apagada', () => {
    expect(readSheetsConfig({})).toBeNull();
  });

  it('convierte los \\n escritos de la llave en saltos de linea', () => {
    expect(readSheetsConfig(valid)?.privateKey).toBe(
      '-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----',
    );
  });

  it('usa la pestana Inscripciones si no se indica otra', () => {
    expect(readSheetsConfig(valid)?.tab).toBe('Inscripciones');
  });

  it('rechaza un correo que no es de cuenta de servicio', () => {
    expect(() =>
      readSheetsConfig({ ...valid, GOOGLE_SERVICE_ACCOUNT_EMAIL: 'yo@gmail.com' }),
    ).toThrow(/iam\.gserviceaccount/);
  });
});
