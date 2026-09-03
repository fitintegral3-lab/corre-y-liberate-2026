'use client';

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  variant?: "orange" | "white" | "dark" | "gray";
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
}

export const MagneticPillButton: React.FC<MagneticButtonProps> = ({
  children,
  variant = "orange",
  className = "",
  onClick,
  href,
  target,
  rel,
}) => {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 200, damping: 15, mass: 0.1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const textX = useTransform(smoothX, (val) => val * 0.35);
  const textY = useTransform(smoothY, (val) => val * 0.35);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = (e.clientX - centerX) * 0.22;
    const distanceY = (e.clientY - centerY) * 0.22;
    mouseX.set(distanceX);
    mouseY.set(distanceY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const variantStyles = {
    orange:
      "bg-[#FF4D00] hover:bg-[#FF5A00] text-white shadow-lg shadow-orange-600/30 border border-orange-400/30",
    white:
      "bg-white hover:bg-neutral-100 text-black font-extrabold shadow-md shadow-black/20",
    dark: "bg-[#121214] hover:bg-[#1E1E24] text-white border border-white/20 shadow-md",
    gray: "bg-[#9E9E9E] hover:bg-[#A8A8A8] text-white font-bold shadow-md",
  };

  const Component = href ? motion.a : motion.button;

  return (
    <Component
      ref={ref as any}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        x: smoothX,
        y: smoothY,
      }}
      whileTap={{ scale: 0.96 }}
      className={`relative inline-flex items-center justify-center rounded-full px-8 py-3 uppercase tracking-wider text-sm md:text-base font-black overflow-hidden transition-colors cursor-pointer select-none ${variantStyles[variant]} ${className}`}
    >
      <motion.div
        aria-hidden="true"
        initial={{ x: "-150%" }}
        animate={isHovered ? { x: "180%" } : { x: "-150%" }}
        transition={{ duration: 0.75, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-25 pointer-events-none"
      />

      <motion.span
        style={{ x: textX, y: textY }}
        className="relative z-10 flex items-center gap-2"
      >
        {children}
      </motion.span>
    </Component>
  );
};
