import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Une clases de Tailwind resolviendo los conflictos por la ultima que gana.
 *
 * Sin esto, `cn('px-4', props.className)` con `px-8` deja las dos en el DOM y
 * cual manda depende del orden en la hoja de estilos, no del que escribio el
 * componente.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
