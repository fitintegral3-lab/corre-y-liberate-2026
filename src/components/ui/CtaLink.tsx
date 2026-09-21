import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

import type { ReactNode } from 'react';

/**
 * Llamado a la accion hacia la plataforma de inscripciones.
 *
 * Es el boton que se repite en las seis secciones. Lo compartido —tipografia,
 * la flecha que se desplaza al pasar el mouse, el escalado, `rel="noopener"`—
 * vive aca; el color y la sombra de cada seccion entran por `variant` y
 * `className`, porque son decisiones del diseno de esa seccion y no del boton.
 */
const variantClasses = {
  light: 'bg-white text-black hover:bg-neutral-50 hover:text-brand-orange',
  brand: 'bg-brand-orange text-white hover:bg-brand-orange-bright',
  brandDeep: 'bg-brand-orange text-white hover:bg-brand-orange-deep',
} as const;

const sizeClasses = {
  sm: 'gap-1.5 px-6 py-2.5 text-xs',
  md: 'gap-2 px-8 py-3.5 text-xs sm:text-sm',
  lg: 'gap-2 px-10 py-4 text-xs sm:text-sm',
} as const;

export interface CtaLinkProps {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  withIcon?: boolean;
  iconSize?: number;
  className?: string;
}

export function CtaLink({
  href,
  children,
  variant = 'light',
  size = 'lg',
  withIcon = true,
  iconSize = 16,
  className,
}: CtaLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group inline-flex cursor-pointer items-center rounded-full font-athletic-bold tracking-wider transition-all duration-300 hover:scale-[1.08] active:scale-95',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
      {withIcon && (
        <ArrowUpRight
          size={iconSize}
          aria-hidden="true"
          className="stroke-[3] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
        />
      )}
    </a>
  );
}
