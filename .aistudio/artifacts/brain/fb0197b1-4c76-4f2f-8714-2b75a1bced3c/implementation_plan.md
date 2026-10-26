# Smartphone UI Update: Duolingo Stepping Path & Dola Task Integration

Redesign and optimize the smartphone interface with an aesthetic, tactile layout inspired by Duolingo's interactive stepping path and Dola's task management system.

## User Review & Critical Decisions

> [!IMPORTANT]
> The design will deliver a sleek, modern, non-tacky ("aesthetic & tidak norak") Duolingo-style path while preserving mobile ergonomics, fast navigation, and clean typography.

- **Confirmed Decision 1**: **Duolingo Stepping Path as Default Mobile View**: The `HomeScreen` will default to an interactive 3D tactile winding path on smartphone view, with an intuitive view toggle to switch to the compact card layout anytime.
- **Confirmed Decision 2**: **Text Sync for Google Tasks**: When tapping "Sinkron Google Tasks", the app will synchronize the user's daily study targets into Google Tasks via text payload and Google Tasks API / OAuth flow, with local & Firestore sync fallback.

---

## 1. Overview & Core Concept

This update transforms the mobile experience of MIMI V15 into a highly engaging, gamified learning journey:
- **Top Status Bar Super Ramping**: A compact, single-row mobile header featuring active course chip (`🎓 SMP Kelas 8`), streak counter (`🔥 3`), XP balance (`💎 120`), book drive shortcut (`📚`), and tappable profile avatar with level badge.
- **Duolingo Interactive Stepping Path**: A winding path of 3D tactile circular nodes:
  - *Completed Nodes*: Emerald green with bold checkmark (`✓`).
  - *Active Node*: Glowing cyan with pulsing star badge, smooth animation, and floating "Mulai Di Sini!" tooltip banner.
  - *Exam / Milestone Nodes*: Gold trophy node offering extra XP bonus upon completion.
  - *Duolingo Unit Popup Card*: Tapping any node opens an aesthetic floating modal with "Mulai Belajar (+40 XP)" and "Unduh PDF" actions.
- **Dola-Style Target Harian & Google Tasks**: Compact daily target checklist with tactile toggles, inline target submission form, and "Sinkron Google Tasks" text sync.
- **Proportional Viewport View**: Modal dialogs, avatar selectors, and bottom sheets use `max-h-[88dvh]` with custom smooth scrolling to fit perfectly without overflow or cutoff on mobile screens.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Smartphone Viewport Entry**: The user opens the app on a mobile device and immediately sees the ultra-slim Top Status Bar. Above the fold, the current unit banner and glowing active node on the Duolingo Stepping Path appear immediately.
2. **Node Interaction**: Tapping an active or completed node opens a Duolingo-style preview card with unit details, Kemendikbud book citation, and a tactile primary action button.
3. **Daily Target & Google Tasks Sync**: Users can check off daily learning targets, type a new target inline, or tap "Sinkron Google Tasks" to push targets into their Google Tasks list.
4. **Avatar Profile Modal**: Tapping the mini avatar opens the Cyberpunk avatar selector dialog, rendered in a responsive, non-overflowing container.

### Visual Identity & Theme
- **Color Tokens**: Dark slate canvas (`#0B1120`), dark surface containers (`#131C31`), vibrant sky cyan (`#38BDF8`), emerald green (`#34D399`), amber gold (`#FBBF24`), and pink accent (`#F472B6`).
- **Typography & Hierarchy**: Clean, unboxed text, high-contrast headings, tabular numbers for XP/streak metrics, and `leading-relaxed` line spacing.
- **Micro-Interactions**: Tactile button press curves (`whileTap={{ scale: 0.95 }}`), glowing node rings, floating tooltip animations, and responsive bottom sheets.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1**: **Dual Mobile Mode (Stepping Path vs. Compact Cards)**
  - *Chosen Approach*: Default to the Duolingo Stepping Path on mobile while providing a quick segmented toggle button ("Jalur Duo" / "Kartu Ringkas").
  - *Why*: Gives users the fun gamified experience without forcing it on users who prefer a list view.

- **Decision 2**: **Compact Mobile Top Bar**
  - *Chosen Approach*: Consolidate header items into a single row using compact pill chips.
  - *Why*: Eliminates vertical bulk, leaving 85%+ of the mobile viewport for learning content.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Root Layout)                          │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
    ┌───────────────▼──────────────┐   ┌─────────────▼───────────────────┐
    │ Mobile Ultra-Slim Top Bar    │   │ HomeScreen.tsx                  │
    │ (Course, Streak, XP, Avatar) │   │ ├─ Duolingo Stepping Path       │
    └──────────────────────────────┘   │ ├─ Duolingo Unit Popup Modal    │
                                       │ ├─ Dola Daily Targets & Form    │
                                       │ └─ Google Tasks Text Sync Modal │
                                       └─────────────────────────────────┘
```

### Data Model & State Mapping
- `isDuoPathView`: Boolean state in `HomeScreen.tsx` toggling between Stepping Path and Compact Grid.
- `activePathNodeModal`: Selected `LevelItem` for the Duolingo preview modal.
- `milestones`: Array of daily target items synced locally and pushed via `/api/tasks/sync`.

---

## 6. Real-Time Duel Arena & Mobile Ergonomics Update

### Completed Features:
1. **Real-Time 'Duel Arena' Architecture**:
   - **Firestore Synchronization**: Real-time room subscription (`subscribeToDuelRoom`) with Firestore collection `duel_rooms/{roomId}`.
   - **Mode 1: Duel Lawan Cyber Bot (AI)**: Instant 1-click solo matchmaking with realistic dynamic bot delay (2–4.5s) and 75% accuracy simulation.
   - **Mode 2: Duel Lawan Teman (Realtime PVP)**:
     - Room host creates a 5-character neon code (e.g. `CYB921`) with instant clipboard copy & share.
     - Friend enters code to join; both screens immediately transition to a synchronous countdown (3.. 2.. 1.. GO!).
   - **Synchronous Split HUD**: Live head-to-head score comparison, round tracker (5 rapid rounds), dual health/score progress bar, and 10s per-question countdown.
   - **Curated Cyber Quiz Dataset (`DUEL_CYBER_QUESTIONS`)**: Fast-paced cyber security, logic, programming, algorithms, and Mimi hacks questions.
   - **Audio & Haptic Feedback**: Lightweight Web Audio API synthesizer for countdown ticks, correct answers, wrong blips, and victory fanfare + haptic vibration.
   - **Podium Victory Screen**: Post-match stats, XP award (+150-200 XP), rematch trigger, and return to arena lobby.

2. **Mobile Screen (HP) Ergonomics & Aesthetic Optimization**:
   - Compact responsive padding (`p-3.5 sm:p-5` instead of bulky `p-8`).
   - Balanced spacing (`gap-2.5 sm:gap-4`, `space-y-3.5 sm:space-y-5`) that eliminates awkward empty voids without crowding text.
   - High-contrast, legible typography (`text-xs`/`text-sm` captions, `text-sm sm:text-base` questions) fitting small mobile screens (360px-430px) without aggressive scrolling.
   - Ergonomic 46px+ touch target buttons for fast one-thumb answering.
   - Firestore rules deployed and validated.
