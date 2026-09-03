'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EVENT_DATA, DISTANCES } from '../../config/event-data';
import { MagneticPillButton } from '../ui/MagneticPillButton';
import { CountdownTimer } from '../ui/CountdownTimer';
import { runnerHeroVariants, fadeUpVariants } from '../../motion/variants';

export const HeroSection: React.FC = () => {
  return (
    <section id="inicio" className="relative pt-20 overflow-hidden bg-[#0B0B0E]">
      {/* Upper Hero Grid */}
      <div className="relative min-h-[680px] lg:min-h-[760px] flex items-stretch">
        {/* Left Side: Dynamic Orange Athletic Block */}
        <div className="w-full lg:w-[54%] bg-gradient-to-br from-[#FF4D00] via-[#F24500] to-[#E63E00] relative z-10 px-6 sm:px-12 lg:px-16 py-12 lg:py-16 flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Subtle Vertical Texture Lines */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none mix-blend-multiply bg-cover"
            style={{ backgroundImage: "url('/images/assets/img_xref_29.png')" }}
          />

          {/* Slogan and Main Headline */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 space-y-3"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black italic tracking-tighter text-white uppercase leading-[0.95] drop-shadow-sm">
              CORRE Y <br />
              LIBÉRATE 2026
            </h1>

            <p className="text-sm sm:text-lg lg:text-xl font-extrabold italic uppercase tracking-wider text-white/95">
              CADA KILÓMETRO <span className="underline decoration-white/40">PROTEGE, INSPIRA Y TRANSFORMA</span>
            </p>
          </motion.div>

          {/* Dynamic Countdown Timer */}
          <div className="relative z-10 my-4 bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/20 max-w-md">
            <div className="text-[11px] font-black tracking-widest text-center text-white/90 uppercase pb-1">
              Faltan para la salida oficial:
            </div>
            <CountdownTimer />
          </div>

          {/* Distances and Departure Times Grid */}
          <div id="distancias" className="relative z-10">
            <div className="rounded-2xl border border-white/50 bg-black/20 backdrop-blur-md p-3 sm:p-4 shadow-xl">
              <div className="grid grid-cols-4 divide-x divide-white/40 text-center">
                {DISTANCES.map((d) => (
                  <div key={d.id} className="px-2 sm:px-4 py-1">
                    <span className="text-2xl sm:text-4xl lg:text-5xl font-black italic tracking-tight text-white block">
                      {d.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white/90 block mt-0.5">
                      {d.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Badge Pill */}
            <div className="mt-5 flex items-center gap-4">
              <span className="inline-block bg-white text-black font-black uppercase tracking-wider text-xs sm:text-sm px-6 py-2 rounded-full shadow-md">
                CORRE CON NOSOTROS · 22 NOV
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Jamundí Graphic Artboard & Runner */}
        <div className="hidden lg:block lg:w-[46%] relative bg-gradient-to-b from-[#2E0E74] via-[#1E0952] to-[#0F0C20] overflow-hidden">
          {/* Background Illustration of Cathedral & Jamundí Track */}
          <div className="absolute inset-0">
            <Image
              src="/images/assets/img_xref_23.png"
              alt="Circuito Jamundí"
              fill
              className="object-cover object-left opacity-90"
              priority
            />
          </div>

          {/* Cacique Monument Silhouette */}
          <div className="absolute top-12 left-8 w-24 h-48 opacity-85 pointer-events-none">
            <Image
              src="/images/assets/img_xref_27.png"
              alt="Monumento Cacique"
              fill
              className="object-contain"
            />
          </div>

          {/* Female Runner Athlete Cutout */}
          <motion.div
            variants={runnerHeroVariants}
            initial="hidden"
            animate="visible"
            className="absolute bottom-0 right-0 h-[92%] w-[90%] pointer-events-none"
          >
            <Image
              src="/images/assets/img_xref_26.png"
              alt="Corredora Corre y Libérate 2026"
              fill
              className="object-contain object-bottom drop-shadow-2xl"
              priority
            />
          </motion.div>
        </div>
      </div>

      {/* Sub-Hero Urgent Callout Banner ("¡LAS INSCRIPCIONES YA ESTÁN ABIERTAS!") */}
      <div className="relative bg-[#0F0C20] border-t-2 border-orange-500/30 py-10 px-4 sm:px-8 text-center overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-orange-600/15 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-3">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black italic uppercase tracking-tight text-white">
            ¡LAS INSCRIPCIONES YA ESTÁN ABIERTAS!
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl mx-auto font-medium">
            Aprovecha los <span className="text-[#FF4D00] font-bold">precios especiales hasta el 31 de octubre de 2026</span> y asegura tu lugar en la línea de salida.
          </p>

          <div className="pt-3">
            <MagneticPillButton
              variant="white"
              href={EVENT_DATA.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-3.5 text-base"
            >
              INSCRÍBETE AHORA
            </MagneticPillButton>
          </div>
        </div>
      </div>
    </section>
  );
};
