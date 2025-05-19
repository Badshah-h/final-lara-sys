/**
 * Animation variants for Framer Motion
 * 
 * This file contains reusable animation variants for use with Framer Motion
 * throughout the application.
 */

// Container animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

// Item animation variants
export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

// Fade in animation
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// Slide up animation
export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

// Slide in from left animation
export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 },
};

// Slide in from right animation
export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 },
};

// Scale animation
export const scale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.3 },
};

// Hover animation for cards
export const cardHover = {
  scale: 1.03,
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
  transition: { duration: 0.2 },
};

// Tap animation for buttons
export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 },
};

// Pulse animation
export const pulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 1, repeat: Infinity },
};

// Bounce animation
export const bounce = {
  y: [0, -10, 0],
  transition: { duration: 0.6, repeat: Infinity },
};

// Rotate animation
export const rotate = {
  rotate: [0, 360],
  transition: { duration: 2, repeat: Infinity, ease: "linear" },
};

// Shake animation
export const shake = {
  x: [0, -5, 5, -5, 5, 0],
  transition: { duration: 0.4 },
};

// Stagger children animation
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

// Page transition animation
export const pageTransition = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.5 },
};
