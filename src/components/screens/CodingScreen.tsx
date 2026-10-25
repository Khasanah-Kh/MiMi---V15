import React, { useState } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  BookOpen,
  ExternalLink,
  Download,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import { CodingLessonItem, MimiUiState } from '../../types/mimi';
import {
  CODING_LESSONS,
  CODING_RESOURCE_BOOKS,
} from '../../data/curriculumData';
import { downloadGeneratedModulePdf } from '../../services/googleDriveService';

interface CodingScreenProps {
  uiState: MimiUiState;
  onAskMimiTopic: (promptText: string) => void;
  onAwardCodingXp: (label: string, xpAmount: number) => void;
}

export const CodingScreen: React.FC<CodingScreenProps> = ({
  uiState,
  onAskMimiTopic,
  onAwardCodingXp,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<CodingLessonItem>(
    CODING_LESSONS[0]
  );
  const [editorCode, setEditorCode] = useState<string>(
    CODING_LESSONS[0].starterCode
  );
  const [consoleOutput, setConsoleOutput] = useState<string>(
    CODING_LESSONS[0].sampleOutput
  );
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const handleSelectLesson = (lesson: CodingLessonItem) => {
    setSelectedLesson(lesson);
    setEditorCode(lesson.starterCode);
    setConsoleOutput(lesson.sampleOutput);
  };

  const handleRunCode = () => {
    try {
      if (selectedLesson.language === 'JavaScript') {
        const logs: string[] = [];
        const customConsole = {
          log: (...args: any[]) =>
            logs.push(
              args
                .map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a)))
                .join(' ')
            ),
        };
        const runner = new Function('console', editorCode);
        runner(customConsole);
        setConsoleOutput(
          logs.length > 0
            ? logs.join('\n')
            : 'Kode berhasil dijalankan (tidak ada output console.log).'
        );
      } else if (selectedLesson.language === 'Python') {
        // Parse Python list numbers if modified by student
        const listMatch = editorCode.match(/\[([\d,\s.]+)\]/);
        if (listMatch && listMatch[1]) {
          const nums = listMatch[1]
            .split(',')
            .map((s) => Number(s.trim()))
            .filter((n) => !Number.isNaN(n));
          if (nums.length > 0) {
            const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
            const high = nums.filter((n) => n >= 85);
            setConsoleOutput(
              `Rata-rata Kelas: ${avg.toFixed(1)}\nNilai >= 85: [${high.join(', ')}]`
            );
          } else {
            setConsoleOutput(selectedLesson.sampleOutput);
          }
        } else {
          setConsoleOutput(selectedLesson.sampleOutput);
        }
      } else if (selectedLesson.language === 'HTML & CSS') {
        const h2Match = editorCode.match(/<h2>(.*?)<\/h2>/i);
        const pMatch = editorCode.match(/<p>(.*?)<\/p>/i);
        const heading = h2Match?.[1] || 'Room Belajar Mimi V15';
        const desc = pMatch?.[1] || 'Komponen HTML5 berhasil dirender.';
        setConsoleOutput(
          `[Pratinjau Web Aktif]\nJudul Kartu (<h2>): ${heading}\nDeskripsi (<p>): ${desc}`
        );
      } else {
        const titleMatch = editorCode.match(/judul:\s*["']([^"']+)["']/);
        const jenjangMatch = editorCode.match(/jenjang:\s*["']([^"']+)["']/);
        const halMatch = editorCode.match(/halaman:\s*(\d+)/);
        const j = titleMatch?.[1] || 'Dasar-Dasar PPLG Kelas X';
        const lvl = jenjangMatch?.[1] || 'SMK';
        const h = halMatch?.[1] || '248';
        setConsoleOutput(`Buku "${j}" (${lvl}) siap diunduh (${h} hlm).`);
      }

      if (!completedLessonIds.includes(selectedLesson.id)) {
        setCompletedLessonIds((prev) => [...prev, selectedLesson.id]);
        onAwardCodingXp(
          `Praktik Coding "${selectedLesson.title}" berhasil dijalankan!`,
          selectedLesson.xpReward
        );
      }
    } catch (err) {
      setConsoleOutput(
        `Periksa kembali sintaks kodemu: ${
          err instanceof Error ? err.message : 'Kesalahan sintaks'
        }`
      );
    }
  };

  return (
    <div className="space-y-9 pb-12">
      {/* 1. Header Kolom Belajar Coding */}
      <section className="p-7 sm:p-9 card-study space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <Code2 className="w-4 h-4 shrink-0" />
              <span>Studio Belajar Coding & Pemrograman · SD, SMP, SMA & SMK</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Kolom Belajar Coding & Referensi Buku Pemrograman
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
              Praktikkan langsung logika pemrograman JavaScript, Python, HTML/CSS, dan TypeScript. Dilengkapi rujukan buku resmi Informatika & PPLG Kemendikdasmen serta buku pemrograman internasional yang sudah terbit.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              downloadGeneratedModulePdf({
                title: selectedLesson.title,
                level: uiState.selectedEducationLevel,
                classRange: selectedLesson.levelTag,
                subject: `Pemrograman ${selectedLesson.language}`,
                bookTitle: selectedLesson.bookReference.title,
                publisher: selectedLesson.bookReference.author,
                catalogUrl: selectedLesson.bookReference.url,
                summaryPoints: [
                  selectedLesson.summary,
                  selectedLesson.expectedExplanation,
                  `Tantangan Praktik: ${selectedLesson.challengePrompt}`,
                ],
                formula: selectedLesson.sampleOutput,
              })
            }
            className="px-5 py-3 rounded-2xl btn-tactile-emerald font-extrabold text-xs flex items-center gap-2 whitespace-nowrap shrink-0 self-start md:self-auto"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Unduh Modul Coding (PDF)</span>
          </button>
        </div>

        {/* Lesson Selector Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {CODING_LESSONS.map((lesson) => {
            const active = selectedLesson.id === lesson.id;
            const done = completedLessonIds.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => handleSelectLesson(lesson)}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-3 ${
                  active
                    ? 'bg-sky-500/15 border-sky-400 text-white'
                    : 'bg-[#0B101E] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-sky-400">
                    {lesson.language}
                  </span>
                  {done ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Tuntas</span>
                    </span>
                  ) : (
                    <span className="font-mono text-emerald-400 font-bold">
                      +{lesson.xpReward} XP
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-extrabold text-white line-clamp-2">
                    {lesson.title}
                  </div>
                  <div className="text-[11px] text-slate-400">{lesson.levelTag}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Interactive Coding Playground (Editor + Output + Book Reference) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Code Editor (7 cols) */}
        <div className="lg:col-span-7 card-study p-6 sm:p-7 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs text-sky-400 font-bold">
                Editor Interaktif · {selectedLesson.language}
              </div>
              <h2 className="text-lg font-extrabold text-white mt-0.5">
                {selectedLesson.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditorCode(selectedLesson.starterCode);
                  setConsoleOutput(selectedLesson.sampleOutput);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Kode</span>
              </button>

              <button
                type="button"
                onClick={handleRunCode}
                className="px-4 py-2 rounded-xl btn-tactile-sky text-xs font-extrabold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Jalankan Kode</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {selectedLesson.summary}
          </p>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 block">
              Kode Program (Bisa kamu ubah dan uji langsung):
            </label>
            <textarea
              rows={9}
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              spellCheck={false}
              className="w-full p-4 font-mono text-xs sm:text-sm bg-[#0B101E] border-2 border-slate-800 rounded-2xl text-sky-200 focus:outline-none focus:border-sky-400 leading-relaxed"
            />
          </div>

          <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-xs text-sky-200 leading-relaxed">
            <span className="font-extrabold text-sky-400">Tantangan Eksplorasi: </span>
            {selectedLesson.challengePrompt}
          </div>
        </div>

        {/* Right: Console Output, Explanation & Book Citation (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          <div className="card-study p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                Hasil Eksekusi / Konsol
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Status: Siap
              </span>
            </div>

            <pre className="p-4 rounded-xl bg-[#0B101E] border border-slate-800 font-mono text-xs sm:text-sm text-emerald-300 whitespace-pre-wrap leading-relaxed min-h-[110px]">
              {consoleOutput}
            </pre>

            <div className="pt-2 space-y-2">
              <div className="text-xs font-bold text-white">Penjelasan Logika:</div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedLesson.expectedExplanation}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                onAskMimiTopic(
                  `Mimi, bantu jelaskan baris demi baris kode ${selectedLesson.language} pada materi "${selectedLesson.title}" ini dong:\n\n${editorCode}`
                )
              }
              className="w-full py-3 px-4 rounded-xl btn-tactile-slate text-xs font-bold flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Tanya Mimi tentang Kode Ini</span>
            </button>
          </div>

          {/* Book Source Card for Current Coding Lesson */}
          <div className="card-study p-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Sumber Buku & Referensi Materi Ini</span>
            </div>
            <div className="text-sm font-extrabold text-white leading-snug">
              {selectedLesson.bookReference.title}
            </div>
            <div className="text-xs text-slate-400">
              Penulis / Penerbit: {selectedLesson.bookReference.author}
            </div>
            <a
              href={selectedLesson.bookReference.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 pt-1"
            >
              <span>Buka Sumber Buku / Dokumentasi Resmi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. Katalog Lengkap Sumber Buku Coding & Informatika Nyata (Published) */}
      <section className="card-study p-7 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-white">
              Daftar Buku & Sumber Belajar Coding Terverifikasi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Seluruh sumber di bawah ini berasal dari buku teks resmi yang sudah terbit (Kemendikdasmen RI, No Starch Press, Mozilla MDN, & Harvard CS50)
            </p>
          </div>
          <a
            href="https://buku.kemendikdasmen.go.id/daftar-katalog"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl btn-tactile-sky text-xs font-extrabold flex items-center gap-2 self-start sm:self-auto whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Katalog Buku Kemendikdasmen</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CODING_RESOURCE_BOOKS.map((book) => (
            <div
              key={book.id}
              className="p-5 rounded-2xl bg-[#0B101E] border-2 border-slate-800/90 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold text-sky-400">
                  {book.category}
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                  {book.title}
                </h3>
                <div className="text-xs text-slate-400">
                  {book.author} · <span className="text-slate-300">{book.publisher}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {book.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <a
                  href={book.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
                >
                  <span>Baca / Buka Katalog</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() =>
                    downloadGeneratedModulePdf({
                      title: book.title,
                      level: uiState.selectedEducationLevel,
                      classRange: book.category,
                      subject: 'Referensi Pemrograman & Informatika',
                      bookTitle: book.title,
                      publisher: `${book.author} (${book.publisher})`,
                      catalogUrl: book.url,
                      summaryPoints: [
                        book.description,
                        `Sumber Katalog Resmi: ${book.url}`,
                      ],
                    })
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ringkasan PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
