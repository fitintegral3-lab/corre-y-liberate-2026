import { z } from 'zod';

import { distanceIdSchema } from '@/domain/event/schema';

/**
 * Formulario de inscripcion.
 *
 * Replica los campos del formulario de cronometrajeinstantaneo.com, que es el
 * que la organizacion usaba y del que sale la planilla que ya conocen. Lo que
 * cambia: la categoria no se elige (sale de distancia y genero), el precio lo
 * calcula el servidor y el codigo de descuento es un campo propio.
 *
 * Las normalizaciones (quitar puntos de la cedula, espacios del celular) viven
 * aca y no en la vista: el servidor es el que guarda, y es el que tiene que
 * dejar todo en un solo formato para que la cedula unica funcione.
 */

export const GENDERS = ['femenino', 'masculino'] as const;
export const SHIRT_SIZES = [
  'Extra Small (XS)',
  'Small (S)',
  'Medium (M)',
  'Large (L)',
  'Extra Large (XL)',
  'Extra Extra Large (XXL)',
] as const;
export const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;

const requiredText = (label: string, max = 120) =>
  z
    .string({ error: `${label} es obligatorio` })
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} es demasiado largo`);

const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

/** Cedula sin puntos, espacios ni guiones: `1.144.135.260` es `1144135260`. */
export const cedulaSchema = z
  .string({ error: 'La cédula es obligatoria' })
  .transform((value) => value.replace(/[\s.\-]/g, '').toUpperCase())
  .pipe(z.string().regex(/^[0-9A-Z]{5,15}$/, 'Escribe la cédula solo con números (5 a 15)'));

/**
 * Celular colombiano: 10 digitos que empiezan en 3, con o sin +57. Es un
 * supuesto razonable para una carrera en Jamundi; un corredor con numero del
 * exterior lo pondria en observaciones.
 */
export const mobileSchema = (label: string) =>
  z
    .string({ error: `${label} es obligatorio` })
    .transform((value) => value.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, ''))
    .pipe(z.string().regex(/^3\d{9}$/, `${label}: escribe los 10 dígitos, empieza en 3`));

const yesNo = (label: string) =>
  z.enum(['SI', 'NO'], { error: `Responde: ${label}` }).transform((value) => value === 'SI');

export const registrationSchema = z
  .object({
    // Se limpia antes de validar: un correo pegado con un espacio al final es
    // valido para quien lo escribio, y el formato solo mira lo que queda.
    email: z
      .string({ error: 'Escribe un correo válido' })
      .trim()
      .toLowerCase()
      .pipe(z.email('Escribe un correo válido')),
    firstName: requiredText('El nombre'),
    lastName: requiredText('El apellido'),
    city: optionalText(80),
    gender: z.enum(GENDERS, { error: 'Elige el género' }),
    distanceId: distanceIdSchema,
    birthDate: z.iso
      .date('Escribe la fecha de nacimiento')
      .refine((value) => value >= '1920-01-01' && value <= new Date().toISOString().slice(0, 10), {
        message: 'Revisa la fecha de nacimiento',
      }),
    shirtSize: z.enum(SHIRT_SIZES, { error: 'Elige la talla de camiseta' }),
    cedula: cedulaSchema,
    phone: mobileSchema('El celular'),
    eps: requiredText('La EPS o seguro de salud'),
    bloodType: z.enum(BLOOD_TYPES, { error: 'Elige el grupo sanguíneo' }),
    team: optionalText(80),
    emergencyName: requiredText('El nombre del contacto de emergencia'),
    emergencyPhone: mobileSchema('El celular del contacto de emergencia'),
    recentCompetition: yesNo('¿Participaste en una competencia últimamente?'),
    hasIllness: yesNo('¿Te encuentras padeciendo alguna enfermedad?'),
    medicalCondition: optionalText(300),
    observation: optionalText(500),
    referralCode: z
      .string()
      .optional()
      .transform((value) => {
        const code = (value ?? '').trim().toUpperCase();
        return code === '' ? null : code;
      }),
    acceptedTerms: z.literal(true, { error: 'Tienes que aceptar el reglamento y las condiciones' }),
    /** Ruta del comprobante ya subido. La valida el servidor contra el almacenamiento. */
    receiptPath: z
      .string()
      .regex(/^pendientes\/[0-9a-f-]{36}\.(jpg|png|webp|pdf)$/, 'Sube el comprobante de pago'),
  })
  .superRefine((data, ctx) => {
    // Quien declara una enfermedad tiene que decir cual: es lo que el equipo
    // medico necesita el dia de la carrera, y un "SI" solo no le sirve.
    if (data.hasIllness && !data.medicalCondition) {
      ctx.addIssue({
        code: 'custom',
        path: ['medicalCondition'],
        message: 'Cuéntanos qué condición médica tienes',
      });
    }
    if (data.emergencyPhone === data.phone) {
      ctx.addIssue({
        code: 'custom',
        path: ['emergencyPhone'],
        message: 'El contacto de emergencia tiene que ser otra persona',
      });
    }
  });

export type RegistrationInput = z.input<typeof registrationSchema>;
export type Registration = z.output<typeof registrationSchema>;

/** Categoria como la muestra cronometraje: `5K ( FEMENINO )`. Sale de distancia y genero. */
export function categoryFor(distanceLabel: string, gender: (typeof GENDERS)[number]): string {
  return `${distanceLabel} ( ${gender.toUpperCase()} )`;
}
