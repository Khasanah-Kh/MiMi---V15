import React, { useState, useMemo } from 'react';
import {
  Trophy,
  RefreshCw,
  Search,
  ArrowUpRight,
  Crown,
  Medal,
  Swords,
} from 'lucide-react';
import {
  BottomNavTab,
  EducationLevel,
  LeaderboardEntry,
  MimiUiState,
} from '../../types/mimi';
import { CYBER_RANKS } from '../../data/curriculumData';

interface PeringkatScreenProps {
  uiState: MimiUiState;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  lastUpdated: string;
  onRefresh: () => void;
  onNavigateTab: (tab: BottomNavTab) => void;
}

export const PeringkatScreen: React.FC<PeringkatScreenProps> = ({
  uiState,
  leaderboard,
  isLoading,
  lastUpdated,
  onRefresh,
  onNavigateTab,
}) => {
  const [levelFilter, setLevelFilter] = useState<'ALL' | EducationLevel>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Ensure current user's live XP and rank are always reflected instantaneously
  const mergedLeaderboard = useMemo(() => {
    const list = leaderboard.map((entry) => {
      if (entry.isCurrentUser) {
        return {
          ...entry,
          displayName: uiState.studentName,
          educationLevel: uiState.selectedEducationLevel,
          selectedClass: uiState.selectedClass,
          xp: uiState.xp,
          level: uiState.level,
          cyberRank: uiState.cyberRank,
          streakDays: uiState.streakDays,
          rivalWins: uiState.rivalWins,
        };
      }
      return entry;
    });

    const sorted = [...list].sort((a, b) => b.xp - a.xp);
    return sorted.map((item, idx) => ({
      ...item,
      rankPosition: idx + 1,
    }));
  }, [
    leaderboard,
    uiState.studentName,
    uiState.selectedEducationLevel,
    uiState.selectedClass,
    uiState.xp,
    uiState.level,
    uiState.cyberRank,
    uiState.streakDays,
    uiState.rivalWins,
  ]);

  const currentUserEntry = useMemo(
    () => mergedLeaderboard.find((e) => e.isCurrentUser),
    [mergedLeaderboard]
  );

  const nextRivalAbove = useMemo(() => {
    if (!currentUserEntry || currentUserEntry.rankPosition <= 1) return null;
    return mergedLeaderboard.find(
      (e) => e.rankPosition === currentUserEntry.rankPosition - 1
    );
  }, [mergedLeaderboard, currentUserEntry]);

  const filteredList = useMemo(() => {
    return mergedLeaderboard.filter((entry) => {
      const matchesLevel =
        levelFilter === 'ALL' || entry.educationLevel === levelFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        entry.displayName.toLowerCase().includes(q) ||
        entry.cyberRank.toLowerCase().includes(q) ||
        entry.selectedClass.toLowerCase().includes(q);
      return matchesLevel && matchesSearch;
    });
  }, [mergedLeaderboard, levelFilter, searchQuery]);

  const topThree = useMemo(() => filteredList.slice(0, 3), [filteredList]);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header & Your Global Standing Summary */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800/90 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="text-xs text-sky-400 font-medium flex items-center gap-1.5">
              <span>Klasemen Nasional Mimi 15</span>
              <span aria-hidden="true">·</span>
              <span>Diperbarui {lastUpdated}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Papan Peringkat Global & Pangkat Siber
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Bandingkan perolehan XP, level, dan pangkat siber dengan seluruh siswa SD, SMP, dan SMA di platform Mimi 15
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-2 self-start sm:self-auto whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan Peringkat</span>
          </button>
        </div>

        {/* Logged-in User Standing Highlight Bar */}
        {currentUserEntry && (
          <div className="p-5 rounded-xl bg-[#0B1120] border border-sky-500/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-400 text-slate-950 font-mono font-extrabold text-lg flex items-center justify-center tabular-nums shrink-0">
                #{currentUserEntry.rankPosition}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
                  <span>Posisi Global Kamu Saat Ini</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {currentUserEntry.educationLevel} ({currentUserEntry.selectedClass})
                  </span>
                </div>
                <div className="text-lg font-extrabold text-white">
                  {currentUserEntry.displayName} — {currentUserEntry.cyberRank}
                </div>
                <div className="text-xs text-slate-400 font-mono tabular-nums">
                  {nextRivalAbove
                    ? `Butuh +${Math.max(1, nextRivalAbove.xp - currentUserEntry.xp + 5)} XP lagi untuk menyalip ${nextRivalAbove.displayName} di peringkat #${nextRivalAbove.rankPosition}`
                    : 'Selamat! Kamu berada di puncak Peringkat #1 Global Mimi 15!'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800 shrink-0">
              <div className="text-left lg:text-right font-mono tabular-nums">
                <div className="text-xs text-slate-400">Perolehan Skor</div>
                <div className="text-lg font-extrabold text-sky-400">
                  {currentUserEntry.xp} XP · Lv.{currentUserEntry.level}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab(BottomNavTab.TANTANGAN)}
                className="px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Swords className="w-4 h-4 shrink-0" />
                <span>Kejar XP di Arena</span>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 2. Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topThree.map((student, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const rankColor = isFirst
              ? 'text-amber-400 border-amber-500/40'
              : isSecond
              ? 'text-slate-200 border-slate-600'
              : 'text-amber-600 border-amber-700/40';

            return (
              <div
                key={student.uid}
                className={`p-6 rounded-2xl bg-[#0F172A] border ${
                  student.isCurrentUser ? 'border-sky-400' : 'border-slate-800/90'
                } flex flex-col justify-between gap-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`px-3 py-1 rounded-lg bg-[#0B1120] border font-mono text-xs font-extrabold tabular-nums flex items-center gap-1.5 ${rankColor}`}
                    >
                      {isFirst ? (
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Medal className="w-3.5 h-3.5" />
                      )}
                      <span>Peringkat #{student.rankPosition}</span>
                    </div>

                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {student.educationLevel} · {student.selectedClass}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <span className="truncate">{student.displayName}</span>
                      {student.isCurrentUser && (
                        <span className="text-xs font-semibold text-sky-400 shrink-0">
                          (Anda)
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-sky-400 font-medium mt-0.5">
                      {student.cyberRank}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono tabular-nums">
                  <div>
                    <div className="text-slate-400">Total XP</div>
                    <div className="text-base font-extrabold text-white mt-0.5">
                      {student.xp} XP
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-400">Level & Laga</div>
                    <div className="text-slate-200 font-semibold mt-0.5">
                      Lv.{student.level} · {student.rivalWins} Menang
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* 3. Filter & Full Comparison Table */}
      <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800/90 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Jenjang Filter */}
          <div className="flex items-center gap-1 p-1 bg-[#0B1120] border border-slate-800 rounded-xl w-fit">
            {[
              { id: 'ALL', label: 'Semua Jenjang' },
              { id: EducationLevel.SD, label: 'SD' },
              { id: EducationLevel.SMP, label: 'SMP' },
              { id: EducationLevel.SMA, label: 'SMA' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setLevelFilter(tab.id as 'ALL' | EducationLevel)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  levelFilter === tab.id
                    ? 'bg-sky-400 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, pangkat, kelas..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#0B1120] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {/* Responsive Leaderboard Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0B1120] text-[11px] font-semibold text-slate-400">
                <th className="py-3 px-4">Peringkat</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Jenjang & Kelas</th>
                <th className="py-3 px-4">Pangkat Siber</th>
                <th className="py-3 px-4 text-right">Modul & Arena</th>
                <th className="py-3 px-4 text-right">Level & Total XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs sm:text-sm">
              {filteredList.map((row) => (
                <tr
                  key={row.uid}
                  className={`transition-colors ${
                    row.isCurrentUser
                      ? 'bg-sky-500/10'
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <td className="py-3.5 px-4 font-mono font-bold tabular-nums">
                    <span
                      className={
                        row.rankPosition === 1
                          ? 'text-amber-400'
                          : row.rankPosition === 2
                          ? 'text-slate-200'
                          : row.rankPosition === 3
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }
                    >
                      #{row.rankPosition}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{row.displayName}</span>
                      {row.isCurrentUser && (
                        <span className="text-[11px] font-semibold text-sky-400">
                          · Anda
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      Streak {row.streakDays} hari aktif
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                    {row.educationLevel} · {row.selectedClass}
                  </td>

                  <td className="py-3.5 px-4 text-xs font-semibold text-sky-400 whitespace-nowrap">
                    {row.cyberRank}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-xs text-slate-300 tabular-nums whitespace-nowrap">
                    {row.completedModules} Modul · {row.rivalWins} Menang
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                    <span className="text-slate-400 text-xs mr-2">Lv.{row.level}</span>
                    <span className="font-extrabold text-emerald-400">
                      {row.xp} XP
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Cyber Rank Tier Thresholds Guide */}
      <section className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800/90 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              Tingkatan Pangkat Siber Mimi 15
            </h2>
            <p className="text-xs text-slate-400">
              Kumpulkan XP dari modul simulasi, kuis AI, dan duel arena untuk naik ke pangkat tertinggi
            </p>
          </div>
          <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {CYBER_RANKS.map((tier, index) => {
            const isReached = uiState.xp >= tier.minXp;
            return (
              <div
                key={tier.title}
                className={`p-4 rounded-xl border ${
                  isReached
                    ? 'bg-[#0B1120] border-sky-500/40'
                    : 'bg-[#0B1120]/50 border-slate-800/70 opacity-75'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                  Tier 0{index + 1} · Minimal {tier.minXp} XP
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-1">
                  {tier.title}
                </div>
                <div className="text-[11px] mt-1.5 font-medium">
                  {isReached ? (
                    <span className="text-emerald-400">Sudah Tercapai</span>
                  ) : (
                    <span className="text-slate-500">
                      Kurang {tier.minXp - uiState.xp} XP
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
