import type { FairResponse } from './schema';

export const FAIR_TAB = 'Feria Empresarial';

export const FAIR_HEADERS = [
  'Referencia',
  'Fecha de envío (UTC)',
  'Nombres y apellidos',
  'Número de identificación',
  'Edad',
  'Número de contacto',
  'Correo electrónico',
  'Barrio o sector de residencia',
  'Cabeza de hogar',
  'Nombre del emprendimiento',
  'Productos o servicios',
  'Actividad económica',
  'Otra actividad',
  'Tiempo de funcionamiento',
  'Personas que trabajan',
  'Formalización',
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Observaciones',
  'Versión de la autorización',
];

export function toFairRow(data: FairResponse, receivedAt: string, consentVersion: string) {
  return [
    data.submissionId,
    receivedAt,
    data.fullName,
    data.identification,
    data.age,
    data.phone,
    data.email,
    data.neighborhood,
    data.headOfHousehold,
    data.businessName,
    data.products,
    [...new Set(data.activities)].join(', '),
    data.activities.includes('Otro') ? data.otherActivity : '',
    data.operatingTime,
    data.teamSize,
    data.formalization,
    data.instagram,
    data.facebook,
    data.whatsapp,
    data.notes,
    consentVersion,
  ];
}
