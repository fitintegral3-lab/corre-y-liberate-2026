'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AWARDS, EVENT_DATA } from '../../config/event-data';
import { MagneticPillButton } from '../ui/MagneticPillButton';
import { awardCardVariants } from '../../motion/variants';

export const PremiacionSection: React.FC = () => {
  return (
    <section id="premiacion" className="relative py-16 lg:py-24 bg-[#FF4D00] overflow-hidden">
      {/* Background Texture with Vertical Bars */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply bg-cover"
        style={{ backgroundImage: "url('/images/assets/img_xref_29.png')" }}
      />

      {/* Right Palm Silhouette Shadow */}
      <div className="absolute top-0 right-0 h-full w-1/3 opacity-15 pointer-events-none bg-gradient-to-l from-black to-transparent" />

      <div className="max-w-[1366px] mx-auto px-4 sm:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter text-white drop-shadow">
            PREMIACIÓN ECONÓMICA
          </h2>
          <p className="text-sm sm:text-lg font-bold italic uppercase tracking-widest text-white/90 mt-2">
            POR DISTANCIA Y POR RAMA
          </p>
        </div>

        {/* The 3 Award Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {AWARDS.map((card) => (
            <motion.div
              key={card.distance}
              variants={awardCardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{
                y: -6,
                scale: 1.02,
                boxShadow: `0 25px 50px -12px ${card.glowColor}`,
                transition: { type: "spring", stiffness: 300, damping: 20 },
              }}
              className={`rounded-[28px] p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative transition-shadow duration-300 ${card.bgColor} ${card.textColor}`}
            >
              {card.badge && (
                <div className="absolute -top-3 right-6 bg-[#FF4D00] text-white text-[11px] font-black tracking-wider px-3.5 py-1 rounded-full uppercase shadow">
                  {card.badge}
                </div>
              )}

              {/* Distance Header */}
              <div className="text-center pb-4 border-b border-current/20">
                <span className="text-5xl sm:text-6xl font-black italic tracking-tight block">
                  {card.label}
                </span>
              </div>

              {/* Table Body */}
              <div className="my-6">
                <div className="grid grid-cols-3 text-xs sm:text-sm font-bold opacity-80 pb-2 border-b border-current/20 uppercase tracking-wider mb-2">
                  <span>PUESTO</span>
                  <span className="text-center">MUJERES</span>
                  <span className="text-right">HOMBRES</span>
                </div>

                {card.positions.map((row) => (
                  <div
                    key={row.place}
                    className="grid grid-cols-3 text-xs sm:text-sm lg:text-base py-2.5 border-b border-current/15 font-semibold"
                  >
                    <span>{row.place}</span>
                    <span className="text-center">{row.womenAmount}</span>
                    <span className="text-right">{row.menAmount}</span>
                  </div>
                ))}
              </div>

              {/* Total Row */}
              <div className="pt-3 border-t-2 border-current/30 grid grid-cols-3 font-black text-sm sm:text-base uppercase">
                <span>TOTAL</span>
                <span className="text-center">{card.totalPerGender}</span>
                <span className="text-right">{card.totalPerGender}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section CTA Button */}
        <div className="text-center mt-12 lg:mt-16">
          <MagneticPillButton
            variant="white"
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 sm:px-12 py-3.5 text-sm sm:text-base"
          >
            CORRE POR TU META. ¡INSCRÍBETE AHORA!
          </MagneticPillButton>
        </div>
      </div>
    </section>
  );
};
