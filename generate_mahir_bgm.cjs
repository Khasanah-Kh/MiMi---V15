const fs = require('fs');
const { execSync } = require('child_process');

// Audio parameters
const SAMPLE_RATE = 44100;
const BPM = 128;
const BEAT_DUR = 60 / BPM; // seconds per beat (~0.46875s)
const BAR_DUR = BEAT_DUR * 4; // ~1.875s per bar
const NUM_BARS = 16; // 16 bars total = ~30 seconds loop
const TOTAL_DURATION = NUM_BARS * BAR_DUR;
const TOTAL_SAMPLES = Math.floor(SAMPLE_RATE * TOTAL_DURATION);

// Frequencies for F Major / D Minor Pentatonic & Chords
const NOTES = {
  F1: 43.65, C2: 65.41, D2: 73.42, F2: 87.31, G2: 98.00, A2: 110.00, Bb2: 116.54, C3: 130.81, D3: 146.83,
  E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, Bb3: 233.08, C4: 261.63, D4: 293.66, E4: 329.63,
  F4: 349.23, G4: 392.00, A4: 440.00, C5: 523.25, D5: 587.33, F5: 698.46
};

// Buffers (Left and Right for Stereo)
const leftBuffer = new Float32Array(TOTAL_SAMPLES);
const rightBuffer = new Float32Array(TOTAL_SAMPLES);

// --- Lowpass Filter Utility (Smoothing out harsh high frequencies) ---
function createLowpassFilter(cutoffFreq) {
  const rc = 1.0 / (2.0 * Math.PI * cutoffFreq);
  const dt = 1.0 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  let lastOutL = 0;
  let lastOutR = 0;
  return {
    filterL: (inL) => {
      lastOutL = lastOutL + alpha * (inL - lastOutL);
      return lastOutL;
    },
    filterR: (inR) => {
      lastOutR = lastOutR + alpha * (inR - lastOutR);
      return lastOutR;
    }
  };
}

const melodyFilter = createLowpassFilter(1600); // Strict lowpass at 1.6kHz -> NO "nyelekit" harshness!
const chordFilter = createLowpassFilter(1200);  // Soft, warm chords

// --- Synth Waveform Helpers ---
function sine(phase) {
  return Math.sin(phase);
}

function triangle(phase) {
  const p = (phase / (2 * Math.PI)) % 1;
  return p < 0.5 ? 4 * p - 1 : 3 - 4 * p;
}

function warmSaw(phase) {
  // Blended warm wave with reduced odd harmonics
  return 0.7 * Math.sin(phase) + 0.3 * triangle(phase);
}

// Add note event to buffers
function addTone({ startSample, durationSamples, freq, vol = 0.2, type = 'sine', pan = 0, isLead = false, isChord = false }) {
  for (let i = 0; i < durationSamples; i++) {
    const idx = startSample + i;
    if (idx >= TOTAL_SAMPLES) break;

    const t = i / SAMPLE_RATE;
    const envT = i / durationSamples;
    
    // Envelope: Smooth Attack, Sustained Body, Exponential Decay
    let env = 1.0;
    const attack = 0.015 * SAMPLE_RATE;
    if (i < attack) {
      env = i / attack;
    } else {
      env = Math.pow(1 - (i - attack) / (durationSamples - attack), 1.2);
    }

    const phase = 2 * Math.PI * freq * t;
    let val = 0;

    if (type === 'sine') val = sine(phase);
    else if (type === 'triangle') val = triangle(phase);
    else if (type === 'warm') val = warmSaw(phase);
    else if (type === 'bass') val = 0.8 * sine(phase) + 0.2 * sine(phase * 2);

    val *= env * vol;

    let sampleL = val * (0.5 - pan * 0.5);
    let sampleR = val * (0.5 + pan * 0.5);

    if (isLead) {
      sampleL = melodyFilter.filterL(sampleL);
      sampleR = melodyFilter.filterR(sampleR);
    } else if (isChord) {
      sampleL = chordFilter.filterL(sampleL);
      sampleR = chordFilter.filterR(sampleR);
    }

    leftBuffer[idx] += sampleL;
    rightBuffer[idx] += sampleR;
  }
}

// --- Add Drum Sounds ---
function addKick(startSample, vol = 0.35) {
  const dur = Math.floor(0.18 * SAMPLE_RATE);
  for (let i = 0; i < dur; i++) {
    const idx = startSample + i;
    if (idx >= TOTAL_SAMPLES) break;
    const t = i / SAMPLE_RATE;
    const freq = 130 * Math.exp(-t * 35) + 35; // Kick pitch drop
    const env = Math.exp(-t * 22);
    const val = Math.sin(2 * Math.PI * freq * t) * env * vol;
    leftBuffer[idx] += val;
    rightBuffer[idx] += val;
  }
}

