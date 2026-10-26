import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { MimiUiState } from '../../types/mimi';
import { soundService } from '../../services/soundService';

interface KuisScreenProps {
  uiState: MimiUiState;
  onAnswerSelected: (optionIndex: number) => void;
  onNextQuestion: () => void;
  onRestartQuiz: () => void;
  onGenerateAiQuiz: (customTopic?: string) => Promise<void>;
}

export const KuisScreen: React.FC<KuisScreenProps> = ({
  uiState,
  onAnswerSelected,
  onNextQuestion,
  onRestartQuiz,
  onGenerateAiQuiz,
}) => {
  const [customTopic, setCustomTopic] = useState('');

  const questions = uiState.quizQuestions;
  const currentQ = questions[uiState.currentQuizIndex] || questions[0];

  const handleGenerateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerateAiQuiz(customTopic.trim() || undefined);
    setCustomTopic('');
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header & Gemini AI Quiz Generator Bar */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800/90 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="text-xs text-sky-400 font-medium">
              Evaluasi Adaptif · {uiState.selectedEducationLevel} ({uiState.selectedClass})
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Kuis Interaktif & Generator Soal AI Mimi
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Jawab soal kurikulum dengan tepat atau minta AI Mimi membuat paket soal baru sesuai topik pilihanmu
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-300 tabular-nums shrink-0">
            <div>Skor Sesi Ini: <span className="text-sky-400 font-bold">{uiState.quizScore} Benar</span></div>
            <div className="text-slate-400">Total {questions.length} Soal</div>
          </div>
        </div>

        {/* AI Topic Generator Form */}
        <form onSubmit={handleGenerateTopic} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            disabled={uiState.isGeneratingAiQuiz}
            placeholder={`Ketik topik kuis baru untuk ${uiState.selectedEducationLevel} ${uiState.selectedClass} (misal: Pecahan, Hukum Ohm, Turunan)...`}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#0B1120] border border-slate-800 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={uiState.isGeneratingAiQuiz}
            className="px-4 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${uiState.isGeneratingAiQuiz ? 'animate-spin' : ''}`} />
            <span>
              {uiState.isGeneratingAiQuiz
                ? 'Menyusun Soal AI...'
                : 'Buat Soal Baru dengan AI'}
            </span>
          </button>
        </form>
      </section>

      {/* Active Quiz Card or Completion Summary */}
      {uiState.isQuizFinished ? (
        <section className="p-8 rounded-2xl bg-[#0F172A] border border-slate-800/90 text-center space-y-5">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-sky-400">Evaluasi Selesai</div>
            <h2 className="text-2xl font-extrabold text-white">
              Skor Kamu: {uiState.quizScore} dari {questions.length} Soal Benar
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-mono tabular-nums">
              Akurasi Sesi: {Math.round((uiState.quizScore / Math.max(1, questions.length)) * 100)}%
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onRestartQuiz}
              className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Kuis Ini</span>
            </button>
            <button
              type="button"
              disabled={uiState.isGeneratingAiQuiz}
              onClick={() => onGenerateAiQuiz()}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${uiState.isGeneratingAiQuiz ? 'animate-spin' : ''}`} />
              <span>Paket Soal AI Berikutnya</span>
            </button>
          </div>
        </section>
      ) : currentQ ? (
        <section className="p-6 sm:p-8 rounded-2xl bg-[#0F172A] border border-slate-800/90 space-y-6">
          {/* Question Metadata */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-sky-400 font-semibold tabular-nums">
                Soal {uiState.currentQuizIndex + 1} / {questions.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentQ.subject}</span>
              <span aria-hidden="true">·</span>
              <span>{currentQ.classLabel}</span>
            </div>
            <span className="font-mono text-emerald-400 font-semibold tabular-nums">
              +{currentQ.xpReward} XP
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const hasAnswered = uiState.selectedQuizAnswer !== null;
              const isPicked = uiState.selectedQuizAnswer === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let styleClass =
                'bg-[#0B1120] border-slate-800 text-slate-200 hover:border-slate-700';
              if (hasAnswered) {
                if (isCorrect) {
                  styleClass = 'bg-emerald-950/60 border-emerald-500/70 text-emerald-100';
                } else if (isPicked) {
                  styleClass = 'bg-red-950/60 border-red-500/70 text-red-100';
                }
              }

              return (
                <button
                  key={`quiz-opt-${idx}`}
                  type="button"
                  disabled={hasAnswered}
                  onClick={() => {
                    if (isCorrect) {
                      soundService.playCorrectSound();
                    } else {
                      soundService.playWrongSound();
                    }
                    onAnswerSelected(idx);
                  }}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition-colors flex items-center justify-between gap-3 ${styleClass}`}
                >
                  <span>
                    <strong className="font-mono mr-2.5 text-sky-400">
                      {String.fromCharCode(65 + idx)}.
                    </strong>
                    {opt}
                  </span>
                  {hasAnswered && isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  {hasAnswered && isPicked && !isCorrect && (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation & Next Button */}
          {uiState.selectedQuizAnswer !== null && (
            <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800 space-y-3">
              <div className="text-xs font-semibold text-sky-400">
                Pembahasan Tutor Mimi:
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {currentQ.explanation}
              </p>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onNextQuestion}
                  className="px-5 py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>
                    {uiState.currentQuizIndex + 1 < questions.length
                      ? 'Soal Berikutnya'
                      : 'Lihat Hasil Kuis'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
};
