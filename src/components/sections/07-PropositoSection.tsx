'use client';

import React from 'react';
import Image from 'next/image';
import { PILLARS } from '../../config/event-data';

export const PropositoSection: React.FC = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-[#0A0614] text-white overflow-hidden">
      {/* Ambient Radial Glow */}
      <div className="absolute top-1/2 left-0 w-1/2 h-1/2 bg-purple-900/15 blur-3xl pointer-events-none" />

      <div className="max-w-[1366px] mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Manifesto & 3 Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight text-white">
              CORREMOS POR ALGO <br />
              QUE VA MÁS ALLÁ <br />
              DE LA META.
            </h2>

            <p className="text-sm sm:text-base lg:text-lg text-neutral-300 font-medium leading-relaxed">
              Corre y Libérate conecta deporte, bienestar y propósito en una experiencia para moverte, superarte y generar un impacto positivo.
            </p>

            {/* The 3 Pillars List */}
            <div className="space-y-4 pt-2">
              {PILLARS.map((pillar) => (
                <div key={pillar.number} className="flex items-start gap-4">
                  <span className="text-lg sm:text-xl font-black text-[#FF4D00] tracking-wider shrink-0 mt-0.5">
                    {pillar.number} — {pillar.title}
                  </span>
                  <p className="text-xs sm:text-sm lg:text-base text-neutral-300 font-normal leading-relaxed pt-0.5">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: High-Res Real Photography of Celebratory Runners */}
          <div className="lg:col-span-6 relative h-[360px] sm:h-[460px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <Image
              src="/images/assets/img_xref_33.png"
              alt="Corredoras Corre y Libérate en meta"
              fill
              className="object-cover object-center"
            />
            {/* Subtle Gradient Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};
