import { z } from 'zod';

import { navLinkSchema } from '@/domain/event/schema';

/**
 * Navegacion del sitio.
 *
 * Una sola lista para el header, el menu movil y el footer: hoy los tres
 * repetian los mismos seis enlaces y era cuestion de tiempo que uno quedara
 * desactualizado. Los `href` son anclas validadas contra el esquema.
 */
export const navLinks = z
  .array(navLinkSchema)
  .nonempty()
  .parse([
    { href: '#distancias', label: 'Distancias' },
    { href: '#precios', label: 'Precios' },
    { href: '#premiacion', label: 'Premiación' },
    { href: '#kit', label: 'Kit' },
    { href: '#como-llegar', label: 'Como llegar' },
    { href: '#patrocinadores', label: 'Patrocinadores' },
  ]);

/** Ancla del hero, a donde vuelve el logo del header. */
export const homeAnchor = '#inicio';
