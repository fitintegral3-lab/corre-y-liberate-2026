/**
 * Inicio entre ediciones. Con `active` en `true` el sitio muestra esta página
 * en vez de la landing de la carrera; para abrir la edición 2027 se pone en
 * `false` y la landing vuelve tal como estaba.
 */
export const offSeason = {
  active: true,
  eyebrow: 'Gracias por correr con nosotros en 2026',
  title: 'En preparativos para Corre y Libérate 2027',
  intro:
    'Estamos preparando la próxima edición. Mientras tanto, cuéntanos cómo te fue, descarga las fotos y súmate al proyecto.',
  links: [
    {
      id: 'encuesta',
      title: 'Cuéntanos cómo te fue',
      description: 'Responde la encuesta de experiencia 2026. Toma 2 minutos.',
      href: '/encuesta',
    },
    {
      id: 'fotos',
      title: 'Fotos y videos 2026',
      description: 'Descarga las fotos y los videos de la carrera desde Google Drive.',
      href: 'https://drive.google.com/drive/folders/1wAN-aUvih1MPXtcATfC3Z0wTbZcT39Ub',
    },
    {
      id: 'sumate',
      title: 'Súmate',
      description: 'Patrocina, dona o sé aliado de la edición 2027.',
      href: '/sumate',
    },
  ],
} as const;
