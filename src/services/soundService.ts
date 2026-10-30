/**
 * Sound Service using Web Audio API for Mimi V15
 * - Clear, audible Cyber Battle BGM (optimized 110Hz-880Hz frequencies for laptop & phone speakers)
 * - Adjustable volume slider (0.0 to 1.0, default 0.65)
 * - Triumphant Victory Fanfare Music when winning a duel
 * - Harmonic chime for correct answers & gentle tone for wrong answers
 */

class SoundService {
  private audioCtx: AudioContext | null = null;
  private duelMusicTimer: number | null = null;
  private isMusicPlaying = false;
  private bgmGainNode: GainNode | null = null;
  private isSoundMuted = false;
  private isBgmOn = true;
  private bgmVolume = 0.65; // Clearly audible default volume (65%)

  constructor() {
    if (typeof window !== 'undefined') {
      const savedBgm = localStorage.getItem('mimi_cyber_bgm_enabled');
      this.isBgmOn = savedBgm !== 'false';
      const savedVol = localStorage.getItem('mimi_cyber_bgm_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.bgmVolume = parsed;
        }
      }
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  public resumeAudio(): AudioContext | null {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  /**
   * Set BGM Volume (0.0 to 1.0) dynamically
   */
  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.bgmVolume = clamped;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mimi_cyber_bgm_volume', String(clamped));
    }
    if (this.bgmGainNode && this.audioCtx) {
      try {
        this.bgmGainNode.gain.setTargetAtTime(clamped * 0.45, this.audioCtx.currentTime, 0.05);
      } catch {}
    }
  }

  public getVolume(): number {
    return this.bgmVolume;
  }

  /**
   * Harmonic pleasant chime for correct answers (C5 -> E5 -> G5 -> C6)
   */
  public playCorrectSound(): void {
    if (this.isSoundMuted) return;
    const ctx = this.resumeAudio();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.065);

        gain.gain.setValueAtTime(0, now + idx * 0.065);
        gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.065 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.065 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.065);
        osc.stop(now + idx * 0.065 + 0.38);
      });
    } catch {}
  }

  /**
   * Gentle, soft warm tone for wrong answers (not harsh or shocking)
   */
  public playWrongSound(): void {
    if (this.isSoundMuted) return;
    const ctx = this.resumeAudio();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(520, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, now);
      osc.frequency.exponentialRampToValueAtTime(165, now + 0.28);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.34);
    } catch {}
  }

  /**
   * Short countdown beep / timer warning blip
   */
  public playCountdownBeep(highPitch = false): void {
    if (this.isSoundMuted) return;
    const ctx = this.resumeAudio();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(highPitch ? 880 : 440, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }

  /**
   * Triumphant Victory Fanfare Music played when winning a duel!
   */
  public playVictoryMusic(): void {
    this.stopDuelMusic();
    if (this.isSoundMuted) return;
    const ctx = this.resumeAudio();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Classic triumphant fanfare melody:
      // G4 -> C5 -> E5 -> G5 (hold) -> E5 -> G5 -> C6 (grand finale chord!)
      const melody: { freq: number; start: number; dur: number; vol: number }[] = [
        { freq: 392.0, start: 0.0, dur: 0.14, vol: 0.24 },   // G4
        { freq: 523.25, start: 0.15, dur: 0.14, vol: 0.26 }, // C5
        { freq: 659.25, start: 0.30, dur: 0.14, vol: 0.28 }, // E5
        { freq: 783.99, start: 0.45, dur: 0.32, vol: 0.32 }, // G5
        { freq: 659.25, start: 0.80, dur: 0.18, vol: 0.26 }, // E5
        { freq: 783.99, start: 1.00, dur: 0.22, vol: 0.30 }, // G5
        { freq: 1046.5, start: 1.25, dur: 0.95, vol: 0.35 }, // C6 Grand Finale
      ];

      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        // Harmonic fifth / octave नीचे for fullness
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(note.freq * 0.5, now + note.start);

        gain.gain.setValueAtTime(0, now + note.start);
        gain.gain.linearRampToValueAtTime(note.vol, now + note.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.start);
        subOsc.start(now + note.start);
        osc.stop(now + note.start + note.dur + 0.05);
        subOsc.stop(now + note.start + note.dur + 0.05);
      });

      // Finale Major Chord (C5 + E5 + G5) at 1.25s
      [523.25, 659.25, 783.99].forEach((chordFreq) => {
        const cOsc = ctx.createOscillator();
        const cGain = ctx.createGain();
        cOsc.type = 'sine';
        cOsc.frequency.setValueAtTime(chordFreq, now + 1.25);

        cGain.gain.setValueAtTime(0, now + 1.25);
        cGain.gain.linearRampToValueAtTime(0.14, now + 1.3);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);

        cOsc.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(now + 1.25);
        cOsc.stop(now + 2.35);
      });
    } catch {}
  }

  /**
   * Duel BGM is now handled exclusively by `duelMusicService.ts` (4 distinct MP3 files per level)
   * inside the active duel room only. Keeping `startDuelMusic()` silent prevents audio collision.
   */
  public startDuelMusic(): void {
    this.stopDuelMusic();
  }

  /**
   * Stop duel music smoothly
   */
  public stopDuelMusic(): void {
    this.isMusicPlaying = false;
    if (this.duelMusicTimer !== null) {
      clearInterval(this.duelMusicTimer);
      this.duelMusicTimer = null;
    }

    if (this.bgmGainNode && this.audioCtx) {
      try {
        const nodeToClean = this.bgmGainNode;
        this.bgmGainNode = null;
        const now = this.audioCtx.currentTime;
        nodeToClean.gain.cancelScheduledValues(now);
        nodeToClean.gain.setValueAtTime(nodeToClean.gain.value, now);
        nodeToClean.gain.linearRampToValueAtTime(0.0001, now + 0.15);
        setTimeout(() => {
          try {
            nodeToClean.disconnect();
          } catch {}
        }, 200);
      } catch {
        this.bgmGainNode = null;
      }
    }
  }

  public isDuelMusicActive(): boolean {
    return this.isMusicPlaying;
  }

  public toggleBgm(): boolean {
    this.resumeAudio();
    this.isBgmOn = !this.isBgmOn;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mimi_cyber_bgm_enabled', String(this.isBgmOn));
    }
    if (!this.isBgmOn) {
      this.stopDuelMusic();
    }
    return this.isBgmOn;
  }

  public isBgmEnabled(): boolean {
    return this.isBgmOn;
  }

  public toggleMute(): boolean {
    const nextState = this.toggleBgm();
    this.isSoundMuted = !nextState;
    return !nextState;
  }

  public getIsMuted(): boolean {
    return !this.isBgmOn;
  }
}

export const soundService = new SoundService();
