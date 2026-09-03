'use client';

import React from 'react';
import Image from 'next/image';
import { PRESALES, EVENT_DATA } from '../../config/event-data';
import { MagneticPillButton } from '../ui/MagneticPillButton';

export const PreventasSection: React.FC = () => {
  return (
    <section id="precios" className="relative py-16 lg:py-24 bg-[#0F0C20] overflow-hidden">
      {/* Background Photo Overlay */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <Image
          src="/images/assets/img_xref_25.png"
          alt="Corredores"
          fill
          className="object-cover"
        />
      </div>

      {/* Atmospheric Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-purple-900/20 blur-3xl pointer-events-none" />

      <div className="max-w-[1366px] mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm sm:text-base font-black italic uppercase tracking-widest text-[#FF4D00] block mb-1">
            PREVENTAS
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black italic uppercase tracking-tight text-white drop-shadow">
            ¡ASEGURA TU CUPO AL MEJOR PRECIO!
          </h2>
        </div>

        {/* Preventas Table Container */}
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[720px] max-w-5xl mx-auto rounded-3xl border border-white/20 bg-black/40 backdrop-blur-md p-4 sm:p-6 shadow-2xl">
            {/* Table Header */}
            <div className="grid grid-cols-4 pb-4 border-b border-white/20 text-center items-end">
              <div className="text-left pl-3">
                <span className="text-xs sm:text-sm font-black uppercase text-white/80 tracking-wider">
                  CATEGORÍAS
                </span>
              </div>

              {/* Preventas 1 */}
              <div className="px-2">
                <span className="text-sm sm:text-base font-black uppercase text-white block">
                  PREVENTAS 1
                </span>
                <span className="text-[11px] font-bold text-orange-400 block">
                  ¡Aprovecha el mejor precio!
                </span>
                <span className="text-[10px] text-white/60 block mt-1">
                  1 de agosto al 15 de septiembre de 2026
                </span>
              </div>

              {/* Preventas 2 (Etapa Intermedia) */}
              <div className="px-2 border-x border-white/10 bg-white/5 py-1 rounded-xl">
                <span className="text-sm sm:text-base font-black uppercase text-white block">
                  PREVENTAS 2
                </span>
                <span className="text-[11px] font-bold text-neutral-300 block">
                  Precio intermedio
                </span>
                <span className="text-[10px] text-white/60 block mt-1">
                  16 de septiembre al 31 de octubre de 2026
                </span>
              </div>

              {/* Preventas 3 */}
              <div className="px-2">
                <span className="text-sm sm:text-base font-black uppercase text-white block">
                  PREVENTAS 3
                </span>
                <span className="text-[11px] font-bold text-neutral-300 block">
                  Última oportunidad
                </span>
                <span className="text-[10px] text-white/60 block mt-1">
                  1 al 21 de noviembre de 2026
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/10">
              {PRESALES.map((row) => (
                <div
                  key={row.distanceKey}
                  className="grid grid-cols-4 py-4 sm:py-5 items-center text-center hover:bg-white/[0.03] transition-colors"
                >
                  <div className="text-left pl-3">
                    <span className="text-xl sm:text-3xl font-black italic text-white block">
                      {row.label}
                    </span>
                    <span className="text-[11px] sm:text-xs text-white/70 font-semibold block">
                      {row.subtitle}
                    </span>
                  </div>

                  <div className="text-lg sm:text-2xl font-black italic text-white">
                    {row.presale1}
                  </div>

                  <div className="text-lg sm:text-2xl font-black italic text-[#FF4D00] bg-orange-500/10 py-1.5 rounded-lg border border-orange-500/20">
                    {row.presale2}
                  </div>

                  <div className="text-lg sm:text-2xl font-black italic text-white">
                    {row.presale3}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section Bottom CTA Button */}
        <div className="text-center mt-10">
          <MagneticPillButton
            variant="white"
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-10 py-3.5 text-sm sm:text-base"
          >
            ASEGURA TU CUPO AHORA
          </MagneticPillButton>
        </div>
      </div>
    </section>
  );
};
