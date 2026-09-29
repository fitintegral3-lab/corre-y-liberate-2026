/**
 * Textos del formulario de inscripcion.
 *
 * La declaracion (`terms.text`) es la misma que la organizacion usa en
 * cronometrajeinstantaneo.com, copiada literal el 2026-09-28: es su texto
 * legal y no se reescribe aca. Si cambia, se sube `terms.version`, que queda
 * guardado con cada inscripcion para saber que acepto cada persona.
 */
export const registrationFormCopy = {
  eyebrow: 'INSCRIPCIÓN 2026',
  title: 'ASEGURA TU CUPO',
  intro:
    'Llena tus datos, paga con el QR Bre-B desde la app de tu banco o billetera y sube el comprobante. Revisamos el pago y te confirmamos por correo.',
  sections: {
    race: 'Tu carrera',
    personal: 'Tus datos',
    health: 'Salud y emergencia',
    payment: 'Pago por QR Bre-B',
    terms: 'Reglamento',
  },
  submit: 'ENVIAR INSCRIPCIÓN',
  success: {
    title: '¡INSCRIPCIÓN RECIBIDA!',
    body: 'Revisamos tu comprobante y te confirmamos por correo. Si algo no cuadra, te escribimos al celular que dejaste.',
  },
} as const;

export const terms = {
  version: 'v1-2026-09-28',
  label: 'Acepto el reglamento y las condiciones del evento',
  text: 'Declaro bajo la gravedad de juramento que la información suministrada es veraz y que me encuentro en condiciones de salud y aptitud física para participar voluntariamente en la carrera “Corre y Libérate – Cada Kilómetro Protege, Inspira y Transforma”, comprometiéndome a informar cualquier condición médica que pueda afectar mi participación; asimismo, reconozco y asumo los riesgos inherentes a la actividad física, exonerando de responsabilidad a Integral Fit, salvo en casos de dolo, culpa grave o negligencia comprobada; acepto cumplir el reglamento, las normas de seguridad y las instrucciones de la organización; y autorizo a Integral Fit, de conformidad con la Ley 1581 de 2012 y el Decreto 1074 de 2015, para el tratamiento de mis datos personales y el uso de mi imagen, voz, fotografías y material audiovisual con fines organizativos, institucionales y promocionales, sin que ello genere compensación económica.',
} as const;

/** Mensajes por motivo de rechazo del servidor. Un motivo nuevo sin texto no compila. */
export const registrationErrors = {
  'registration-closed': 'Las inscripciones están cerradas.',
  'unknown-code': 'Ese código de descuento no existe. Revísalo o inscríbete sin código.',
  'no-payment-qr': 'Todavía no hay QR de pago para esta preventa. Escríbenos por WhatsApp.',
  'duplicate-cedula':
    'Ya hay una inscripción con esa cédula. Si crees que es un error, escríbenos por WhatsApp.',
  'receipt-missing': 'No encontramos tu comprobante. Vuelve a subirlo.',
  'receipt-invalid':
    'El comprobante tiene que ser una foto (JPG, PNG, WEBP) o un PDF de hasta 4 MB.',
  invalid: 'Revisa los campos marcados.',
  unavailable: 'La inscripción no está disponible en este momento. Intenta más tarde.',
} as const;

export type RegistrationErrorReason = keyof typeof registrationErrors;
