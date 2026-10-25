import React, { useState } from 'react';
import {
  ShieldCheck,
  BookOpen,
  Target,
  MessageSquare,
  Swords,
  Compass,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { BadgeItem } from '../../types/mimi';

interface LencanaScreenProps {
  badges: BadgeItem[];
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ShieldCheck,
  BookOpen,
  Target,
  MessageSquare,
  Swords,
  Compass,
};

export const LencanaScreen: React.FC<LencanaScreenProps> = ({ badges }) => {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'LOCKED'>('ALL');

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const filteredBadges = badges.filter((b) => {
    if (filter === 'UNLOCKED') return b.isUnlocked;
    if (filter === 'LOCKED') return !b.isUnlocked;
    return true;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-sky-400 font-medium">
            Koleksi Penghargaan Siswa Mimi 15
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Galeri Lencana & Pencapaian Siber
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Selesaikan modul, kuis, diskusi Tutor Mimi, dan tantangan arena untuk membuka seluruh lencana
          </p>
        </div>

        <div className="px-5 py-3.5 rounded-xl bg-[#0B1120] border border-slate-800 text-right shrink-0">
          <div className="text-xs text-slate-400">Total Lencana Terbuka</div>
          <div className="text-xl font-extrabold font-mono text-sky-400 tabular-nums mt-0.5">
            {unlockedCount} / {badges.length}
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <div className="flex items-center gap-1 p-1 bg-[#0F172A] border border-slate-800 rounded-xl w-fit">
        {[
          { id: 'ALL', label: `Semua (${badges.length})` },
          { id: 'UNLOCKED', label: `Terbuka (${unlockedCount})` },
          { id: 'LOCKED', label: `Terkunci (${badges.length - unlockedCount})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as 'ALL' | 'UNLOCKED' | 'LOCKED')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              filter === tab.id
                ? 'bg-sky-400 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const IconComponent = ICON_MAP[badge.iconName] || ShieldCheck;
          const pct = Math.min(100, Math.round((badge.progress / Math.max(1, badge.maxProgress)) * 100));

          return (
            <div
              key={badge.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between gap-5 transition-colors ${
                badge.isUnlocked
                  ? 'bg-[#0F172A] border-slate-800/90'
                  : 'bg-[#0F172A]/60 border-slate-800/50 opacity-80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      badge.isUnlocked
                        ? 'bg-sky-400/15 text-sky-400 border border-sky-400/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <span className="text-xs font-mono text-emerald-400 font-semibold tabular-nums">
                    +{badge.xpBonus} XP
                  </span>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span>{badge.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{badge.isUnlocked ? 'Terbuka' : 'Belum Terbuka'}</span>
                </div>

                <h2 className="text-base font-bold text-white">{badge.title}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    {badge.isUnlocked ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Tercapai</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Progres Syarat</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono text-slate-300 tabular-nums">
                    {badge.progress} / {badge.maxProgress}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-200 ${
                      badge.isUnlocked ? 'bg-emerald-400' : 'bg-sky-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
