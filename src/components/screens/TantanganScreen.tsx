import React, { useState } from 'react';
import { Swords, Trophy, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { MimiUiState, RivalProfile } from '../../types/mimi';
import { INITIAL_QUIZ_QUESTIONS } from '../../data/curriculumData';

interface TantanganScreenProps {
  uiState: MimiUiState;
  onChallengeRival: (rival: RivalProfile, won: boolean, xpEarned: number) => void;
  onOpenLeaderboard?: () => void;
}

export const TantanganScreen: React.FC<TantanganScreenProps> = ({
  uiState,
  onChallengeRival,
  onOpenLeaderboard,
}) => {
  const [activeRival, setActiveRival] = useState<RivalProfile | null>(null);
  const [duelIndex, setDuelIndex] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [duelCompleted, setDuelCompleted] = useState(false);

  const duelQuestions = INITIAL_QUIZ_QUESTIONS.slice(0, 3);

  const startDuel = (rival: RivalProfile) => {
    setActiveRival(rival);
    setDuelIndex(0);
    setPlayerScore(0);
    setRivalScore(0);
    setDuelCompleted(false);
  };

  const handleDuelAnswer = (optionIdx: number) => {
    if (!activeRival || duelCompleted) return;
    const currentQ = duelQuestions[duelIndex];
    const isCorrect = optionIdx === currentQ.correctIndex;
    const nextPlayerScore = isCorrect ? playerScore + 100 : playerScore + 20;
    // Rival scores based on difficulty
    const rivalGain = activeRival.difficulty === 'Tinggi' ? 85 : activeRival.difficulty === 'Menengah' ? 70 : 55;
    const nextRivalScore = rivalScore + rivalGain;

    setPlayerScore(nextPlayerScore);
    setRivalScore(nextRivalScore);

    if (duelIndex + 1 < duelQuestions.length) {
      setDuelIndex(duelIndex + 1);
    } else {
      setDuelCompleted(true);
      const won = nextPlayerScore >= nextRivalScore;
      const earnedXp = won ? activeRival.xpStake : Math.round(activeRival.xpStake * 0.35);
      onChallengeRival(activeRival, won, earnedXp);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Overview */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-sky-400 font-medium">
            Arena Kompetisi Akademik Mimi 15
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Tantangan Duel Rival Siber
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Uji ketepatan konsep melawan rival terbaik dari jenjang SD, SMP, dan SMA untuk meraih XP ekstra
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-4 px-4 py-2.5 rounded-xl bg-[#0B1120] border border-slate-800">
            <div>
              <div className="text-[11px] text-slate-400">Rekor Kemenangan</div>
              <div className="text-base font-extrabold font-mono text-emerald-400 tabular-nums">
                {uiState.rivalWins} Menang / {uiState.rivalMatches} Laga
              </div>
            </div>
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
          </div>

          {onOpenLeaderboard && (
            <button
              type="button"
              onClick={onOpenLeaderboard}
              className="px-4 py-3 rounded-xl bg-sky-400/15 hover:bg-sky-400/25 border border-sky-400/30 text-sky-300 font-bold text-xs transition-colors whitespace-nowrap shrink-0"
            >
              Papan Peringkat Global
            </button>
          )}
        </div>
      </section>

      {/* Active Duel Stage */}
      {activeRival ? (
        <section className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-sky-500/40 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs text-sky-400 font-semibold">
                Duel Berlangsung · Taruhan +{activeRival.xpStake} XP
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                {uiState.studentName} vs {activeRival.name} ({activeRival.school})
              </h2>
            </div>

            <div className="flex items-center gap-4 font-mono text-sm tabular-nums">
              <span className="text-sky-400 font-bold">
                Skor Kamu: {playerScore}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-bold">
                Skor {activeRival.name.split(' ')[0]}: {rivalScore}
              </span>
            </div>
          </div>

          {!duelCompleted ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Ronde {duelIndex + 1} dari {duelQuestions.length} · {duelQuestions[duelIndex].subject}
                </span>
                <span className="font-mono tabular-nums">
                  Jenjang {duelQuestions[duelIndex].educationLevel}
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {duelQuestions[duelIndex].question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {duelQuestions[duelIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDuelAnswer(idx)}
                    className="p-4 rounded-xl bg-[#0B1120] hover:bg-slate-800 border border-slate-800 hover:border-sky-400/60 text-left text-xs sm:text-sm font-medium text-slate-100 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#0B1120] border border-slate-800 text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-white">
                  {playerScore >= rivalScore
                    ? `Kemenangan Gemilang Melawan ${activeRival.name}!`
                    : `Pertandingan Sengit Melawan ${activeRival.name}!`}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-mono tabular-nums">
                  Skor Akhir: {playerScore} vs {rivalScore} · Kamu memperoleh +
                  {playerScore >= rivalScore
                    ? activeRival.xpStake
                    : Math.round(activeRival.xpStake * 0.35)}{' '}
                  XP
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startDuel(activeRival)}
                  className="px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tanding Ulang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRival(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs whitespace-nowrap shrink-0"
                >
                  Kembali ke Daftar Rival
                </button>
              </div>
            </div>
          )}
        </section>
      ) : (
        /* Rival Cards Grid */
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {uiState.rivals.map((rival) => (
            <div
              key={rival.id}
              className="p-6 rounded-2xl bg-[#0F172A] border border-slate-800/90 flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {rival.educationLevel} · {rival.difficulty}
                  </span>
                  <span className="font-mono text-sky-400 font-semibold tabular-nums">
                    +{rival.xpStake} XP
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white">{rival.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {rival.title} · {rival.school}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Spesialisasi: {rival.specialty}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 tabular-nums">
                  <span>Rating: {rival.xp} XP</span>
                  <span>Rasio Menang: {rival.winRate}%</span>
                </div>

                <button
                  type="button"
                  onClick={() => startDuel(rival)}
                  className="w-full py-2.5 px-4 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Swords className="w-4 h-4 shrink-0" />
                  <span>Tantang Duel Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
