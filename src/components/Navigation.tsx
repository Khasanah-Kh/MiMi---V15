import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Heart,
  Code2,
  Swords,
  Trophy,
  HelpCircle,
  UserCheck,
  MessageSquare,
  BookOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { BottomNavTab, MimiUiState } from '../types/mimi';

const NAV_ITEMS: Array<{
  tab: BottomNavTab;
  label: string;
  shortLabel: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    tab: BottomNavTab.BERANDA,
    label: 'Beranda & Modul',
    shortLabel: 'Beranda',
    icon: Home,
  },
  {
    tab: BottomNavTab.CURHAT,
    label: 'Cerita & Curhat',
    shortLabel: 'Curhat',
    icon: Heart,
  },
  {
    tab: BottomNavTab.CODING,
    label: 'Belajar Coding',
    shortLabel: 'Coding',
    icon: Code2,
  },
  {
    tab: BottomNavTab.TANTANGAN,
    label: 'Tantangan Duel',
    shortLabel: 'Duel',
    icon: Swords,
  },
  {
    tab: BottomNavTab.PERINGKAT,
    label: 'Peringkat Global',
    shortLabel: 'Rank',
    icon: Trophy,
  },
  {
    tab: BottomNavTab.KUIS,
    label: 'Kuis Adaptif',
    shortLabel: 'Kuis',
    icon: HelpCircle,
  },
  {
    tab: BottomNavTab.PROFIL,
    label: 'Profil & Akun',
    shortLabel: 'Profil',
    icon: UserCheck,
  },
];

interface CyberNavigationRailProps {
  currentTab: BottomNavTab;
  onTabSelected: (tab: BottomNavTab) => void;
  uiState: MimiUiState;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onOpenShareHub: () => void;
}