function addSnare(startSample, vol = 0.22) {
  const dur = Math.floor(0.15 * SAMPLE_RATE);
  for (let i = 0; i < dur; i++) {
    const idx = startSample + i;
    if (idx >= TOTAL_SAMPLES) break;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 25);
    const noise = (Math.random() * 2 - 1) * env * 0.6;
    const body = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 30) * 0.4;
    const val = (noise + body) * vol;
    leftBuffer[idx] += val * 0.9;
    rightBuffer[idx] += val * 0.9;
  }
}

function addHiHat(startSample, vol = 0.08, open = false) {
  const dur = Math.floor((open ? 0.12 : 0.04) * SAMPLE_RATE);
  for (let i = 0; i < dur; i++) {
    const idx = startSample + i;
    if (idx >= TOTAL_SAMPLES) break;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * (open ? 25 : 60));
    const noise = (Math.random() * 2 - 1) * env * vol;
    leftBuffer[idx] += noise;
    rightBuffer[idx] += noise;
  }
}

function addWoodblock(startSample, freq = 800, vol = 0.12) {
  const dur = Math.floor(0.05 * SAMPLE_RATE);
  for (let i = 0; i < dur; i++) {
    const idx = startSample + i;
    if (idx >= TOTAL_SAMPLES) break;
    const t = i / SAMPLE_RATE;
    const env = Math.exp(-t * 70);
    const val = Math.sin(2 * Math.PI * freq * t) * env * vol;
    leftBuffer[idx] += val * 0.7;
    rightBuffer[idx] += val * 1.3;
  }
}

// ==========================================
// COMPOSITION - 16 BARS OF FUNKY MATCH BGM
// ==========================================

const chordProgression = [
  // 4 bars Fmaj7 -> Dm7 -> Gm7 -> C9
  [NOTES.F3, NOTES.A3, NOTES.C4, NOTES.E4], // Bar 1: Fmaj7
  [NOTES.D3, NOTES.F3, NOTES.A3, NOTES.C4], // Bar 2: Dm7
  [NOTES.G3, NOTES.Bb3, NOTES.D4, NOTES.F4], // Bar 3: Gm7
  [NOTES.C3, NOTES.E3, NOTES.G3, NOTES.Bb3], // Bar 4: C9
];

const bassNotes = [NOTES.F2, NOTES.D2, NOTES.G2, NOTES.C2];

// 1. DRUMS & PERCUSSION LOOP
for (let bar = 0; bar < NUM_BARS; bar++) {
  const barStart = Math.floor(bar * BAR_DUR * SAMPLE_RATE);
  const beatSamples = Math.floor(BEAT_DUR * SAMPLE_RATE);
  const sixteenthSamples = Math.floor(BEAT_DUR * 0.25 * SAMPLE_RATE);

  // Drums pattern per bar
  for (let beat = 0; beat < 4; beat++) {
    const beatStart = barStart + beat * beatSamples;
    
    // Kick on Beat 1 and Beat 3 (and 3.5 syncopated)
    if (beat === 0 || beat === 2) {
      addKick(beatStart, 0.32);
    }
    if (beat === 2) {
      addKick(beatStart + Math.floor(sixteenthSamples * 2.5), 0.22);
    }

    // Snare on Beat 2 and Beat 4
    if (beat === 1 || beat === 3) {
      addSnare(beatStart, 0.20);
    }

    // Hi-hats on all 16ths
    for (let s = 0; s < 4; s++) {
      const hhTime = beatStart + s * sixteenthSamples;
      const isOpen = s === 2 && beat % 2 === 1;
      addHiHat(hhTime, isOpen ? 0.09 : 0.05, isOpen);
    }

    // Woodblock playful accents on bar 2, 4, 6, 8...
    if (bar % 2 === 1 && beat === 3) {
      addWoodblock(beatStart + Math.floor(sixteenthSamples * 1.5), 920, 0.1);
    }
  }
}

