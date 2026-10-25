import React from 'react';
import {
  Home,
  Swords,
  Trophy,
  HelpCircle,
  Award,
  UserCheck,
  MessageSquare,
  Share2,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { BottomNavTab, MimiUiState } from '../types/mimi';

const NAV_ITEMS: Array<{
  tab: BottomNavTab;
  label: string;
  icon: React.FC<{ className?: string }>;
}> = [
  { tab: BottomNavTab.BERANDA, label: 'Beranda', icon: Home },
  { tab: BottomNavTab.TANTANGAN, label: 'Tantangan', icon: Swords },
  { tab: BottomNavTab.PERINGKAT, label: 'Peringkat', icon: Trophy },
  { tab: BottomNavTab.KUIS, label: 'Kuis', icon: HelpCircle },
  { tab: BottomNavTab.LENCANA, label: 'Lencana', icon: Award },
  { tab: BottomNavTab.PROFIL, label: 'Profil', icon: UserCheck },
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
    <aside className="w-64 shrink-0 h-full bg-[#0F172A] border-r border-slate-800/90 flex flex-col justify-between p-5 select-none">
      <div className="space-y-6">
        {/* Brand Identity */}
        <div className="pb-4 border-b border-slate-800/80">
          <div className="text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
            Mimi 15
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            <span>{uiState.selectedEducationLevel}</span>
            <span aria-hidden="true">·</span>
            <span>{uiState.selectedClass}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-sky-400 tabular-nums">Lv.{uiState.level}</span>
          </div>
        </div>

        {/* Student Progress Summary Box */}
        <div className="p-4 rounded-xl bg-[#0B1120] border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 truncate max-w-[120px]">
              {uiState.studentName}
            </span>
            <span className="font-mono text-sky-400 font-semibold tabular-nums">
              {uiState.xp} XP
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 transition-all duration-200"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{uiState.cyberRank}</span>
            <span className="font-mono tabular-nums">{uiState.streakDays} hari aktif</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="Menu Utama">
          {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
            const isActive = currentTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => onTabSelected(tab)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Action Controls */}
      <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
        <button
          type="button"
          onClick={onToggleChat}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
            isChatOpen
              ? 'bg-slate-800 text-sky-300 border border-sky-500/40'
              : 'bg-sky-400/15 text-sky-300 hover:bg-sky-400/25 border border-sky-400/30'
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span>{isChatOpen ? 'Tutup Tutor Mimi' : 'Buka Tutor Mimi'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenShareHub}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          <span>Unduh & Bagikan Progres</span>
        </button>
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
  // Strictly adheres to the 3-Zone Top Bar Contract
  return (
    <header className="w-full flex items-center justify-between gap-8 px-6 py-3.5 bg-[#0F172A] border-b border-slate-800/90 shrink-0">
      {/* Zone 1: Brand Title */}
      <button
        type="button"
        onClick={() => onSelectTab(BottomNavTab.BERANDA)}
        className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 text-left"
      >
        Mimi 15
      </button>

      {/* Zone 2: 5 Single-Line Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        {NAV_ITEMS.slice(0, 5).map(({ tab, label }) => {
          const active = uiState.currentTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => onSelectTab(tab)}
              className={`transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
                active
                  ? 'text-white border-b-2 border-sky-400 font-semibold'
                  : 'hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary Action */}
      <div className="flex items-center gap-3 shrink-0">
        {isChatOpen && (
          <button
            type="button"
            onClick={onToggleDock}
            title={isChatDocked ? 'Ubah ke Jendela Mengambang' : 'Sematkan di Panel Kanan'}
            className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
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
          className="px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          Laporan Belajar
        </button>

        <button
          type="button"
          onClick={onToggleChat}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          {isChatOpen ? 'Tutup Tutor Mimi' : 'Tanya Tutor Mimi'}
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
      aria-label="Navigasi Bawah"
      className="w-full bg-[#0F172A] border-t border-slate-800 px-2 py-1.5 grid grid-cols-6 gap-1 shrink-0 z-30"
    >
      {NAV_ITEMS.map(({ tab, label, icon: Icon }) => {
        const isActive = currentTab === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabSelected(tab)}
            className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              isActive
                ? 'text-sky-400 bg-sky-500/10 font-semibold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <Icon className="w-4 h-4 mb-1 shrink-0" />
            <span className="text-[11px] leading-none">{label}</span>
          </button>
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
    <div
      className={`fixed z-30 ${
        isWideScreen ? 'bottom-6 right-6' : 'bottom-20 right-4'
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 whitespace-nowrap shrink-0"
      >
        <MessageSquare className="w-4 h-4 shrink-0" />
        <span>Tanya Tutor Mimi (+15 XP)</span>
      </button>
    </div>
  );
};
