/**
 * Sound Service using Web Audio API for Mimi V15
 * - Harmonic positive chime for correct answers
 * - Gentle warm tone for wrong answers (not shocking)
 * - Suspenseful, exciting procedural duel soundtrack (gentle volume, cinematic tension)
 */

class SoundService {
  private audioCtx: AudioContext | null = null;
  private duelMusicTimer: number | null = null;
  private isMusicPlaying = false;
  private isMuted = false;
  private musicGainNode: GainNode | null = null;

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

  /**
   * Harmonic pleasant chime for correct answers
   */
  public playCorrectSound(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Warm triangle + sine mixture feel
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0, now + idx * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.38);
      });
    } catch {
      // Audio autoplay policy handled safely
    }
  }

  /**
   * Gentle, soft warm tone for wrong answers (never harsh or jarring)
   */
  public playWrongSound(): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Low-pass filter to keep it mellow and non-jarring
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);

      osc.type = 'triangle';
      // Gentle downward slide (240Hz -> 175Hz)
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(175, now + 0.28);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Safe fallback
    }
  }

  /**
   * Short countdown / alert blip
   */
  public playCountdownBeep(highPitch = false): void {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(highPitch ? 880 : 440, now);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Safe fallback
    }
  }

  /**
   * Start exciting, suspenseful, procedural duel background music
   * BPM ~118, rhythmic bass pulse, ambient chord progression in D minor
   * Gentle volume (0.07) so it's exciting but doesn't startle
   */
  public startDuelMusic(): void {
    if (this.isMusicPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    let step = 0;

    // D minor progression: Dm -> Bb -> F -> A
    // Bass notes (Hz): D2(73.4), F2(87.3), Bb1(58.3), A1(55.0)
    const chordRoots = [73.42, 73.42, 58.27, 55.00];
    const padFreqs = [
      [220, 261.63, 329.63], // Dm
      [233.08, 293.66, 349.23], // Bb
      [174.61, 220, 261.63], // F
      [220, 277.18, 329.63], // A
    ];

    const playStep = () => {
      if (!this.isMusicPlaying) return;
      const now = ctx.currentTime;
      const chordIdx = Math.floor((step % 16) / 4);

      // 1. Rhythmic syncopated synth bass pulse on 16th steps
      const isBassStep = step % 4 === 0 || step % 4 === 2 || (step % 8 === 7);
      if (isBassStep && !this.isMuted) {
        try {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          const bassFilter = ctx.createBiquadFilter();

          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(chordRoots[chordIdx], now);

          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(280, now);
          bassFilter.frequency.exponentialRampToValueAtTime(120, now + 0.2);

          bassGain.gain.setValueAtTime(0.08, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(ctx.destination);

          bassOsc.start(now);
          bassOsc.stop(now + 0.23);
        } catch {}
      }

      // 2. Soft suspenseful pad swell every 4 beats
      if (step % 8 === 0 && !this.isMuted) {
        try {
          const freqs = padFreqs[chordIdx];
          freqs.forEach((f) => {
            const padOsc = ctx.createOscillator();
            const padGain = ctx.createGain();
            const padFilter = ctx.createBiquadFilter();

            padOsc.type = 'sine';
            padOsc.frequency.setValueAtTime(f, now);

            padFilter.type = 'lowpass';
            padFilter.frequency.setValueAtTime(800, now);

            padGain.gain.setValueAtTime(0, now);
            padGain.gain.linearRampToValueAtTime(0.03, now + 0.4);
            padGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

            padOsc.connect(padFilter);
            padFilter.connect(padGain);
            padGain.connect(ctx.destination);

            padOsc.start(now);
            padOsc.stop(now + 1.85);
          });
        } catch {}
      }

      // 3. Very subtle hi-hat / tick pulse for battle momentum
      if (step % 2 === 0 && !this.isMuted) {
        try {
          const tickOsc = ctx.createOscillator();
          const tickGain = ctx.createGain();
          const tickFilter = ctx.createBiquadFilter();

          tickOsc.type = 'sine';
          tickOsc.frequency.setValueAtTime(step % 4 === 2 ? 1800 : 1200, now);

          tickFilter.type = 'highpass';
          tickFilter.frequency.setValueAtTime(1000, now);

          tickGain.gain.setValueAtTime(0.02, now);
          tickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

          tickOsc.connect(tickFilter);
          tickFilter.connect(tickGain);
          tickGain.connect(ctx.destination);

          tickOsc.start(now);
          tickOsc.stop(now + 0.05);
        } catch {}
      }

      step = (step + 1) % 64;
    };

    // ~118 BPM = 16th note is ~127ms
    this.duelMusicTimer = window.setInterval(playStep, 127);
  }

  /**
   * Stop duel music with smooth release
   */
  public stopDuelMusic(): void {
    this.isMusicPlaying = false;
    if (this.duelMusicTimer !== null) {
      clearInterval(this.duelMusicTimer);
      this.duelMusicTimer = null;
    }
  }

  public isDuelMusicActive(): boolean {
    return this.isMusicPlaying;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }
}

export const soundService = new SoundService();
