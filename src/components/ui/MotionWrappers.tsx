import { motion, AnimatePresence, Variants } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import React from 'react';

// Fade + Slide Up on Mount
type FadeSlideUpProps =
  | ({ as: 'section'; duration?: number; className?: string; children: React.ReactNode } & HTMLMotionProps<'section'>)
  | ({ as: 'main'; duration?: number; className?: string; children: React.ReactNode } & HTMLMotionProps<'main'>)
  | ({ as: 'article'; duration?: number; className?: string; children: React.ReactNode } & HTMLMotionProps<'article'>)
  | ({ as?: 'div'; duration?: number; className?: string; children: React.ReactNode } & HTMLMotionProps<'div'>);

export const FadeSlideUp = ({
  children,
  duration = 0.4,
  className = '',
  as = 'div',
  ...rest
}: FadeSlideUpProps) => {
  switch (as) {
    case 'section':
      return (
        <motion.section
          className={className}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, ease: 'easeOut' }}
          {...(rest as HTMLMotionProps<'section'>)}
        >
          {children}
        </motion.section>
      );
    case 'main':
      return (
        <motion.main
          className={className}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, ease: 'easeOut' }}
          {...(rest as HTMLMotionProps<'main'>)}
        >
          {children}
        </motion.main>
      );
    case 'article':
      return (
        <motion.article
          className={className}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, ease: 'easeOut' }}
          {...(rest as HTMLMotionProps<'article'>)}
        >
          {children}
        </motion.article>
      );
    default:
      return (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, ease: 'easeOut' }}
          {...(rest as HTMLMotionProps<'div'>)}
        >
          {children}
        </motion.div>
      );
  }
};

// Button Scale on Hover/Tap
export const MotionButton: React.FC<HTMLMotionProps<'button'>> = ({ children, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.15 }}
    {...props}
  >
    {children}
  </motion.button>
);

// Staggered Container/Card Animation
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 }
  }
};

export const fadeSlideCard: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

// Fade + Scale Page Transition
type PageTransitionProps =
  | ({ as: 'section'; className?: string; children: React.ReactNode } & HTMLMotionProps<'section'>)
  | ({ as: 'main'; className?: string; children: React.ReactNode } & HTMLMotionProps<'main'>)
  | ({ as: 'article'; className?: string; children: React.ReactNode } & HTMLMotionProps<'article'>)
  | ({ as?: 'div'; className?: string; children: React.ReactNode } & HTMLMotionProps<'div'>);

export const PageTransition = ({ children, className = '', as = 'div', ...rest }: PageTransitionProps) => {
  switch (as) {
    case 'section':
      return (
        <AnimatePresence>
          <motion.section
            className={className}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            {...(rest as HTMLMotionProps<'section'>)}
          >
            {children}
          </motion.section>
        </AnimatePresence>
      );
    case 'main':
      return (
        <AnimatePresence>
          <motion.main
            className={className}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            {...(rest as HTMLMotionProps<'main'>)}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      );
    case 'article':
      return (
        <AnimatePresence>
          <motion.article
            className={className}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            {...(rest as HTMLMotionProps<'article'>)}
          >
            {children}
          </motion.article>
        </AnimatePresence>
      );
    default:
      return (
        <AnimatePresence>
          <motion.div
            className={className}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            {...(rest as HTMLMotionProps<'div'>)}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      );
  }
};
