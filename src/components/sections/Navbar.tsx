'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { EVENT_DATA } from '../../config/event-data';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky navbar only when user has scrolled past the top hero header
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'DISTANCIAS', href: '#distancias' },
    { label: 'PRECIOS', href: '#precios' },
    { label: 'PREMIACIÓN', href: '#premiacion' },
    { label: 'KIT', href: '#kit' },
    { label: 'COMO LLEGAR', href: '#como-llegar' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'translate-y-0 opacity-100 bg-white/95 backdrop-blur-md shadow-md py-3'
          : '-translate-y-full opacity-0 pointer-events-none py-3'
      }`}
    >
      <div className="max-w-[1366px] mx-auto px-4 sm:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="#inicio" className="flex items-center gap-2">
          <Image
            src="/logos/corre-y-liberate.png"
            alt="Corre y Libérate 2026"
            width={140}
            height={44}
            className="h-10 w-auto object-contain"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] lg:text-[14px] font-black tracking-wider text-black hover:text-[#FF4D00] transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* CTA Button */}
          <a
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF4D00] hover:bg-[#FF5A00] text-white text-[13px] lg:text-[14px] font-black uppercase px-7 py-2.5 rounded-full transition-transform hover:scale-105 shadow-md shadow-orange-500/20"
          >
            INSCRÍBETE
          </a>
        </nav>

        {/* Mobile Hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <a
            href={EVENT_DATA.registrationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF4D00] text-white text-xs font-black uppercase px-4 py-2 rounded-full shadow-sm"
          >
            INSCRÍBETE
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-black hover:text-[#FF4D00] focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-neutral-100 shadow-xl px-6 py-5 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-black tracking-wider text-neutral-900 py-1.5 border-b border-neutral-100"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
