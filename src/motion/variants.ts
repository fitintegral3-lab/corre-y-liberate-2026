import { Variants, Transition } from "framer-motion";

export const athleticSpring: Transition = {
  type: "spring",
  stiffness: 280,
  damping: 22,
  mass: 0.8,
};

export const smoothSpring: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 24,
};

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: customDelay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const awardCardVariants: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 240,
      damping: 22,
    },
  },
};

export const runnerHeroVariants: Variants = {
  hidden: { opacity: 0, x: 50, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};