// 2. BASSLINE & CHORDS LOOP
for (let bar = 0; bar < NUM_BARS; bar++) {
  const barStart = Math.floor(bar * BAR_DUR * SAMPLE_RATE);
  const sixteenthSamples = Math.floor(BEAT_DUR * 0.25 * SAMPLE_RATE);
  const chordIdx = bar % 4;
  const chord = chordProgression[chordIdx];
  const rootBass = bassNotes[chordIdx];

  // Warm Chords - Sustained pads with groove pulses
  for (let beat = 0; beat < 4; beat++) {
    const beatStart = barStart + beat * Math.floor(BEAT_DUR * SAMPLE_RATE);
    chord.forEach((freq) => {
      addTone({
        startSample: beatStart,
        durationSamples: Math.floor(BEAT_DUR * 0.85 * SAMPLE_RATE),
        freq,
        vol: 0.07,
        type: 'sine',
        pan: (beat % 2 === 0 ? -0.2 : 0.2),
        isChord: true
      });
    });
  }

  // Funky BASSLINE - Bouncy 16th note groove
  const bassPattern = [
    { pos: 0, dur: 1.5, pitch: rootBass },
    { pos: 2, dur: 1.0, pitch: rootBass * 2 },
    { pos: 4, dur: 1.5, pitch: rootBass },
    { pos: 6, dur: 1.0, pitch: rootBass * 1.5 },
    { pos: 8, dur: 1.5, pitch: rootBass },
    { pos: 10, dur: 1.0, pitch: rootBass * 2 },
    { pos: 12, dur: 2.0, pitch: rootBass },
    { pos: 14, dur: 1.0, pitch: rootBass * 1.125 },
  ];

  bassPattern.forEach(({ pos, dur, pitch }) => {
    addTone({
      startSample: barStart + pos * sixteenthSamples,
      durationSamples: Math.floor(dur * sixteenthSamples),
      freq: pitch,
      vol: 0.28,
      type: 'bass',
      pan: 0
    });
  });
}

// 3. CATCHY, UPLIFTING LEAD MELODY (MAHIR LEVEL DUEL THEME)
// Melodic Theme - Cheerful, Smooth & Energetic
const melodyPhraseA = [
  { barOffset: 0, step: 0, dur: 2, note: NOTES.C4 },
  { barOffset: 0, step: 2, dur: 2, note: NOTES.F4 },
  { barOffset: 0, step: 4, dur: 2, note: NOTES.A4 },
  { barOffset: 0, step: 6, dur: 4, note: NOTES.C5 },
  { barOffset: 0, step: 10, dur: 2, note: NOTES.A4 },
  { barOffset: 0, step: 12, dur: 4, note: NOTES.F4 },

  { barOffset: 1, step: 0, dur: 3, note: NOTES.G4 },
  { barOffset: 1, step: 3, dur: 3, note: NOTES.A4 },
  { barOffset: 1, step: 6, dur: 2, note: NOTES.F4 },
  { barOffset: 1, step: 8, dur: 6, note: NOTES.D4 },

  { barOffset: 2, step: 0, dur: 2, note: NOTES.C4 },
  { barOffset: 2, step: 2, dur: 2, note: NOTES.F4 },
  { barOffset: 2, step: 4, dur: 2, note: NOTES.A4 },
  { barOffset: 2, step: 6, dur: 4, note: NOTES.C5 },
  { barOffset: 2, step: 10, dur: 2, note: NOTES.D5 },
  { barOffset: 2, step: 12, dur: 4, note: NOTES.C5 },

  { barOffset: 3, step: 0, dur: 4, note: NOTES.A4 },
  { barOffset: 3, step: 4, dur: 4, note: NOTES.G4 },
  { barOffset: 3, step: 8, dur: 8, note: NOTES.F4 },
];

const melodyPhraseB = [
  { barOffset: 4, step: 0, dur: 2, note: NOTES.A4 },
  { barOffset: 4, step: 2, dur: 2, note: NOTES.C5 },
  { barOffset: 4, step: 4, dur: 4, note: NOTES.D5 },
  { barOffset: 4, step: 8, dur: 2, note: NOTES.C5 },
  { barOffset: 4, step: 10, dur: 2, note: NOTES.A4 },
  { barOffset: 4, step: 12, dur: 4, note: NOTES.F4 },

  { barOffset: 5, step: 0, dur: 3, note: NOTES.G4 },
  { barOffset: 5, step: 3, dur: 3, note: NOTES.A4 },
  { barOffset: 5, step: 6, dur: 2, note: NOTES.C5 },
  { barOffset: 5, step: 8, dur: 6, note: NOTES.G4 },

  { barOffset: 6, step: 0, dur: 2, note: NOTES.F4 },
  { barOffset: 6, step: 2, dur: 2, note: NOTES.G4 },
  { barOffset: 6, step: 4, dur: 2, note: NOTES.A4 },
  { barOffset: 6, step: 6, dur: 4, note: NOTES.C5 },
  { barOffset: 6, step: 10, dur: 2, note: NOTES.D5 },
  { barOffset: 6, step: 12, dur: 4, note: NOTES.F5 },

  { barOffset: 7, step: 0, dur: 6, note: NOTES.C5 },
  { barOffset: 7, step: 6, dur: 4, note: NOTES.A4 },
  { barOffset: 7, step: 10, dur: 6, note: NOTES.F4 },
];

