'use client';

import React from 'react';
import Image from 'next/image';
import { EVENT_DATA, DISTANCES } from '../../config/event-data';
import { ArrowRight } from 'lucide-react';

export const UbicacionSection: React.FC = () => {
  return (
    <section id="como-llegar" className="relative py-16 lg:py-24 bg-white overflow-hidden text-neutral-900">
      {/* Framing Graphic with Orange Brush Strokes and Palm Trees */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <Image
          src="/images/assets/img_xref_31.png"
          alt="Marco artístico"
          fill
          className="object-cover object-center"
        />
      </div>

      <div className="max-w-[1366px] mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-10 lg:mb-14">
          <span className="text-xs sm:text-sm font-black italic uppercase tracking-widest text-[#2E0E74] block mb-1">
            {EVENT_DATA.slogan}
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#191147]">
            Todo empieza en El Cacique.
          </h2>
          <p className="text-sm sm:text-lg font-bold text-[#2E0E74]/90 mt-1">
            {EVENT_DATA.dateFull} · {EVENT_DATA.city}
          </p>
        </div>

        {/* 2 Main Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Card: Map & Address */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col justify-between">
            {/* Map Image Snapshot with Pin */}
            <div className="relative h-[260px] sm:h-[320px] w-full bg-neutral-100">
              <Image
                src="/images/assets/img_xref_24.png"
                alt="Mapa Estadio El Cacique Jamundí"
                fill
                className="object-cover"
              />
            </div>

            {/* Address Info & Action */}
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-50/50">
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#191147]">
                  {EVENT_DATA.venue}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-neutral-600 mt-0.5">
                  {EVENT_DATA.address} — {EVENT_DATA.city}
                </p>
              </div>

              <a
                href={EVENT_DATA.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#8F8798] hover:bg-[#7E7588] text-white text-xs sm:text-sm font-black uppercase tracking-wider px-6 py-3 rounded-full shadow transition-colors"
              >
                <span>VER CÓMO LLEGAR</span>
                <ArrowRight size={16} />
              </a>
            </div>
          </div>

          {/* Right Card: Schedule & Opening Times */}
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-[#191147] p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Date Block */}
              <div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-500 block">
                  DOMINGO
                </span>
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase text-[#FF4D00] tracking-tight block">
                  {EVENT_DATA.dateShort}
                </span>
              </div>

              <div className="h-[1px] bg-neutral-200 w-full" />

              {/* Apertura del evento */}
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500 block">
                  APERTURA DEL EVENTO
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#191147] tracking-tight block">
                  {EVENT_DATA.openingTime}
                </span>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1 leading-relaxed">
                  {EVENT_DATA.openingText}
                </p>
              </div>
            </div>

            {/* Horarios de Salida */}
            <div className="pt-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-neutral-800 block mb-3">
                HORARIOS DE SALIDA
              </span>

              {/* 4 Pods container */}
              <div className="rounded-2xl border border-neutral-300 bg-neutral-50 p-2 sm:p-3">
                <div className="grid grid-cols-4 divide-x divide-neutral-300 text-center">
                  {DISTANCES.map((d) => (
                    <div key={d.id} className="px-1 py-1">
                      <span className="text-lg sm:text-2xl font-black italic text-[#191147] block">
                        {d.label}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-neutral-600 block mt-0.5">
                        {d.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
