'use client';

import React from 'react';
import Image from 'next/image';
import { RUNNER_KIT_ITEMS, EVENT_DATA } from '../../config/event-data';
import { MagneticPillButton } from '../ui/MagneticPillButton';

export const KitCorredorSection: React.FC = () => {
  return (
    <section id="kit" className="relative py-16 lg:py-24 bg-[#08080A] text-white overflow-hidden">
      <div className="max-w-[1366px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Real Photo of Participants with Medal */}
          <div className="lg:col-span-5 relative h-[360px] sm:h-[460px] lg:h-[520px] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <Image
              src="/images/assets/img_xref_30.png"
              alt="Corredoras con medalla"
              fill
              className="object-cover object-top"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Right Column: Kit Details and Official Icons */}
          <div className="lg:col-span-7 space-y-6 lg:pl-4">
            <div className="space-y-2">
              <span className="text-sm sm:text-base font-bold italic text-white/70 block uppercase tracking-wider">
                Todo listo para tu carrera
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tight leading-tight text-white">
                CORRE Y LIBÉRATE INCLUYE <br className="hidden sm:inline" />
                MUCHO MÁS QUE KILÓMETROS.
              </h2>
            </div>

            {/* The 6 Icons with Vertical Orange Dividers */}
            <div className="pt-4 pb-2">
              <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-1 py-4 border-y border-white/15">
                {RUNNER_KIT_ITEMS.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <div className="flex flex-col items-center text-center p-2 min-w-[70px] sm:min-w-[80px]">
                      <div className="relative w-9 h-9 sm:w-11 sm:h-11 mb-2">
                        <Image
                          src={item.iconSrc}
                          alt={item.name}
                          fill
                          className="object-contain filter brightness-0 invert"
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-bold tracking-wide text-neutral-200">
                        {item.name}
                      </span>
                    </div>

                    {/* Orange Vertical Divider */}
                    {index < RUNNER_KIT_ITEMS.length - 1 && (
                      <div className="hidden sm:block w-[1.5px] h-10 bg-[#FF4D00]/70" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Sponsors note */}
            <p className="text-xs sm:text-sm text-neutral-400 italic">
              Y experiencias adicionales de nuestros aliados durante el evento.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <MagneticPillButton
                variant="white"
                href={EVENT_DATA.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 sm:px-10 py-3.5 text-xs sm:text-sm tracking-wider"
              >
                INSCRÍBETE Y VIVE LA EXPERIENCIA
              </MagneticPillButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
