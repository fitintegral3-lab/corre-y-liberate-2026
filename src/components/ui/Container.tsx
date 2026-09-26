import { cn } from '@/lib/utils/cn';

import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Lienzo centrado del sitio.
 *
 * El ancho maximo del diseno (1366px) estaba repetido en nueve secciones como
 * `max-w-[1366px]`. Ahora vive una sola vez, como token `--container-canvas`.
 */
export function Container({ children, className }: ContainerProps) {
  return <div className={cn('mx-auto w-full max-w-canvas', className)}>{children}</div>;
}
