'use client';

import React from 'react';
import Image from 'next/image';
import { EVENT_DATA } from '../../config/event-data';
import { Phone } from 'lucide-react';

export const FooterSection: React.FC = () => {
  const footerLinks = [
    { label: 'DISTANCIAS', href: '#distancias' },
    { label: 'PRECIOS', href: '#precios' },
    { label: 'PREMIACIÓN', href: '#premiacion' },
    { label: 'KIT', href: '#kit' },
    { label: 'COMO LLEGAR', href: '#como-llegar' },
  ];

  return (
    <footer className="bg-black text-white py-12 sm:py-16 px-4 sm:px-8 border-t border-white/10">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
        {/* White Official Logo */}
        <div className="relative w-44 sm:w-52 h-16 sm:h-20">
          <Image
            src="/logos/corre-y-liberate-white.png"
            alt="Corre y Libérate 2026"
            fill
            className="object-contain"
          />
        </div>

        {/* Divider Line */}
        <div className="w-full max-w-2xl h-[1px] bg-white/20 my-2" />

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-300 hover:text-[#FF4D00] transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Social Media Circular Buttons */}
        <div className="flex items-center gap-4 pt-2">
          {/* WhatsApp */}
          <a
            href={EVENT_DATA.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white hover:bg-[#FF4D00] hover:text-white text-black flex items-center justify-center transition-all duration-300 hover:scale-110 shadow"
            aria-label="WhatsApp"
          >
            <Phone size={18} />
          </a>

          {/* Instagram SVG */}
          <a
            href={EVENT_DATA.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white hover:bg-[#FF4D00] hover:text-white text-black flex items-center justify-center transition-all duration-300 hover:scale-110 shadow"
            aria-label="Instagram"
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* Facebook SVG */}
          <a
            href={EVENT_DATA.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-white hover:bg-[#FF4D00] hover:text-white text-black flex items-center justify-center transition-all duration-300 hover:scale-110 shadow"
            aria-label="Facebook"
          >
            <svg
              className="w-5 h-5 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
        </div>

        {/* Copyright Notice */}
        <p className="text-[11px] sm:text-xs text-neutral-500 pt-4">
          © {EVENT_DATA.year} {EVENT_DATA.name} — Organizado por Integral Fit. Jamundí, Colombia. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};
