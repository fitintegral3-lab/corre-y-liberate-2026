'use client';

import React from 'react';
import Image from 'next/image';
import { EVENT_DATA } from '../../config/event-data';

export const PixelPerfectPage: React.FC = () => {
  return (
    <div className="w-full bg-[#0B0B0E] flex flex-col items-center select-none">
      <div className="w-full max-w-[1366px] relative shadow-2xl overflow-hidden">
        
        {/* =========================================================================
            SECTION 01: HERO & SUB-BANNER (y: 0 - 800)
           ========================================================================= */}
        <section id="inicio" className="relative w-full aspect-[2732/1600] overflow-hidden">
          {/* Retina 2x Master Artboard */}
          <Image
            src="/images/sections/01_hero.png"
            alt="Corre y Libérate 2026 - Hero"
            fill
            priority
            sizes="(max-width: 1366px) 100vw, 1366px"
            className="object-cover pointer-events-none"
          />

          {/* Top Header Hotspots (Navbar) */}
          {/* Logo link to top */}
          <a href="#inicio" aria-label="Inicio" className="absolute top-[1.2%] left-[4.2%] w-[8%] h-[5.5%] cursor-pointer z-20" />
          
          {/* Nav Links */}
          <a href="#distancias" aria-label="Distancias" className="absolute top-[2.2%] left-[41.5%] w-[6.5%] h-[3.8%] cursor-pointer hover:opacity-80 z-20" />
          <a href="#precios" aria-label="Precios" className="absolute top-[2.2%] left-[49.5%] w-[4.8%] h-[3.8%] cursor-pointer hover:opacity-80 z-20" />
          <a href="#premiacion" aria-label="Premiación" className="absolute top-[2.2%] left-[55.5%] w-[6.5%] h-[3.8%] cursor-pointer hover:opacity-80 z-20" />
          <a href="#kit" aria-label="Kit" className="absolute top-[2.2%] left-[63.2%] w-[2.8%] h-[3.8%] cursor-pointer hover:opacity-80 z-20" />
          <a href="#como-llegar" aria-label="Cómo llegar" className="absolute top-[2.2%] left-[67.2%] w-[7.5%] h-[3.8%] cursor-pointer hover:opacity-80 z-20" />
          
          {/* Header Inscríbete Button */}
          <a
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inscríbete"
            className="absolute top-[1.5%] left-[76.2%] w-[8.5%] h-[4.8%] rounded-full cursor-pointer hover:scale-105 transition-all z-20"
          />

          {/* Anchor target for Distancias */}
          <div id="distancias" className="absolute top-[37%] left-0 w-full h-1" />

          {/* Clickable Hotspot for "CORRE CON NOSOTROS · 22 NOV" */}
          <a
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Corre con nosotros 22 Nov"
            className="absolute top-[61.5%] left-[4.2%] w-[19%] h-[5.2%] rounded-full cursor-pointer hover:scale-105 hover:ring-2 hover:ring-white/40 transition-all z-20"
          />

          {/* Clickable Hotspot for "INSCRÍBETE AHORA" in Urgency Banner */}
          <a
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inscríbete Ahora"
            className="absolute top-[91.2%] left-[42.5%] w-[15%] h-[6.5%] rounded-full cursor-pointer hover:scale-105 hover:ring-4 hover:ring-orange-500/50 transition-all z-20"
          />
        </section>

        {/* =========================================================================
            SECTION 02: PREMIACIÓN ECONÓMICA (y: 800 - 1500)
           ========================================================================= */}
        <section id="premiacion" className="relative w-full aspect-[2732/1400] overflow-hidden">
          {/* Master Artboard */}
          <Image
            src="/images/sections/02_premiacion.png"
            alt="Premiación Económica"
            fill
            sizes="(max-width: 1366px) 100vw, 1366px"
            className="object-cover pointer-events-none"
          />

          {/* Clickable Hotspot for "CORRE POR TU META. INSCRÍBETE AHORA!" */}
          <a
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inscríbete a la premiación"
            className="absolute top-[84.5%] left-[35%] w-[30%] h-[7.5%] rounded-full cursor-pointer hover:scale-105 hover:ring-4 hover:ring-black/30 transition-all z-20"
          />
        </section>

        {/* =========================================================================
            SECTION 03: 2ª EDICIÓN (y: 1500 - 1750)
           ========================================================================= */}
        <section className="relative w-full aspect-[2732/500] overflow-hidden">
          <Image
            src="/images/sections/03_segunda_edicion.png"
            alt="2ª Edición Integral Fit"
            fill
            sizes="(max-width: 1366px) 100vw, 1366px"
            className="object-cover pointer-events-none"
          />

          {/* Clickable Hotspot for "CORRE POR TU META. INSCRÍBETE AHORA!" */}
          <a
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inscríbete en la 2ª edición"
            className="absolute top-[71%] left-[40.5%] w-[19%] h-[19%] rounded-full cursor-pointer hover:scale-105 hover:ring-4 hover:ring-orange-500/50 transition-all z-20"
          />
        </section>

        {/* =========================================================================
            SECTION 04: PREVENTAS (y: 1750 - 2450)
           ========================================================================= */}
        <section id="precios" className="relative w-full aspect-[2732/1400] overflow-hidden">
          <Image
            src="/images/sections/04_preventas.png"
            alt="Preventas Corre y Libérate"
            fill
            sizes="(max-width: 1366px) 100vw, 1366px"
            className="object-cover pointer-events-none"
          />

          {/* Clickable Hotspot for "ASEGURA TU CUPO AHORA" */}
          <a
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Asegura tu cupo en preventas"
            className="absolute top-[84.5%] left-[34.8%] w-[30.4%] h-[7.5%] rounded-full cursor-pointer hover:scale-105 hover:ring-4 hover:ring-orange-500/50 transition-all z-20"
          />
        </section>

        {/* =========================================================================
            SECTION 05: KIT DEL CORREDOR (y: 2450 - 2950)
           ========================================================================= */}
        <section id="kit" className="relative w-full aspect-[2732/1000] overflow-hidden">
          <Image
            src="/images/sections/05_kit.png"
            alt="Kit del Corredor Corre y Libérate"
            fill
            sizes="(max-width: 1366px) 100vw, 1366px"
            className="object-cover pointer-events-none"
          />

          {/* Clickable Hotspot for "INSCRÍBETE Y VIVE LA EXPERIENCIA" */}
          <a
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Inscríbete y vive la experiencia"
            className="absolute top-[71%] left-[50.5%] w-[27%] h-[10.5%] rounded-full cursor-pointer hover:scale-105 hover:ring-4 hover:ring-orange-500/50 transition-all z-20"
          />
        </section>

        {/* =========================================================================
            SECTION 06: UBICACIÓN (y: 2950 - 3700)
           ========================================================================= */}
        <section id="como-llegar" className="relative w-full aspect-[2732/1500] overflow-hidden">
          <Image
            src="/images/sections/06_ubicacion.png"
            alt="Ubicación Estadio El Cacique Jamundí"
            fill
            sizes="(max-width: 1366px) 100vw, 1366px"
            className="object-cover pointer-events-none"
          />

          {/* Clickable Map Area directly opening Google Maps */}
          <a
            href={EVENT_DATA.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Abrir mapa en Google Maps"
            className="absolute top-[28%] left-[2%] w-[48%] h-[48%] cursor-pointer hover:ring-4 hover:ring-orange-500/40 rounded-2xl transition-all z-20"
          />

          {/* Clickable Hotspot for "VER CÓMO LLEGAR ->" Button */}
          <a
            href={EVENT_DATA.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ver cómo llegar a Estadio El Cacique"
            className="absolute top-[78.8%] left-[28.5%] w-[16.5%] h-[6.5%] rounded-full cursor-pointer hover:scale-105 hover:ring-4 hover:ring-neutral-700/50 transition-all z-20"
          />
        </section>

        {/* =========================================================================
            SECTION 07: PROPÓSITO SOCIAL (y: 3700 - 4250)
           ========================================================================= */}
        <section className="relative w-full aspect-[2732/1100] overflow-hidden">
          <Image
            src="/images/sections/07_proposito.png"
            alt="Propósito Social Corre y Libérate"
            fill
            sizes="(max-width: 1366px) 100vw, 1366px"
            className="object-cover pointer-events-none"
          />
        </section>

        {/* =========================================================================
            SECTION 08: FOOTER (y: 4250 - 4499)
           ========================================================================= */}
        <section className="relative w-full aspect-[2732/498] overflow-hidden">
          <Image
            src="/images/sections/08_footer.png"
            alt="Footer Institucional"
            fill
            sizes="(max-width: 1366px) 100vw, 1366px"
            className="object-cover pointer-events-none"
          />

          {/* Interactive Navigation Links Over Footer Menu */}
          <a href="#distancias" className="absolute top-[67%] left-[45.5%] w-[4.5%] h-[6%] cursor-pointer hover:opacity-80 z-20" />
          <a href="#precios" className="absolute top-[67%] left-[50.2%] w-[3.5%] h-[6%] cursor-pointer hover:opacity-80 z-20" />
          <a href="#premiacion" className="absolute top-[67%] left-[54.0%] w-[4.5%] h-[6%] cursor-pointer hover:opacity-80 z-20" />
          <a href="#kit" className="absolute top-[67%] left-[58.8%] w-[2.2%] h-[6%] cursor-pointer hover:opacity-80 z-20" />
          <a href="#como-llegar" className="absolute top-[67%] left-[61.5%] w-[5.5%] h-[6%] cursor-pointer hover:opacity-80 z-20" />

          {/* WhatsApp Social Circle */}
          <a
            href={EVENT_DATA.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="absolute top-[78%] left-[46.8%] w-[2.8%] h-[15.5%] rounded-full cursor-pointer hover:scale-115 hover:ring-2 hover:ring-white transition-all z-20"
          />

          {/* Instagram Social Circle */}
          <a
            href={EVENT_DATA.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="absolute top-[78%] left-[50.9%] w-[2.8%] h-[15.5%] rounded-full cursor-pointer hover:scale-115 hover:ring-2 hover:ring-white transition-all z-20"
          />

          {/* Facebook Social Circle */}
          <a
            href={EVENT_DATA.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="absolute top-[78%] left-[55.1%] w-[2.8%] h-[15.5%] rounded-full cursor-pointer hover:scale-115 hover:ring-2 hover:ring-white transition-all z-20"
          />
        </section>

      </div>
    </div>
  );
};
