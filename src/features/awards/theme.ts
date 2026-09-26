import type { AwardTheme } from '@/domain/event/schema';

/**
 * Traduccion del tema de cada tarjeta de premiacion a clases y color de fondo.
 *
 * El contenido dice «purple», «light» o «dark»; que significa cada uno en
 * pixeles se decide aca. Asi cambiar la opacidad del morado no obliga a tocar
 * `src/content/awards.ts`, que es donde viven los premios.
 */
interface AwardCardStyle {
  /** Fondo con opacidad exacta del diseno original. */
  background: string;
  text: string;
  border: string;
  divider: string;
}

export const awardCardStyles: Record<AwardTheme, AwardCardStyle> = {
  purple: {
    background: 'rgba(56, 18, 71, 0.75)',
    text: 'text-white',
    border: 'border-white/35',
    divider: 'divide-white/20',
  },
  light: {
    background: 'rgba(255, 255, 255, 0.65)',
    text: 'text-[#1a1208]',
    border: 'border-black/30',
    divider: 'divide-black/20',
  },
  dark: {
    background: 'rgba(0, 0, 0, 0.45)',
    text: 'text-white',
    border: 'border-white/35',
    divider: 'divide-white/20',
  },
};
