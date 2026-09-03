'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EVENT_DATA } from "../../config/event-data";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = new Date(EVENT_DATA.dateIso).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 select-none py-2">
      <TimeUnit value={timeLeft.days} label="DÍAS" />
      <TimeSeparator />
      <TimeUnit value={timeLeft.hours} label="HORAS" />
      <TimeSeparator />
      <TimeUnit value={timeLeft.minutes} label="MIN" />
      <TimeSeparator />
      <TimeUnit value={timeLeft.seconds} label="SEG" isSeconds />
    </div>
  );
};

const TimeUnit: React.FC<{ value: number; label: string; isSeconds?: boolean }> = ({
  value,
  label,
  isSeconds = false,
}) => {
  const formattedValue = String(value).padStart(2, "0");

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-11 sm:h-14 w-12 sm:w-16 bg-black/60 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center overflow-hidden shadow-inner">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formattedValue}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`font-mono text-xl sm:text-2xl font-black tabular-nums tracking-tighter ${
              isSeconds ? "text-[#FF4D00]" : "text-white"
            }`}
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[9px] sm:text-[10px] font-bold tracking-wider text-neutral-300">
        {label}
      </span>
    </div>
  );
};

const TimeSeparator: React.FC = () => (
  <div className="flex flex-col gap-1 pb-4 text-[#FF4D00] text-lg font-bold">
    <span>:</span>
  </div>
);