// Combine phrases for 16 bars
const fullMelody = [
  ...melodyPhraseA,
  ...melodyPhraseB,
  ...melodyPhraseA.map(m => ({ ...m, barOffset: m.barOffset + 8 })),
  ...melodyPhraseB.map(m => ({ ...m, barOffset: m.barOffset + 8 })),
];

fullMelody.forEach(({ barOffset, step, dur, note }) => {
  const barStart = Math.floor(barOffset * BAR_DUR * SAMPLE_RATE);
  const sixteenthSamples = Math.floor(BEAT_DUR * 0.25 * SAMPLE_RATE);
  addTone({
    startSample: barStart + step * sixteenthSamples,
    durationSamples: Math.floor(dur * sixteenthSamples * 0.92),
    freq: note,
    vol: 0.16,
    type: 'triangle', // Pure smooth triangle wave
    pan: 0,
    isLead: true
  });
});

// 4. SOFT MARIMBA ARPEGGIO COUNTER-MELODY (Fills space gracefully)
for (let bar = 0; bar < NUM_BARS; bar++) {
  const barStart = Math.floor(bar * BAR_DUR * SAMPLE_RATE);
  const sixteenthSamples = Math.floor(BEAT_DUR * 0.25 * SAMPLE_RATE);
  const arpNotes = [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.F5];

  for (let s = 0; s < 16; s += 2) {
    const note = arpNotes[(s / 2) % arpNotes.length];
    addTone({
      startSample: barStart + s * sixteenthSamples,
      durationSamples: Math.floor(1.5 * sixteenthSamples),
      freq: note,
      vol: 0.04,
      type: 'sine',
      pan: (s % 4 === 0 ? -0.35 : 0.35)
    });
  }
}

// Normalize and Write PCM WAV file
console.log('Mastering audio and balancing dynamics...');
let maxPeak = 0;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  maxPeak = Math.max(maxPeak, Math.abs(leftBuffer[i]), Math.abs(rightBuffer[i]));
}

const targetPeak = 0.88; // Target headroom
const normFactor = maxPeak > 0 ? targetPeak / maxPeak : 1.0;

// Create 16-bit Stereo WAV
const headerSize = 44;
const dataSize = TOTAL_SAMPLES * 2 * 2; // 2 channels, 2 bytes per sample
const wavBuffer = Buffer.alloc(headerSize + dataSize);

// WAV Header
wavBuffer.write('RIFF', 0);
wavBuffer.writeUInt32LE(36 + dataSize, 4);
wavBuffer.write('WAVE', 8);
wavBuffer.write('fmt ', 12);
wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
wavBuffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
wavBuffer.writeUInt16LE(2, 22);  // NumChannels (2 = Stereo)
wavBuffer.writeUInt32LE(SAMPLE_RATE, 24);
wavBuffer.writeUInt32LE(SAMPLE_RATE * 2 * 2, 28); // ByteRate
wavBuffer.writeUInt16LE(4, 32);  // BlockAlign
wavBuffer.writeUInt16LE(16, 34); // BitsPerSample
wavBuffer.write('data', 36);
wavBuffer.writeUInt32LE(dataSize, 40);

// Write Sample Data
let offset = 44;
for (let i = 0; i < TOTAL_SAMPLES; i++) {
  let sampleL = leftBuffer[i] * normFactor;
  let sampleR = rightBuffer[i] * normFactor;

  // Clamping
  sampleL = Math.max(-1, Math.min(1, sampleL));
  sampleR = Math.max(-1, Math.min(1, sampleR));

  const intL = Math.floor(sampleL < 0 ? sampleL * 32768 : sampleL * 32767);
  const intR = Math.floor(sampleR < 0 ? sampleR * 32768 : sampleR * 32767);

  wavBuffer.writeInt16LE(intL, offset);
  wavBuffer.writeInt16LE(intR, offset + 2);
  offset += 4;
}

fs.writeFileSync('/tmp/mahir_bgm.wav', wavBuffer);
console.log('WAV generated at /tmp/mahir_bgm.wav. Encoding MP3 via ffmpeg...');

execSync('ffmpeg -y -i /tmp/mahir_bgm.wav -vn -ar 44100 -ac 2 -b:a 192k public/bgm/bgm-mahir.mp3');
console.log('Successfully generated public/bgm/bgm-mahir.mp3!');
