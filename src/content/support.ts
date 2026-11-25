/**
 * Página /sumate: las tres formas de apoyar el proyecto. Cada una abre
 * WhatsApp con un mensaje ya escrito, para que la organización sepa desde el
 * primer mensaje qué tipo de apoyo le están ofreciendo.
 */
export const supportPage = {
  title: 'Súmate a Corre y Libérate',
  intro: 'Elige cómo quieres apoyar la carrera y escríbenos por WhatsApp.',
} as const;

export const allyContributions = [
  'Servicios',
  'Productos',
  'Conocimiento',
  'Espacios',
  'Difusión',
  'Voluntariado',
  'Tecnología',
  'Transporte',
  'Salud',
  'Educación',
  'Primeros auxilios',
  'Logística',
  'Otro',
] as const;

export type AllyContribution = (typeof allyContributions)[number];

export const supportOptions = [
  {
    id: 'patrocinador',
    title: 'Quiero ser patrocinador',
    description: 'Para empresas y marcas que quieran vincularse comercialmente al proyecto.',
    message: 'Hola, quiero ser patrocinador de Corre y Libérate. Mi empresa o marca es: ',
  },
  {
    id: 'donar',
    title: 'Quiero donar',
    description: 'Para personas u organizaciones que quieran hacer un aporte económico voluntario.',
    message: 'Hola, quiero hacer una donación a Corre y Libérate.',
  },
  {
    id: 'aliado',
    title: 'Quiero ser aliado',
    description:
      'No todo aliado pone dinero. Puedes aportar servicios, productos, conocimiento, tiempo y mucho más.',
    message: 'Hola, quiero ser aliado de Corre y Libérate.',
  },
] as const;

/** Mensaje del aliado con lo que marcó que puede aportar, en el orden de la lista. */
export function allyMessage(selected: readonly AllyContribution[]) {
  const base = supportOptions[2].message;
  const chosen = allyContributions.filter((item) => selected.includes(item));
  return chosen.length ? `${base} Puedo aportar: ${chosen.join(', ')}.` : base;
}

/** Enlace a WhatsApp con el mensaje escrito; `whatsappUrl` es el `wa.me` del sitio. */
export function whatsappLink(whatsappUrl: string, message: string) {
  return `${whatsappUrl}?text=${encodeURIComponent(message)}`;
}
