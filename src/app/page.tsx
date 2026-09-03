'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Menu, X, MessageCircle, Sparkles } from 'lucide-react';

const REGISTRATION_URL = 'https://cronometrajeinstantaneo.com/inscripciones/corre-y-liberate';
const MAPS_URL = 'https://share.google/VDmYIqfv4StJiX6wc';
const INSTAGRAM_URL = 'https://www.instagram.com/correyliberate';
const WHATSAPP_URL = 'https://wa.me/573001613479';

const distances = [
  { label: '5K', time: '6:20 am' },
  { label: '7K', time: '6:10 am' },
  { label: '10K', time: '6:00 am' },
  { label: '3K', time: '6:30 am' },
];

const prizes = [
  {
    distance: '5K',
    cardBg: 'rgba(56, 18, 71, 0.75)', // MORADO 75%
    textColor: 'text-white',
    borderBottom: 'border-white/35',
    borderDivider: 'divide-white/20',
    rows: [
      { place: '1.º LUGAR', women: '$250.000', men: '$250.000' },
      { place: '2.º LUGAR', women: '$100.000', men: '$100.000' },
      { place: '3.º LUGAR', women: '$50.000', men: '$50.000' },
    ],
    total: '$400.000',
  },
  {
    distance: '7K',
    cardBg: 'rgba(255, 255, 255, 0.65)', // BLANCO 65%
    textColor: 'text-[#1a1208]',
    borderBottom: 'border-black/30',
    borderDivider: 'divide-black/20',
    rows: [
      { place: '1.º LUGAR', women: '$350.000', men: '$350.000' },
      { place: '2.º LUGAR', women: '$150.000', men: '$150.000' },
      { place: '3.º LUGAR', women: '$100.000', men: '$100.000' },
    ],
    total: '$600.000',
  },
  {
    distance: '10K',
    cardBg: 'rgba(0, 0, 0, 0.45)', // NEGRO 45%
    textColor: 'text-white',
    borderBottom: 'border-white/35',
    borderDivider: 'divide-white/20',
    rows: [
      { place: '1.º LUGAR', women: '$800.000', men: '$800.000' },
      { place: '2.º LUGAR', women: '$450.000', men: '$450.000' },
      { place: '3.º LUGAR', women: '$250.000', men: '$250.000' },
    ],
    total: '$1.500.000',
  },
];

const presales = [
  {
    phase: 'PREVENTAS 1',
    sub: '¡Aprovecha el mejor precio!',
    prices: ['$100.000', '$120.000', '$140.000', '$90.000'],
    date: '1 de agosto al 15 de septiembre de 2026',
  },
  {
    phase: 'PREVENTAS 2',
    sub: 'Precio intermedio',
    prices: ['$120.000', '$140.000', '$160.000', '$90.000'],
    date: '16 de septiembre al 31 de octubre de 2026',
  },
  {
    phase: 'PREVENTAS 3',
    sub: 'Última oportunidad',
    prices: ['$140.000', '$160.000', '$180.000', '$90.000'],
    date: '1 al 21 de noviembre de 2026',
  },
];

const categories = [
  { name: '5K', sub: '5 kilómetros' },
  { name: '7K', sub: '7 kilómetros' },
  { name: '10K', sub: '10 kilómetros' },
  { name: '3K INFANTIL', sub: '5 kilómetros · (7 a 12 años)' },
];

const kitItems = [
  { icon: '/icons/icon_camiseta.png', label: 'Camiseta' },
  { icon: '/icons/icon_medalla.png', label: 'Medalla' },
  { icon: '/icons/icon_dorsal.png', label: 'Dorsal' },
  { icon: '/icons/icon_chip.png', label: 'Chip' },
  { icon: '/icons/icon_tula.png', label: 'Tula' },
  { icon: '/icons/icon_hidratacion.png', label: 'Hidratación' },
];

