'use client';

import React from 'react';
import Image from 'next/image';
import { EVENT_DATA } from '../../config/event-data';
import { MagneticPillButton } from '../ui/MagneticPillButton';

export const SegundaEdicionSection: React.FC = () => {
  return (
    <section className="bg-white py-14 sm:py-20 px-4 sm:px-8 text-center relative z-20">
      <div className="max-w-4xl mx-auto flex flex-col items-center space-y-4">
        {/* Integral Fit Red Isotype Logo */}
        <div className="relative w-12 h-12 mb-1">
          <Image
            src="/logos/integral-fit.png"
            alt="Integral Fit"
            fill
            className="object-contain"
          />
        </div>

        {/* Edition Heading */}
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#E62B1E]">
          2ª EDICIÓN
        </h2>

        {/* Manifesto Sentence */}
        <p className="text-base sm:text-lg lg:text-xl font-bold text-neutral-900 max-w-3xl leading-relaxed">
          Volvemos a la línea de salida con más energía, más propósito y una nueva oportunidad para proteger, inspirar y transformar.
        </p>

        {/* Gray CTA Button */}
        <div className="pt-3">
          <MagneticPillButton
            variant="gray"
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 sm:px-12 py-3 text-xs sm:text-sm tracking-wider"
          >
            CORRE POR TU META. ¡INSCRÍBETE AHORA!
          </MagneticPillButton>
        </div>
      </div>
    </section>
  );
};
