import { z } from 'zod';

export const activities = [
  'Alimentos y bebidas',
  'Belleza y cuidado personal',
  'Moda y confección',
  'Artesanías y manualidades',
  'Hogar y decoración',
  'Comercio',
  'Servicios',
  'Agropecuario',
  'Otro',
] as const;

export const operatingTimes = [
  'Menos de 1 año',
  'Entre 1 y 3 años',
  'Entre 3 y 5 años',
  'Más de 5 años',
] as const;

export const householdOptions = ['Sí', 'No'] as const;
export const formalizationOptions = ['Sí', 'No', 'En proceso'] as const;
export const consentVersion = 'feria-empresarial-2026-v1';

const requiredText = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).default('');

export const fairResponseSchema = z
  .object({
    submissionId: z.uuidv4(),
    fullName: requiredText(160),
    identification: requiredText(32),
    age: z.coerce.number<string>().int().min(1).max(120),
    phone: requiredText(32).refine((value) => value.replace(/\D/g, '').length >= 7),
    email: z.string().trim().max(254).pipe(z.email()),
    neighborhood: requiredText(160),
    headOfHousehold: z.enum(householdOptions),
    businessName: requiredText(160),
    products: requiredText(1200),
    activities: z.array(z.enum(activities)).min(1).max(activities.length),
    otherActivity: optionalText(160),
    operatingTime: z.enum(operatingTimes),
    teamSize: z
      .string()
      .trim()
      .regex(/^\d{1,5}$/)
      .transform(Number),
    formalization: z.enum(formalizationOptions),
    instagram: optionalText(254),
    facebook: optionalText(254),
    whatsapp: optionalText(254),
    notes: optionalText(1800),
    consent: z.literal('on'),
  })
  .refine((data) => !data.activities.includes('Otro') || Boolean(data.otherActivity), {
    path: ['otherActivity'],
  });

export type FairResponse = z.infer<typeof fairResponseSchema>;
