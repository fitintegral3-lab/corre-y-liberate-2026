/**
 * Estado del formulario de la Feria Empresarial. Cerrado, la página lo avisa y
 * la API rechaza envíos nuevos; las respuestas guardadas no se tocan.
 */
export const entrepreneurFair = {
  open: false,
  closedMessage:
    'El formulario de la Feria Empresarial de 2026 ya cerró. ¡Gracias a todas las emprendedoras que participaron!',
} as const;