export default function RebuiltLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#111111] font-body selection:bg-[#cc420d] selection:text-white">
      
      {/* =========================================================================
          HEADER / NAVBAR (LOGO GRANDE + BOTÓN CON MICROINTERACCIÓN)
         ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm transition-all">
        <div className="max-w-[1366px] mx-auto px-4 sm:px-8 py-3 flex items-center justify-between">
          <a href="#inicio" className="flex items-center transition-transform duration-300 hover:scale-105">
            <Image
              src="/logos/logo_nav.png"
              alt="Corre y Libérate"
              width={260}
              height={70}
              className="h-14 sm:h-20 w-auto object-contain"
              priority
            />
          </a>

          <nav className="hidden lg:flex items-center gap-10">
            <a href="#distancias" className="text-xs font-athletic-bold tracking-wider text-neutral-800 hover:text-[#cc420d] transition-colors">Distancias</a>
            <a href="#precios" className="text-xs font-athletic-bold tracking-wider text-neutral-800 hover:text-[#cc420d] transition-colors">Precios</a>
            <a href="#premiacion" className="text-xs font-athletic-bold tracking-wider text-neutral-800 hover:text-[#cc420d] transition-colors">Premiación</a>
            <a href="#kit" className="text-xs font-athletic-bold tracking-wider text-neutral-800 hover:text-[#cc420d] transition-colors">Kit</a>
            <a href="#como-llegar" className="text-xs font-athletic-bold tracking-wider text-neutral-800 hover:text-[#cc420d] transition-colors">Como llegar</a>
          </nav>

          <div className="hidden lg:flex items-center">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#cc420d] hover:bg-[#ff5512] text-white text-xs font-athletic-bold tracking-wider px-9 py-3 rounded-full transition-all duration-300 hover:scale-[1.08] active:scale-95 shadow-lg shadow-orange-900/25 hover:shadow-orange-500/40 hover:shadow-xl cursor-pointer"
            >
              INSCRÍBETE
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-900 hover:text-[#cc420d] transition-transform hover:scale-110 active:scale-90"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X size={30} /> : <Menu size={30} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-neutral-100 px-6 py-5 flex flex-col gap-4 shadow-xl animate-in fade-in slide-in-from-top-3 duration-200">
            <a href="#distancias" onClick={() => setMobileMenuOpen(false)} className="text-base font-athletic-bold text-neutral-800 hover:text-[#cc420d] transition-colors">Distancias</a>
            <a href="#precios" onClick={() => setMobileMenuOpen(false)} className="text-base font-athletic-bold text-neutral-800 hover:text-[#cc420d] transition-colors">Precios</a>
            <a href="#premiacion" onClick={() => setMobileMenuOpen(false)} className="text-base font-athletic-bold text-neutral-800 hover:text-[#cc420d] transition-colors">Premiación</a>
            <a href="#kit" onClick={() => setMobileMenuOpen(false)} className="text-base font-athletic-bold text-neutral-800 hover:text-[#cc420d] transition-colors">Kit</a>
            <a href="#como-llegar" onClick={() => setMobileMenuOpen(false)} className="text-base font-athletic-bold text-neutral-800 hover:text-[#cc420d] transition-colors">Como llegar</a>
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#cc420d] hover:bg-[#ff5512] text-white text-center text-xs font-athletic-bold py-3.5 rounded-full mt-2 transition-all duration-300 hover:scale-[1.04] active:scale-95 shadow-md shadow-orange-900/30"
            >
              INSCRÍBETE
            </a>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION 01: HERO (CON PATRÓN DE PUNTOS SUTILES EN LA ZONA NARANJA)
         ========================================================================= */}
      <section 
        id="inicio" 
        className="relative bg-cover bg-right lg:bg-center overflow-hidden min-h-[660px] lg:min-h-[740px] flex items-center"
        style={{ backgroundImage: "url('/backgrounds/bg_hero.jpg')" }}
      >
        {/* Matriz de puntos negros sutiles en la zona naranja detrás del título y distancias */}
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.28) 1.5px, transparent 1.5px)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 72%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0) 72%)',
          }}
        />

        <div className="max-w-[1366px] mx-auto w-full px-4 sm:px-10 py-12 lg:py-16 relative z-20">
          <div className="max-w-2xl text-white space-y-6">
            <div>
              <h1 className="font-athletic text-7xl sm:text-8xl lg:text-[108px] text-white drop-shadow-md leading-[0.85]">
                CORRE Y <br />
                LIBÉRATE 2026
              </h1>
              <p className="mt-4 text-base sm:text-xl font-athletic-bold uppercase tracking-wider text-white/95">
                CADA KILÓMETRO <span className="underline decoration-white/50">PROTEGE, INSPIRA Y TRANSFORMA</span>
              </p>
            </div>

            {/* Distances schedule box con microinteracción hover */}
            <div id="distancias" className="inline-block w-full max-w-lg rounded-2xl border-2 border-white/60 bg-black/40 backdrop-blur-md p-4 sm:p-5 shadow-2xl transition-all duration-300 hover:border-white/90 hover:shadow-orange-950/40">
              <div className="grid grid-cols-4 divide-x divide-white/40 text-center">
                {distances.map((d) => (
                  <div key={d.label} className="px-2 transition-transform duration-300 hover:scale-105">
                    <span className="font-athletic text-4xl sm:text-6xl text-white block">
                      {d.label}
                    </span>
                    <span className="font-athletic-semibold text-xs sm:text-sm text-white/90 block mt-1">
                      {d.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <a
                href={REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-50 hover:text-[#cc420d] font-athletic-bold text-xs sm:text-sm tracking-wider px-10 py-4 rounded-full shadow-xl shadow-black/30 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-[1.08] active:scale-95 group cursor-pointer"
              >
                CORRE CON NOSOTROS · 22 NOV
                <ArrowUpRight size={16} className="stroke-[3] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION SUB-HERO: BANNER DE INSCRIPCIONES ABIERTAS
         ========================================================================= */}
      <section 
        className="relative bg-cover bg-center text-white py-16 px-4 sm:px-8 text-center overflow-hidden"
        style={{ backgroundImage: "url('/backgrounds/bg_inscriptions.jpg')" }}
      >
        <div className="max-w-4xl mx-auto relative z-10 space-y-4">
          <h2 className="font-athletic text-4xl sm:text-6xl text-white drop-shadow">
            ¡LAS INSCRIPCIONES YA ESTÁN ABIERTAS!
          </h2>
          <p className="font-athletic-semibold text-sm sm:text-base lg:text-lg text-neutral-200 max-w-2xl mx-auto">
            Aprovecha los <span className="text-[#cc420d] font-bold">precios especiales hasta el 31 de octubre de 2026</span> y asegura tu lugar en la línea de salida.
          </p>
          <div className="pt-2">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-50 hover:text-[#cc420d] font-athletic-bold text-xs sm:text-sm tracking-wider px-10 py-3.5 rounded-full shadow-xl shadow-black/30 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-[1.08] active:scale-95 group cursor-pointer"
            >
              INSCRÍBETE AHORA
              <ArrowUpRight size={16} className="stroke-[3] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 02: PREMIACIÓN ECONÓMICA (GRADIENTE CÁLIDO/ENÉRGICO + NÚMEROS CENTRADOS)
         ========================================================================= */}
      <section 
        id="premiacion" 
        className="relative py-20 px-4 sm:px-8 text-white overflow-hidden bg-cover bg-center"
        style={{ 
          backgroundImage: "radial-gradient(ellipse 75% 65% at 50% 45%, rgba(255, 190, 24, 0.42) 0%, rgba(235, 94, 15, 0.48) 42%, rgba(180, 48, 5, 0.72) 75%, rgba(25, 6, 2, 0.88) 100%), url('/backgrounds/bg_premiacion.jpg')" 
        }}
      >
        {/* Glow cálido y enérgico de naranja a amarillo en el centro */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 50% 42%, rgba(255, 215, 64, 0.24) 0%, rgba(255, 107, 0, 0.18) 45%, transparent 75%)',
          }}
        />

        <div className="max-w-[1366px] mx-auto relative z-10 text-center">
          <div className="mb-14">
            <h2 className="font-athletic text-5xl sm:text-7xl lg:text-8xl text-white drop-shadow-sm">
              PREMIACIÓN ECONÓMICA
            </h2>
            <p className="font-athletic-bold text-base sm:text-xl tracking-widest text-white/95 mt-2">
              POR DISTANCIA Y POR RAMA
            </p>
          </div>

          {/* 3 Real Cards con las opacidades exactas y números 5K, 7K, 10K perfectamente CENTRADOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto text-left">
            {prizes.map((p) => (
              <div
                key={p.distance}
                style={{ backgroundColor: p.cardBg }}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(0,0,0,0.5)] hover:ring-2 hover:ring-white/40 ${p.textColor}`}
              >
                <div>
                  {/* Encabezado con número 5K, 7K o 10K perfectamente centrado */}
                  <div className={`pb-3 border-b-2 ${p.borderBottom} text-center`}>
                    <span className="font-athletic text-6xl sm:text-7xl block text-center">
                      {p.distance}
                    </span>
                  </div>

                  <div className="my-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className={`border-b-2 ${p.borderBottom} font-athletic-bold text-xs sm:text-sm tracking-wider opacity-90`}>
                          <th className="py-2.5">PUESTO</th>
                          <th className="py-2.5 text-center">MUJERES</th>
                          <th className="py-2.5 text-right">HOMBRES</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${p.borderDivider} font-athletic-bold text-xs sm:text-sm`}>
                        {p.rows.map((r) => (
                          <tr key={r.place} className="transition-colors duration-200 hover:bg-white/10">
                            <td className="py-3">{r.place}</td>
                            <td className="py-3 text-center">{r.women}</td>
                            <td className="py-3 text-right">{r.men}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className={`pt-4 border-t-2 ${p.borderBottom} flex items-center justify-between font-athletic text-xl sm:text-2xl`}>
                  <span>TOTAL</span>
                  <span>{p.total} / RAMA</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-50 hover:text-[#cc420d] font-athletic-bold text-xs sm:text-sm tracking-wider px-10 py-4 rounded-full shadow-2xl shadow-black/40 hover:shadow-orange-400/30 transition-all duration-300 hover:scale-[1.08] active:scale-95 group cursor-pointer"
            >
              CORRE POR TU META. ¡INSCRÍBETE AHORA!
              <ArrowUpRight size={16} className="stroke-[3] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03: 2ª EDICIÓN (TAMAÑOS Y ESPACIADOS EXACTOS)
         ========================================================================= */}
      <section className="bg-white py-18 px-4 sm:px-8 text-center border-y border-neutral-100">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-center mb-3">
            <Image
              src="/logos/logo_integral.png"
              alt="Integral Fit"
              width={85}
              height={85}
              className="h-16 sm:h-20 w-auto object-contain transition-transform duration-300 hover:scale-110"
            />
          </div>
          <h2 className="font-athletic text-5xl sm:text-6xl text-[#cc420d]">
            2ª EDICIÓN
          </h2>
          <p className="text-base sm:text-xl font-bold text-neutral-800 leading-relaxed max-w-2xl mx-auto">
            Volvemos a la línea de salida con más energía, más propósito y una nueva oportunidad para proteger, inspirar y transformar.
          </p>
          <div className="pt-4">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#cc420d] hover:bg-[#b53708] text-white font-athletic-bold text-xs sm:text-sm tracking-wider px-10 py-4 rounded-full shadow-lg shadow-orange-900/20 hover:shadow-orange-600/40 transition-all duration-300 hover:scale-[1.08] active:scale-95 group cursor-pointer"
            >
              CORRE POR TU META. ¡INSCRÍBETE AHORA!
              <ArrowUpRight size={16} className="stroke-[3] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 04: PREVENTAS (FUENTES BOLD ITALIC + 69% TRANSPARENCIA)
         ========================================================================= */}
      <section 
        id="precios" 
        className="relative bg-cover bg-center text-white py-22 px-4 sm:px-8 overflow-hidden"
        style={{ backgroundImage: "url('/backgrounds/bg_preventas.jpg')" }}
      >
        <div className="max-w-[1366px] mx-auto relative z-10 text-center">
          <div className="mb-14">
            <h2 className="font-athletic-bold text-2xl sm:text-3xl text-[#ababb2] tracking-wider">
              PREVENTAS
            </h2>
            <p className="font-athletic text-6xl sm:text-8xl lg:text-9xl text-white mt-1">
              ¡ASEGURA TU CUPO AL MEJOR PRECIO!
            </p>
          </div>

          {/* 4 Columnas con Fondo Negro 69% Transparencia y microinteracción hover */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto text-left">
            
            {/* Categorías */}
            <div 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.69)' }}
              className="backdrop-blur-md rounded-2xl p-6 border border-white/15 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:border-white/35 hover:shadow-2xl hover:shadow-black/70"
            >
              <div>
                <h3 className="font-athletic-bold text-2xl text-white pb-3 border-b border-white/20">
                  CATEGORÍAS
                </h3>
                <div className="divide-y divide-white/15">
                  {categories.map((c) => (
                    <div key={c.name} className="py-4">
                      <strong className="font-athletic text-4xl text-white block leading-none">{c.name}</strong>
                      <span className="text-xs text-neutral-300 font-medium block mt-1">{c.sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Fases de preventa */}
            {presales.map((sale) => (
              <div
                key={sale.phase}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.69)' }}
                className="backdrop-blur-md rounded-2xl p-6 border border-white/15 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:border-white/35 hover:shadow-2xl hover:shadow-black/70"
              >
                <div>
                  <div className="pb-3 border-b border-white/20">
                    <h3 className="font-athletic-bold text-2xl text-white leading-none">
                      {sale.phase}
                    </h3>
                    <span className="text-xs text-[#cc420d] font-athletic-bold block mt-1">{sale.sub}</span>
                  </div>

                  <div className="divide-y divide-white/15">
                    {sale.prices.map((pr, idx) => (
                      <div key={`${sale.phase}-${idx}`} className="py-4">
                        <span className="font-athletic text-4xl sm:text-5xl text-white block leading-none">
                          {pr}
                        </span>
                        <span className="text-[11px] text-transparent select-none block mt-1">-</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/15 text-xs text-neutral-300 font-medium">
                  {sale.date}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <a
              href={REGISTRATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-50 hover:text-[#cc420d] font-athletic-bold text-xs sm:text-sm tracking-wider px-10 py-4 rounded-full shadow-2xl shadow-black/40 hover:shadow-white/30 transition-all duration-300 hover:scale-[1.08] active:scale-95 group cursor-pointer"
            >
              ASEGURA TU CUPO AHORA
              <ArrowUpRight size={16} className="stroke-[3] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 05: KIT DEL CORREDOR (ICONOS Y FUENTES GRANDES)
         ========================================================================= */}
      <section 
        id="kit" 
        className="relative bg-cover bg-center text-white overflow-hidden"
        style={{ backgroundImage: "url('/backgrounds/bg_kit.jpg')" }}
      >
        <div className="max-w-[1366px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[520px] items-stretch">
          <div className="lg:col-span-6" />

          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
            <div>
              <span className="font-athletic-bold text-sm sm:text-base tracking-widest text-[#cc420d] block">
                TODO LISTO PARA TU CARRERA
              </span>
              <h2 className="font-athletic text-5xl sm:text-6xl text-white leading-tight mt-1">
                CORRE Y LIBÉRATE INCLUYE <br />
                MUCHO MÁS QUE KILÓMETROS.
              </h2>
            </div>

            {/* 6 Iconos Más Grandes con Separadores Naranjas y hover interactivo */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-0 pt-2 pb-2">
              {kitItems.map((item, idx) => (
                <div
                  key={item.label}
                  className={`group/kit flex flex-col items-center text-center px-2 py-2 sm:py-0 transition-transform duration-300 hover:scale-110 ${
                    idx !== 0 ? 'sm:border-l-2 sm:border-[#cc420d]' : ''
                  }`}
                >
                  <div className="w-16 h-16 relative mb-2 flex items-center justify-center transition-transform duration-300 group-hover/kit:-translate-y-1">
                    <Image
                      src={item.icon}
                      alt={item.label}
                      fill
                      className="object-contain filter brightness-110 drop-shadow"
                    />
                  </div>
                  <span className="font-athletic-semibold text-xs sm:text-sm text-white/95 tracking-wide group-hover/kit:text-[#cc420d] transition-colors">{item.label}</span>
                </div>
              ))}
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 font-medium italic">
              Y experiencias adicionales de nuestros aliados durante el evento.
            </p>

            <div>
              <a
                href={REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-black hover:bg-neutral-50 hover:text-[#cc420d] font-athletic-bold text-xs sm:text-sm tracking-wider px-8 py-3.5 rounded-full shadow-xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:scale-[1.08] active:scale-95 group cursor-pointer"
              >
                INSCRÍBETE Y VIVE LA EXPERIENCIA
                <ArrowUpRight size={16} className="stroke-[3] transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 06: UBICACIÓN & HORARIOS (MAPA ENLACE COMPLETO A GOOGLE MAPS)
         ========================================================================= */}
      <section 
        id="como-llegar" 
        className="relative bg-cover bg-center py-20 px-4 sm:px-8"
        style={{ backgroundImage: "url('/backgrounds/bg_ubicacion.jpg')" }}
      >
        <div className="max-w-[1366px] mx-auto space-y-12">
          
          <div>
            <span className="font-athletic-bold text-xs sm:text-sm tracking-widest text-[#cc420d] block">
              CADA KILÓMETRO PROTEGE, INSPIRA Y TRANSFORMA
            </span>
            <h2 className="font-athletic text-5xl sm:text-7xl text-neutral-950 mt-1">
              TODO EMPIEZA EN EL CACIQUE.
            </h2>
            <p className="text-sm font-semibold text-neutral-600 mt-1 italic">
              Domingo 22 de noviembre de 2026 · Jamundí, Valle del Cauca
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Tarjeta Mapa - La imagen entera es un enlace a Google Maps */}
            <div className="lg:col-span-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 border border-neutral-200 shadow-md space-y-4">
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                title="Haz clic para ver la ubicación en Google Maps"
                className="group relative block aspect-[16/9] w-full rounded-2xl overflow-hidden border border-neutral-200 min-h-[220px] shadow-inner cursor-pointer"
              >
                <Image
                  src="/images/assets/img_xref_24.png"
                  alt="Mapa Estadio El Cacique - Clic para abrir en Google Maps"
                  fill
                  unoptimized
                  priority
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 text-neutral-950 text-xs font-athletic-bold px-4 py-2 rounded-full shadow-xl flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0">
                    VER EN GOOGLE MAPS
                    <ArrowUpRight size={14} className="stroke-[3]" />
                  </span>
                </div>
              </a>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <div>
                  <h3 className="font-athletic-bold text-2xl text-neutral-950">ESTADIO EL CACIQUE</h3>
                  <p className="text-xs text-neutral-600 font-medium">Km 2 Vía Chipaya, Alfaguara · Jamundí, Valle del Cauca</p>
                </div>
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#cc420d] hover:bg-[#ff5512] text-white font-athletic-bold text-xs px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.08] active:scale-95 shadow-md shadow-orange-600/30 hover:shadow-orange-500/50 shrink-0 group cursor-pointer"
                >
                  VER CÓMO LLEGAR
                  <ArrowUpRight size={14} className="stroke-[3] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* Tarjeta Horarios */}
            <div className="lg:col-span-6 bg-[#111111]/95 text-white backdrop-blur-md rounded-3xl p-8 border border-neutral-800 shadow-xl space-y-6">
              <div>
                <span className="font-athletic-bold text-xs tracking-wider text-[#cc420d] block">DOMINGO</span>
                <h3 className="font-athletic text-5xl text-white">22 NOV 2026</h3>
              </div>

              <div className="space-y-1">
                <span className="font-athletic-semibold text-xs tracking-wider text-neutral-400">APERTURA DEL EVENTO</span>
                <div className="font-athletic text-5xl text-white">5:00 A.M.</div>
                <p className="text-xs text-neutral-300">Llega con tiempo, ubica tu corral y disfruta de las experiencias y stands antes de la salida.</p>
              </div>

              <div className="pt-2 border-t border-neutral-800">
                <span className="font-athletic-semibold text-xs tracking-wider text-[#cc420d] block mb-3">HORARIOS DE SALIDA</span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {distances.map((d) => (
                    <div key={d.label} className="bg-neutral-900 rounded-xl p-2.5 border border-neutral-800 transition-transform duration-300 hover:scale-105 hover:border-neutral-700">
                      <strong className="font-athletic text-3xl text-white block">{d.label}</strong>
                      <span className="text-[11px] text-neutral-300 font-semibold">{d.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 07: PROPÓSITO SOCIAL
         ========================================================================= */}
      <section 
        className="relative bg-cover bg-center text-white overflow-hidden"
        style={{ backgroundImage: "url('/backgrounds/bg_proposito.jpg')" }}
      >
        <div className="max-w-[1366px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[460px] items-stretch">
          
          <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center space-y-6">
            <h2 className="font-athletic text-5xl sm:text-7xl text-white leading-[0.92]">
              CORREMOS POR ALGO <br />
              QUE VA MÁS ALLÁ <br />
              DE LA META.
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 font-medium leading-relaxed italic">
              Corre y Libérate conecta deporte, bienestar y propósito en una experiencia para moverte, superarte y generar un impacto positivo.
            </p>

            <div className="space-y-4 pt-2">
              <div className="transition-transform duration-300 hover:translate-x-1">
                <strong className="font-athletic-bold text-xs text-[#cc420d] block">01 — PROTEGE</strong>
                <p className="text-xs sm:text-sm text-neutral-200 mt-0.5">Cuida tu cuerpo, tu mente y tu bienestar.</p>
              </div>
              <div className="transition-transform duration-300 hover:translate-x-1">
                <strong className="font-athletic-bold text-xs text-[#cc420d] block">02 — INSPIRA</strong>
                <p className="text-xs sm:text-sm text-neutral-200 mt-0.5">Tu decisión de empezar puede motivar a alguien más.</p>
              </div>
              <div className="transition-transform duration-300 hover:translate-x-1">
                <strong className="font-athletic-bold text-xs text-[#cc420d] block">03 — TRANSFORMA</strong>
                <p className="text-xs sm:text-sm text-neutral-200 mt-0.5">Haz que cada paso genere algo positivo más allá de ti.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6" />

        </div>
      </section>

      {/* =========================================================================
          SECTION 08: FOOTER (LOGO GRANDE + BADGE SCIBARU AI)
         ========================================================================= */}
      <footer className="bg-black text-white py-16 px-4 sm:px-8 text-center border-t border-neutral-900">
        <div className="max-w-[1366px] mx-auto space-y-10">
          
          {/* Logo */}
          <div className="flex justify-center">
            <Image
              src="/logos/logo_white.png"
              alt="Corre y Libérate"
              width={320}
              height={100}
              className="h-20 sm:h-28 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="border-y border-neutral-800 py-6 max-w-4xl mx-auto">
            <nav className="flex flex-wrap justify-center gap-8 sm:gap-12">
              <a href="#distancias" className="font-athletic-bold text-base sm:text-lg tracking-wider text-neutral-300 hover:text-white transition-colors">Distancias</a>
              <a href="#precios" className="font-athletic-bold text-base sm:text-lg tracking-wider text-neutral-300 hover:text-white transition-colors">Precios</a>
              <a href="#premiacion" className="font-athletic-bold text-base sm:text-lg tracking-wider text-neutral-300 hover:text-white transition-colors">Premiación</a>
              <a href="#kit" className="font-athletic-bold text-base sm:text-lg tracking-wider text-neutral-300 hover:text-white transition-colors">Kit</a>
              <a href="#como-llegar" className="font-athletic-bold text-base sm:text-lg tracking-wider text-neutral-300 hover:text-white transition-colors">Como llegar</a>
            </nav>
          </div>

          <div className="flex justify-center items-center gap-6">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-[1.08] hover:bg-[#cc420d] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-orange-600/30 cursor-pointer"
            >
              <MessageCircle size={26} />
            </a>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-[1.08] hover:bg-[#cc420d] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-orange-600/30 cursor-pointer"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:scale-[1.08] hover:bg-[#cc420d] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-orange-600/30 cursor-pointer"
            >
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.688 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z"/>
              </svg>
            </a>
          </div>

          {/* Copyright y Badge Desarrollado por Scibaru AI */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
            <p className="text-xs text-neutral-400 font-medium">
              © 2026 Corre y Libérate · 2ª Edición Integral Fit · Jamundí, Valle del Cauca. Todos los derechos reservados.
            </p>
            <span className="hidden sm:inline text-neutral-700">|</span>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-300 shadow-md hover:border-[#cc420d]/60 hover:text-white transition-all duration-300 group">
              <Sparkles size={13} className="text-[#cc420d] group-hover:text-[#ff6b35] transition-colors group-hover:rotate-12 duration-300" />
              <span className="tracking-wide text-[11px] sm:text-xs">
                Desarrollado por <span className="font-bold text-white group-hover:text-[#ff6b35] transition-colors">Scibaru AI</span>
              </span>
            </div>
          </div>

        </div>
      </footer>

      {/* Botón flotante WhatsApp con animación de glow y scale-108 */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#20ba59] text-white p-4 rounded-full shadow-2xl shadow-green-950/40 hover:scale-[1.08] active:scale-95 transition-all duration-300 flex items-center justify-center hover:shadow-[0_0_25px_rgba(37,211,102,0.6)] cursor-pointer group"
      >
        <MessageCircle size={30} className="transition-transform duration-300 group-hover:scale-110" />
      </a>

    </div>
  );
}

