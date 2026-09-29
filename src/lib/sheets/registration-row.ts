/**
 * Una inscripcion como fila de la hoja de Drive.
 *
 * Los encabezados siguen los de la planilla que exporta cronometraje, que es
 * la que la organizacion ya sabe leer; se agregan el codigo, los precios y la
 * ruta del comprobante. Todo va como texto: la hoja se escribe en modo RAW,
 * asi que nada de lo que escriba un corredor se interpreta como formula.
 */
export interface SheetRegistration {
  id: string;
  createdAt: string;
  paymentStatus: string;
  distanceLabel: string;
  gender: string;
  category: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string | null;
  shirtSize: string;
  birthDate: string;
  cedula: string;
  phone: string;
  eps: string;
  bloodType: string;
  team: string | null;
  emergencyName: string;
  emergencyPhone: string;
  recentCompetition: boolean;
  hasIllness: boolean;
  medicalCondition: string | null;
  referralCode: string | null;
  basePrice: number;
  total: number;
  receiptPath: string;
  observation: string | null;
}

export const SHEET_HEADERS = [
  'Fecha inscripción',
  'Estado pago',
  'Carrera',
  'Género',
  'Categoría',
  'Nombre',
  'Apellido',
  'Mail',
  'Ciudad',
  'Talle de camiseta',
  'Fecha de nacimiento',
  'Cédula',
  'Celular',
  'EPS/Seguro Salud',
  'Grupo Sanguíneo (RH)',
  'Equipo',
  'Nombre del contacto de emergencia',
  'Celular del contacto de emergencia',
  '¿Participó en una competencia últimamente?',
  '¿Se encuentra padeciendo alguna enfermedad?',
  'Condición médica',
  'Código de descuento',
  'Precio',
  'Total a pagar',
  'Comprobante (ruta en Supabase)',
  'Observaciones',
  'ID',
] as const;

const yesNo = (value: boolean) => (value ? 'SI' : 'NO');

/** Fecha y hora de Colombia, que es como la lee la organizacion: `2026-09-29 14:05:33`. */
export function colombiaDateTime(iso: string): string {
  const date = new Date(iso);
  const shifted = new Date(date.getTime() - 5 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 19).replace('T', ' ');
}

export function toSheetRow(registration: SheetRegistration): string[] {
  const row = [
    colombiaDateTime(registration.createdAt),
    registration.paymentStatus,
    registration.distanceLabel,
    registration.gender === 'femenino' ? 'F' : 'M',
    registration.category,
    registration.firstName,
    registration.lastName,
    registration.email,
    registration.city ?? '',
    registration.shirtSize,
    registration.birthDate,
    registration.cedula,
    registration.phone,
    registration.eps,
    registration.bloodType,
    registration.team ?? '',
    registration.emergencyName,
    registration.emergencyPhone,
    yesNo(registration.recentCompetition),
    yesNo(registration.hasIllness),
    registration.medicalCondition ?? '',
    registration.referralCode ?? '',
    String(registration.basePrice),
    String(registration.total),
    registration.receiptPath,
    registration.observation ?? '',
    registration.id,
  ];
  return row;
}
