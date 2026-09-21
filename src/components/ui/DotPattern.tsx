import { cn } from '@/lib/utils/cn';

interface DotPatternProps {
  /** Color de cada punto. El hero los usa mas tenues que la premiacion. */
  dotColor?: string;
  /**
   * Desvanece el patron hacia la derecha. Lo usa el hero para que los puntos
   * acompanen el titulo y desaparezcan antes de la fotografia del corredor.
   */
  fadeToRight?: boolean;
  className?: string;
}

/**
 * Trama de puntos (halftone) caracteristica de la identidad grafica.
 *
 * Es decorativa: `aria-hidden` y `pointer-events-none` para que no aparezca en
 * lectores de pantalla ni intercepte clics.
 */
export function DotPattern({
  dotColor = 'rgba(0, 0, 0, 0.45)',
  fadeToRight = false,
  className,
}: DotPatternProps) {
  const fade =
    'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 72%)';

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{
        backgroundImage: `radial-gradient(${dotColor} 1.5px, transparent 1.5px)`,
        backgroundSize: '15px 15px',
        ...(fadeToRight ? { maskImage: fade, WebkitMaskImage: fade } : {}),
      }}
    />
  );
}
