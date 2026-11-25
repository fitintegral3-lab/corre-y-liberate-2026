import { z } from 'zod';

/** Escala de las preguntas 1 a 5: el valor guardado es la cantidad de estrellas. */
export const ratingLabels = ['Muy mala', 'Mala', 'Regular', 'Buena', 'Excelente'] as const;

export const ratingQuestions = [
  {
    name: 'overall',
    label: 'En general, ¿cómo calificarías tu experiencia en Corre y Libérate 2026?',
  },
  { name: 'organization', label: '¿Cómo calificas la organización del evento?' },
  { name: 'route', label: '¿Cómo calificas la ruta y señalización de la carrera?' },
  { name: 'hydration', label: '¿Cómo calificas la hidratación y atención durante el recorrido?' },
  {
    name: 'finishArea',
    label: '¿Cómo calificas la experiencia en la zona de llegada y actividades del evento?',
  },
] as const;

export const returnOptions = [
  'Sí, definitivamente',
  'Probablemente sí',
  'No estoy seguro/a',
  'No',
] as const;

export const surveyVersion = 'encuesta-experiencia-2026-v1';

/** Cédula o WhatsApp con que la persona se inscribió; el servidor lo normaliza. */
export const identifierSchema = z.string().trim().min(1).max(40);
export const surveyAccessSchema = z.object({ identifier: identifierSchema });

const rating = z.coerce.number<string>().int().min(1).max(5);
const openAnswer = z.string().trim().min(1).max(1200);

export const surveyResponseSchema = z.object({
  submissionId: z.uuidv4(),
  identifier: identifierSchema,
  overall: rating,
  organization: rating,
  route: rating,
  hydration: rating,
  finishArea: rating,
  likedMost: openAnswer,
  improve: openAnswer,
  returnIntent: z.enum(returnOptions),
  recommend: z
    .string()
    .trim()
    .regex(/^(?:\d|10)$/)
    .transform(Number)
    .optional(),
});

export type SurveyResponse = z.infer<typeof surveyResponseSchema>;

export function toSurveySubmission(data: SurveyResponse, registrationId: string) {
  return {
    submission_id: data.submissionId,
    registration_id: registrationId,
    overall: data.overall,
    organization: data.organization,
    route: data.route,
    hydration: data.hydration,
    finish_area: data.finishArea,
    liked_most: data.likedMost,
    improve: data.improve,
    return_intent: data.returnIntent,
    recommend: data.recommend ?? null,
    survey_version: surveyVersion,
  };
}
