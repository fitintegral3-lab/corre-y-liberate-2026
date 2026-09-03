'use client';

import React, { useState, useEffect } from 'react';
import { EVENT_DATA } from '../../config/event-data';
import { MessageCircle } from 'lucide-react';

export const FloatingCTA: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 300px
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Bottom Sticky Conversion Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F0C20]/90 backdrop-blur-lg border-t border-white/15 px-4 py-3 flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] font-black uppercase text-orange-400 block tracking-wider">
            Preventas Activas
          </span>
          <span className="text-xs font-bold text-white block">
            Desde $90.000 COP
          </span>
        </div>

        <a
          href={EVENT_DATA.registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FF4D00] hover:bg-[#FF5A00] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-full shadow-lg shadow-orange-600/30 animate-pulse"
        >
          ¡INSCRIBIRME AHORA!
        </a>
      </div>

      {/* Floating WhatsApp Support Button (Desktop and Mobile) */}
      <a
        href={EVENT_DATA.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-16 md:bottom-8 right-5 z-40 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={30} className="filter drop-shadow" />
      </a>
    </>
  );
};
