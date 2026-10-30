import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Sparkles, X, PartyPopper } from 'lucide-react';
import { getLevelBadge, getBadgeColor, LevelBadge } from './DevBadge';

export interface LevelUpCelebrationData {
  id: string;
  previousLevel: number;
  newLevel: number;
  xp: number;
  cyberRank: string;
  badgeLevel: LevelBadge;
  reason?: string;
}

/**
 * Plays a short festive Web Audio fanfare when leveling up
 */
function playLevelUpFanfare() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.16, ctx.currentTime + idx * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.09);
      osc.stop(ctx.currentTime + idx * 0.09 + 0.36);
    });
  } catch {
    // Ignore audio context restrictions if not interacted
  }
}

/**
 * Triggers a rich multi-burst celebratory confetti animation across the screen
 */
export function fireLevelUpConfetti() {
  playLevelUpFanfare();

  try {
    const colors = ['#38bdf8', '#fbbf24', '#a855f7', '#34d399', '#f43f5e', '#fde047'];

    // Center burst
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.55 },
      colors,
      zIndex: 10000,
    });

    // Left & Right side cannons
    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
        zIndex: 10000,
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
        zIndex: 10000,
      });
    }, 220);

    // Golden star shower
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 100,
        startVelocity: 35,
        decay: 0.92,
        scalar: 1.1,
        origin: { x: 0.5, y: 0.35 },
        colors: ['#fbbf24', '#fde047', '#38bdf8', '#c084fc'],
        zIndex: 10000,
      });
    }, 500);
  } catch {
    // Fallback if canvas is unavailable
  }
}

interface LevelUpConfettiCelebrationProps {
  celebration: LevelUpCelebrationData | null;
  onDismiss: () => void;
}

export const LevelUpConfettiCelebration: React.FC<LevelUpConfettiCelebrationProps> = ({
  celebration,
  onDismiss,
}) => {
  useEffect(() => {
    if (!celebration) return;
    fireLevelUpConfetti();
    const timer = setTimeout(() => {
      onDismiss();
    }, 5500);
    return () => clearTimeout(timer);
  }, [celebration, onDismiss]);

  const nextLevelXp = celebration ? celebration.newLevel * 150 : 150;

  return (
    <AnimatePresence>
      {celebration && (
        <motion.div
          key={celebration.id}
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 360, damping: 24 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9998] w-[92vw] max-w-md pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] border-2 border-amber-400/80 shadow-[0_0_35px_rgba(251,191,36,0.35)] p-4 sm:p-5 text-white">
            {/* Ambient glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-400/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 animate-bounce">
                  <Trophy className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Level Up Tercapai!</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-black text-white mt-1 flex items-center gap-2 flex-wrap">
                    <span>Naik ke Level {celebration.newLevel}!</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getBadgeColor(
                        celebration.badgeLevel
                      )}`}
                    >
                      {celebration.badgeLevel}
                    </span>
                  </h3>

                  <p className="text-xs text-slate-300 mt-0.5">
                    {celebration.reason || `Selamat! Kamu menembus ambang ${celebration.xp} XP`} · Gelar:{' '}
                    <span className="font-bold text-sky-300">{celebration.cyberRank}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onDismiss}
                className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
                title="Tutup perayaan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* XP Progress Bar to Next Level */}
            <div className="mt-3.5 pt-3 border-t border-slate-800/90 flex items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-1">
                  <span className="font-bold text-amber-300">Total: {celebration.xp} XP</span>
                  <span className="text-slate-400">Target Lv.{celebration.newLevel + 1}: {nextLevelXp} XP</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{
                      width: `${Math.min(100, Math.max(12, ((celebration.xp % 150) / 150) * 100))}%`,
                    }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 rounded-full"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => fireLevelUpConfetti()}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 shrink-0 transition-transform active:scale-95 shadow-md shadow-amber-400/20"
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Confetti!</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
