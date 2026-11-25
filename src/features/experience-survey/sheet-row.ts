import { ratingQuestions, type SurveyResponse } from './schema';

export const SURVEY_TAB = 'Encuesta';

/** Lo que la hoja muestra de quien respondió, leído de su inscripción. */
export interface SurveyRespondent {
  first_name: string;
  last_name: string;
  cedula: string;
  phone: string;
  email: string;
  distance_id: string;
  category: string;
}

export const SURVEY_HEADERS = [
  'Referencia',
  'Fecha de envío (UTC)',
  'Nombres',
  'Apellidos',
  'Cédula',
  'Celular',
  'Correo electrónico',
  'Distancia',
  'Categoría',
  'Experiencia general (1-5)',
  'Organización (1-5)',
  'Ruta y señalización (1-5)',
  'Hidratación y atención (1-5)',
  'Zona de llegada y actividades (1-5)',
  'Lo que más le gustó',
  'Qué mejorar',
  '¿Participaría en 2027?',
  'Recomendación (0-10)',
] as const;

export function toSurveyRow(data: SurveyResponse, person: SurveyRespondent, receivedAt: string) {
  return [
    data.submissionId,
    receivedAt,
    person.first_name,
    person.last_name,
    person.cedula,
    person.phone,
    person.email,
    person.distance_id,
    person.category,
    ...ratingQuestions.map(({ name }) => data[name]),
    data.likedMost,
    data.improve,
    data.returnIntent,
    data.recommend ?? null,
  ];
}
