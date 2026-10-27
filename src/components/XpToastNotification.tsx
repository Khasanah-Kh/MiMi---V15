import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Sparkles, Zap, Award, X, Trophy } from 'lucide-react';

export interface XpToastData {
  id: string;
  label: string;
  xpAmount: number;
}

interface XpToastNotificationProps {
  notification: XpToastData | null;
  onDismiss: () => void;
}

// Particle offsets for explosive festive feel
const PARTICLES = [
  { id: 1, x: -28, y: -24, delay: 0, scale: 1.2, color: '#F59E0B' },
  { id: 2, x: 30, y: -28, delay: 0.05, scale: 0.9, color: '#38BDF8' },
  { id: 3, x: -40, y: 15, delay: 0.1, scale: 1.1, color: '#10B981' },
  { id: 4, x: 42, y: 18, delay: 0.08, scale: 1.0, color: '#EC4899' },
  { id: 5, x: 0, y: -35, delay: 0.12, scale: 1.3, color: '#FBBF24' },
  { id: 6, x: -18, y: 32, delay: 0.15, scale: 0.8, color: '#818CF8' },
];

const toastContainerVariants: Variants = {
  initial: {
    opacity: 0,
    y: -72,
    scale: 0.86,
    rotate: -1.5,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 26,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    y: -64,
    x: 56,
    scale: 0.88,
    rotate: 1.5,
    filter: 'blur(4px)',
    transition: {
      duration: 0.36,
      ease: [0.32, 0, 0.67, 0],
    },
  },
};

const ToastItemCard: React.FC<{
  notification: XpToastData;
  onDismiss: () => void;
}> = ({ notification, onDismiss }) => {
  const [displayXp, setDisplayXp] = useState(0);

  useEffect(() => {
    // Trigger phone vibration if supported for rewarding haptic feedback
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 60]);
      } catch {
        // Ignore haptic errors if disabled by browser policy
      }
    }

    // Animated count-up for XP display
    const target = notification.xpAmount || 15;
    let start = 0;
    const duration = 500;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayXp(target);
        clearInterval(timer);
      } else {
        setDisplayXp(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [notification]);

  return (
    <motion.div
      layout
      variants={toastContainerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      drag="x"
      dragConstraints={{ left: 0, right: 120 }}
      dragElastic={0.25}
      onDragEnd={(_e, info) => {
        if (info.offset.x > 60 || info.velocity.x > 300) {
          onDismiss();
        }
      }}
      className="pointer-events-auto relative w-full rounded-2xl p-[2px] bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 shadow-[0_10px_35px_rgba(56,189,248,0.35)] overflow-hidden cursor-grab active:cursor-grabbing"
    >
      {/* Background Inner Toast Card */}
      <div className="relative w-full bg-[#0F172A] rounded-[14px] p-3.5 sm:p-4 flex items-center justify-between gap-3 overflow-hidden backdrop-blur-xl">
        {/* Shimmer overlay animation */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: 'easeInOut',
            repeatDelay: 1,
          }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
        />

        {/* Floating Star/Sparkle Particles */}
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, p.scale, 0],
              x: p.x,
              y: p.y,
            }}
            transition={{
              duration: 1.4,
              delay: p.delay,
              ease: 'easeOut',
            }}
            className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none z-10"
          >
            <Sparkles className="w-4 h-4" style={{ color: p.color }} />
          </motion.div>
        ))}

        {/* Icon Badge Container */}
        <div className="relative shrink-0 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              rotate: [0, -10, 10, 0],
            }}
            transition={{
              duration: 0.8,
              ease: 'easeInOut',
            }}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-lg flex items-center justify-center text-slate-950 font-black"
          >
            <div className="w-full h-full rounded-[14px] bg-[#0B101E] flex items-center justify-center relative overflow-hidden">
              <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
            </div>
          </motion.div>

          {/* Floating "+XP" Bubble */}
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.5 }}
            animate={{ opacity: 1, y: -16, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.6 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 500 }}
            className="absolute -top-1 -right-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5 tabular-nums"
          >
            <Zap className="w-2.5 h-2.5 fill-slate-950" />
            <span>+{displayXp} XP</span>
          </motion.div>
        </div>

        {/* Toast Text & Description */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 flex items-center gap-1">
              <Award className="w-3 h-3" /> Rewards Bestie
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              +XP Terbuka
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-white truncate leading-snug">
            {notification.label}
          </p>
        </div>

        {/* XP Badge & Close Button */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1 shadow-md shadow-amber-500/20 tabular-nums"
          >
            <span>⚡</span>
            <span>+{displayXp} XP</span>
          </motion.div>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Dismiss toast"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Progress Line Countdown (4 seconds) */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 4, ease: 'linear' }}
          className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 origin-left"
        />
      </div>
    </motion.div>
  );
};

export const XpToastNotification: React.FC<XpToastNotificationProps> = ({
  notification,
  onDismiss,
}) => {
  return (
    <div
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] pointer-events-none w-full max-w-md px-4 flex flex-col items-center"
    >
      <AnimatePresence mode="wait">
        {notification && (
          <ToastItemCard
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
