import './globals.css';

import { buildSiteMetadata } from '@/lib/seo/metadata';
import { bodyFont, displayFont } from '@/styles/fonts';
import { cn } from '@/lib/utils/cn';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = buildSiteMetadata();

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="es"
      // Desde Next 16 el framework ya no pisa `scroll-behavior` durante una
      // navegacion salvo que se lo pida este atributo. Sin el, saltar a un
      // ancla y volver dejaria la animacion suave a medio camino.
      data-scroll-behavior="smooth"
      className={cn(displayFont.variable, bodyFont.variable, 'scroll-smooth')}
    >
      <body className="min-h-screen bg-white text-ink antialiased">{children}</body>
    </html>
  );
}
