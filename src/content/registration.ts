import { z } from 'zod';

import { registrationStepSchema } from '@/domain/event/schema';

/**
 * Como se inscribe alguien.
 *
 * La inscripcion ocurre en la plataforma de cronometraje, que es de un tercero
 * y cobra por transferencia: se paga primero, se llena un formulario de 35
 * campos y se sube el comprobante. Quien sale de esta pagina esperando pagar
 * con tarjeta se encuentra con un muro y no vuelve.
 *
 * Esta seccion existe para que llegue sabiendo que lo espera. No arregla el
 * formulario ajeno; evita la sorpresa, que es lo que hace abandonar.
 */
export const registrationSteps = z
  .array(registrationStepSchema)
  .nonempty()
  .parse([
    {
      order: 1,
      title: 'Paga tu inscripción',
      description:
        'Por transferencia bancaria a Integral Fit o con tu llave Bre-B. La plataforma no cobra con tarjeta.',
    },
    {
      order: 2,
      title: 'Llena el formulario',
      description:
        'Tus datos, la distancia que corres, la talla de la camiseta y un contacto de emergencia.',
    },
    {
      order: 3,
      title: 'Sube el comprobante',
      description: 'Adjunta la captura de la transferencia y tu cupo queda registrado.',
    },
  ]);

/** Lo que el formulario pide y nadie tiene a la mano si no se lo avisan. */
export const registrationChecklist = z
  .array(z.string().min(1))
  .nonempty()
  .parse([
    'Tu número de cédula',
    'Tu EPS o seguro de salud',
    'Tu grupo sanguíneo (RH)',
    'Nombre y celular de un contacto de emergencia',
    'El comprobante de la transferencia',
  ]);

export const registrationSection = {
  eyebrow: 'ANTES DE EMPEZAR',
  title: 'CÓMO INSCRIBIRTE',
  intro:
    'La inscripción se hace en la plataforma de cronometraje. Ten esto listo antes de empezar y no vas a tener que salirte a mitad de camino.',
  checklistTitle: 'TEN A MANO',
  ctaLabel: 'IR A LA INSCRIPCIÓN',
} as const;

export const registrationBanner = {
  title: '¡LAS INSCRIPCIONES YA ESTÁN ABIERTAS!',
  ctaLabel: 'INSCRÍBETE AHORA',
} as const;