export const CyberNavigationRail: React.FC<CyberNavigationRailProps> = ({
  currentTab,
  onTabSelected,
  uiState,
  isChatOpen,
  onToggleChat,
  onOpenShareHub,
}) => {
  const xpProgress = Math.min(100, Math.round(((uiState.xp % 150) / 150) * 100));

  return (
    <aside className="w-72 shrink-0 h-full bg-[#131C31] border-r-2 border-slate-800/90 flex flex-col justify-between p-6 select-none overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Identity */}
        <div className="pb-4 border-b border-slate-800/80 space-y-1.5">
          <div className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
            Room Belajar Mimi V15
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>{uiState.selectedEducationLevel}</span>
            <span aria-hidden="true">·</span>
            <span>{uiState.selectedClass}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-sky-400 font-bold tabular-nums">
              Lv.{uiState.level}
            </span>
          </div>
        </div>

        {/* Student Progress Summary Box */}
        <div className="p-4 rounded-2xl bg-[#0B101E] border-2 border-slate-800/90 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-100 truncate max-w-[130px]">
              {uiState.studentName}
            </span>
            <span className="font-mono text-emerald-400 font-extrabold tabular-nums">
              {uiState.xp} XP
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400 rounded-full"
              initial={false}
              animate={{ width: `${xpProgress}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-sky-300">{uiState.cyberRank}</span>
            <span className="font-mono tabular-nums">{uiState.streakDays} hari aktif</span>
          </div>
        </div>

        {/* Navigation Links with Framer Motion Sliding Highlight */}
        <nav className="space-y-1.5 relative" aria-label="Menu Utama">
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
            const isActive = currentTab === tab;
            return (
              <motion.button
                key={tab}
                type="button"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onTabSelected(tab)}
                className={`relative w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 overflow-hidden ${
                  isActive
                    ? 'text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border-2 border-transparent'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="railActiveTabPill"
                    className="absolute inset-0 btn-tactile-sky rounded-2xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{label}</span>
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action Controls */}
      <div className="space-y-2.5 pt-5 border-t border-slate-800/80">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onToggleChat}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap shrink-0 ${
            isChatOpen ? 'btn-tactile-slate' : 'btn-tactile-emerald'
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>{isChatOpen ? 'Tutup Chat Mimi' : 'Ngobrol dengan Mimi'}</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onOpenShareHub}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold btn-tactile-slate whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Buku PDF, Drive & Classroom</span>
        </motion.button>
      </div>
    </aside>
  );
};

interface WebTopBarProps {
  uiState: MimiUiState;
  onSelectTab: (tab: BottomNavTab) => void;
  isChatOpen: boolean;
  isChatDocked: boolean;
  onToggleChat: () => void;
  onToggleDock: () => void;
  onOpenShareHub: () => void;
}

export const WebTopBar: React.FC<WebTopBarProps> = ({
  uiState,
  onSelectTab,
  isChatOpen,
  isChatDocked,
  onToggleChat,
  onToggleDock,
  onOpenShareHub,
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-4 lg:gap-6 px-5 lg:px-8 py-3.5 bg-[#131C31] border-b-2 border-slate-800/90 shrink-0">
      {/* Zone 1: Brand Title */}
      <button
        type="button"
        onClick={() => onSelectTab(BottomNavTab.BERANDA)}
        className="text-base lg:text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 text-left flex items-center gap-2"
      >
        <span>Mimi V15</span>
        <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-700/50">
          ● Aktif 24 Jam
        </span>
      </button>

      {/* Zone 2: Single-Line Navigation Links with Framer Motion Underline */}
      <nav className="hidden xl:flex items-center gap-5 text-xs lg:text-sm font-semibold text-slate-400">
        {NAV_ITEMS.slice(0, 6).map(({ tab, label }) => {
          const active = uiState.currentTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              className={`relative transition-colors whitespace-nowrap shrink-0 pb-1.5 ${
                active ? 'text-white font-bold' : 'hover:text-white'
              }`}
            >
              <span>{label}</span>
              {active && (
                <motion.div
                  layoutId="topBarUnderline"
                  className="absolute left-0 right-0 bottom-0 h-0.5 bg-sky-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-2.5 shrink-0">
        {isChatOpen && (
          <button
            type="button"
            onClick={onToggleDock}
            title={isChatDocked ? 'Ubah ke Jendela Mengambang' : 'Sematkan di Panel Kanan'}
            className="px-3 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800/90 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            {isChatDocked ? (
              <>
                <PanelRightClose className="w-3.5 h-3.5" />
                <span>Lepas Panel</span>
              </>
            ) : (
              <>
                <PanelRightOpen className="w-3.5 h-3.5" />
                <span>Sematkan Panel</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onOpenShareHub}
          className="px-3.5 py-2 text-xs font-bold rounded-xl btn-tactile-slate flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-sky-400" />
          <span>Buku PDF & Classroom</span>
        </button>

        <button
          type="button"
          onClick={onToggleChat}
          className="px-4 py-2 text-xs font-extrabold rounded-xl btn-tactile-sky whitespace-nowrap shrink-0"
        >
          {isChatOpen ? 'Tutup Mimi' : 'Ngobrol dengan Mimi'}
        </button>
      </div>
    </header>
  );
};

interface CyberBottomBarProps {
  currentTab: BottomNavTab;
  onTabSelected: (tab: BottomNavTab) => void;
}

export const CyberBottomBar: React.FC<CyberBottomBarProps> = ({
  currentTab,
  onTabSelected,
}) => {
  return (
    <nav
      aria-label="Navigasi Bawah Smartphone"
      className="w-full bg-[#131C31]/95 backdrop-blur-md border-t-2 border-slate-800 px-1.5 pt-1.5 pb-safe grid grid-cols-7 gap-0.5 shrink-0 z-30 select-none"
    >
      {NAV_ITEMS.map(({ tab, shortLabel, icon: Icon }) => {
        const isActive = currentTab === tab;
        return (
          <motion.button
            key={tab}
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabSelected(tab)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-colors whitespace-nowrap shrink-0 overflow-hidden ${
              isActive
                ? 'text-sky-400 font-extrabold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="bottomNavActivePill"
                className="absolute inset-0 bg-sky-500/15 border border-sky-400/30 rounded-xl"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
            <motion.div
              animate={{ y: isActive ? -1 : 0, scale: isActive ? 1.06 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="relative z-10 flex flex-col items-center"
            >
              <Icon className="w-4 h-4 mb-1 shrink-0" />
              <span className="text-[10px] sm:text-[11px] leading-none tracking-tight">
                {shortLabel}
              </span>
            </motion.div>
          </motion.button>
        );
      })}
    </nav>
  );
};

interface MimiFloatingDockWidgetProps {
  isOpen: boolean;
  isWideScreen: boolean;
  onClick: () => void;
}

export const MimiFloatingDockWidget: React.FC<MimiFloatingDockWidgetProps> = ({
  isOpen,
  isWideScreen,
  onClick,
}) => {
  if (isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
      className={`fixed z-30 ${
        isWideScreen ? 'bottom-6 right-6' : 'bottom-[72px] right-3.5'
      }`}
    >
      <motion.button
        type="button"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={`flex items-center gap-2 rounded-2xl btn-tactile-emerald font-extrabold text-xs shadow-2xl whitespace-nowrap shrink-0 ${
          isWideScreen ? 'px-5 py-3.5' : 'px-4 py-2.5'
        }`}
      >
        <MessageSquare className="w-4 h-4 shrink-0" />
        <span>{isWideScreen ? 'Ngobrol bareng Mimi (+15 XP)' : 'Chat Mimi'}</span>
      </motion.button>
    </motion.div>
  );
};
