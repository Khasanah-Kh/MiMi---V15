import math
import struct
import wave
import subprocess
import os

SAMPLE_RATE = 44100

def clamp(v, min_v=-1.0, max_v=1.0):
    return max(min_v, min(max_v, v))

def freq_from_note(note_str):
    # e.g. "C4", "A4", "F#5", "Bb4"
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    scale = {'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'}
    
    note_str = note_str.strip()
    if len(note_str) > 1 and note_str[1] == 'b':
        note_str = scale.get(note_str[:2], note_str[:2]) + note_str[2:]
    
    octave = int(note_str[-1])
    key = note_str[:-1]
    idx = notes.index(key)
    midi = (octave + 1) * 12 + idx
    return 440.0 * (2.0 ** ((midi - 69) / 12.0))

def synth_wave(shape, phase):
    # phase in [0, 1)
    if shape == 'sine':
        return math.sin(2 * math.pi * phase)
    elif shape == 'square':
        return 0.8 if phase < 0.5 else -0.8
    elif shape == 'saw':
        return 2.0 * phase - 1.0
    elif shape == 'triangle':
        return 4.0 * abs(phase - 0.5) - 1.0
    return 0.0

def generate_pemula(filename_wav):
    # 120 BPM C-Major Upbeat Synth-Pop Battle
    bpm = 120
    beat_dur = 60.0 / bpm  # 0.5 sec
    measures = 8
    total_dur = measures * 4 * beat_dur # 16.0 sec
    total_samples = int(SAMPLE_RATE * total_dur)
    
    # Track buffers (left, right)
    left = [0.0] * total_samples
    right = [0.0] * total_samples
    
    # Progression: C - G - Am - F (2 bars each)
    chords = [
        ['C4', 'E4', 'G4', 'C5'], ['C4', 'E4', 'G4', 'C5'],
        ['G3', 'B3', 'D4', 'G4'], ['G3', 'B3', 'D4', 'G4'],
        ['A3', 'C4', 'E4', 'A4'], ['A3', 'C4', 'E4', 'A4'],
        ['F3', 'A3', 'C4', 'F4'], ['F3', 'A3', 'C4', 'F4'],
    ]
    
    bass_notes = ['C3', 'C3', 'G2', 'G2', 'A2', 'A2', 'F2', 'F2']
    
    melody_notes = [
        # Bar 1 (C)
        ('G5', 0.5), ('E5', 0.5), ('C5', 0.5), ('D5', 0.5), ('E5', 1.0), ('G5', 1.0),
        # Bar 2 (C)
        ('C6', 1.0), ('B5', 0.5), ('A5', 0.5), ('G5', 2.0),
        # Bar 3 (G)
        ('B5', 0.5), ('G5', 0.5), ('D5', 0.5), ('E5', 0.5), ('F5', 1.0), ('A5', 1.0),
        # Bar 4 (G)
        ('G5', 1.5), ('F5', 0.5), ('E5', 1.0), ('D5', 1.0),
        # Bar 5 (Am)
        ('C6', 0.5), ('A5', 0.5), ('E5', 0.5), ('A5', 0.5), ('C6', 1.0), ('E6', 1.0),
        # Bar 6 (Am)
        ('D6', 1.0), ('C6', 0.5), ('B5', 0.5), ('A5', 2.0),
        # Bar 7 (F)
        ('A5', 0.5), ('C6', 0.5), ('F6', 1.0), ('E6', 0.5), ('D6', 0.5), ('C6', 1.0),
        # Bar 8 (F)
        ('B5', 0.5), ('C6', 0.5), ('D6', 1.0), ('C6', 2.0),
    ]

    for i in range(total_samples):
        t = i / SAMPLE_RATE
        beat = t / beat_dur
        measure_idx = int(beat / 4) % measures
        sub_beat = beat % 4
        
        # 1. DRUMS
        # Kick on every beat
        kick_t = (beat % 1.0) * beat_dur
        kick_env = math.exp(-25.0 * kick_t)
        kick_val = math.sin(2 * math.pi * (130.0 * math.exp(-30.0 * kick_t)) * kick_t) * kick_env * 0.7
        
        # Snare on 2 and 4
        snare_t = ((beat - 1.0) % 2.0) * beat_dur
        snare_env = math.exp(-20.0 * snare_t) if snare_t >= 0 else 0
        snare_noise = (math.sin(t * 12345.678) * 0.5 + math.sin(t * 98765.432) * 0.5) * snare_env * 0.35
        snare_tone = math.sin(2 * math.pi * 180.0 * snare_t) * snare_env * 0.25
        
        # Hi-hat 8th notes
        hihat_t = (beat % 0.5) * beat_dur
        hihat_env = math.exp(-60.0 * hihat_t)
        hihat_val = (math.sin(t * 88888.8) * 0.5 + math.sin(t * 44444.4) * 0.5) * hihat_env * 0.12
        
        drums = kick_val + snare_noise + snare_tone + hihat_val
        
        # 2. BASS (Octave Bounce)
        b_note = bass_notes[measure_idx]
        b_freq = freq_from_note(b_note)
        if (beat % 0.5) > 0.25:
            b_freq *= 2.0 # Octave up on offbeat
        
        bass_env = math.exp(-6.0 * ((beat % 0.25) * beat_dur))
        phase_b = (t * b_freq) % 1.0
        bass_val = synth_wave('saw', phase_b) * bass_env * 0.3
        
        # 3. CHORDS (Upbeat Synth-Pluck)
        c_notes = chords[measure_idx]
        chord_val = 0.0
        # Stab on offbeats (0.5, 1.5, 2.5, 3.5)
        if 0.4 < (sub_beat % 1.0) < 0.9:
            ch_env = math.exp(-8.0 * (((sub_beat % 1.0) - 0.4) * beat_dur))
            for cn in c_notes:
                cf = freq_from_note(cn)
                p = (t * cf) % 1.0
                chord_val += synth_wave('saw', p) * 0.08 * ch_env
        
        # 4. LEAD MELODY
        # Find active melody note
        m_t = 0.0
        m_val = 0.0
        for mn, mdur in melody_notes:
            note_start = m_t
            note_end = m_t + mdur
            if note_start <= beat < note_end:
                mf = freq_from_note(mn)
                local_t = (beat - note_start) * beat_dur
                m_env = math.exp(-3.0 * local_t) * (1.0 - math.exp(-40.0 * local_t))
                p = (t * mf) % 1.0
                p_detune = (t * (mf * 1.003)) % 1.0
                m_val = (synth_wave('saw', p) + synth_wave('square', p_detune)) * 0.18 * m_env
                break
            m_t += mdur
            
        sample = drums + bass_val + chord_val + m_val
        left[i] = clamp(sample * 0.8)
        right[i] = clamp(sample * 0.8)

    write_wav(filename_wav, left, right)

def generate_ahli(filename_wav):
    # 140 BPM Driving Techno / Eurobeat Arcade Battle
    bpm = 140
    beat_dur = 60.0 / bpm  # 0.4285 sec
    measures = 8
    total_dur = measures * 4 * beat_dur # ~13.7 sec
    total_samples = int(SAMPLE_RATE * total_dur)
    
    left = [0.0] * total_samples
    right = [0.0] * total_samples
    
    # Am - F - C - G (1 bar each, repeated 2x)
    chords_bars = [
        ['A3', 'C4', 'E4', 'A4'],
        ['F3', 'A3', 'C4', 'F4'],
        ['C4', 'E4', 'G4', 'C5'],
        ['G3', 'B3', 'D4', 'G4'],
        ['A3', 'C4', 'E4', 'A4'],
        ['F3', 'A3', 'C4', 'F4'],
        ['C4', 'E4', 'G4', 'C5'],
        ['E3', 'G#3', 'B3', 'E4'], # Turnaround E major for epic feel
    ]
    
    bass_roots = ['A2', 'F2', 'C3', 'G2', 'A2', 'F2', 'C3', 'E2']

    # Eurobeat Fast Arpeggio Lead Notes (16th notes = 4 per beat)
    # 8 measures x 16 sixteenths = 128 notes
    arp_patterns = [
        # Am
        'A5', 'C6', 'E6', 'A6', 'E6', 'C6', 'A5', 'C6', 'A5', 'C6', 'E6', 'A6', 'E6', 'C6', 'B5', 'C6',
        # F
        'F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'F5', 'A5', 'F5', 'A5', 'C6', 'F6', 'C6', 'A5', 'G5', 'A5',
        # C
        'G5', 'C6', 'E6', 'G6', 'E6', 'C6', 'G5', 'C6', 'G5', 'C6', 'E6', 'G6', 'E6', 'C6', 'D6', 'E6',
        # G
        'D5', 'G5', 'B5', 'D6', 'B5', 'G5', 'D5', 'G5', 'E6', 'D6', 'C6', 'B5', 'A5', 'G5', 'F#5', 'G5',
        # Am
        'A5', 'E6', 'A6', 'E6', 'C6', 'E6', 'A6', 'E6', 'B5', 'E6', 'G#6', 'E6', 'B5', 'E6', 'G#6', 'E6',
        # F
        'A5', 'F6', 'A6', 'F6', 'C6', 'F6', 'A6', 'F6', 'F5', 'C6', 'F6', 'C6', 'A5', 'C6', 'F6', 'C6',
        # C
        'G5', 'E6', 'G6', 'E6', 'C6', 'E6', 'G6', 'E6', 'G5', 'D6', 'G6', 'D6', 'B5', 'D6', 'G6', 'D6',
        # E (Turnaround climax)
        'E5', 'G#5', 'B5', 'E6', 'G#6', 'E6', 'B5', 'G#5', 'E6', 'B5', 'G#6', 'B5', 'E7', 'D7', 'C7', 'B6',
    ]

    for i in range(total_samples):
        t = i / SAMPLE_RATE
        beat = t / beat_dur
        measure_idx = int(beat / 4) % measures
        sub_beat = beat % 4
        
        # 1. EUROBEAT DRUMS
        # Hard driving Kick on every beat
        kick_t = (beat % 1.0) * beat_dur
        kick_env = math.exp(-22.0 * kick_t)
        kick_val = math.sin(2 * math.pi * (160.0 * math.exp(-35.0 * kick_t)) * kick_t) * kick_env * 0.8
        
        # Snappy eurobeat snare on 2 and 4
        snare_t = ((beat - 1.0) % 2.0) * beat_dur
        snare_env = math.exp(-25.0 * snare_t) if snare_t >= 0 else 0
        snare_noise = (math.sin(t * 99999.0) * 0.5 + math.sin(t * 33333.0) * 0.5) * snare_env * 0.4
        snare_tone = math.sin(2 * math.pi * 220.0 * snare_t) * snare_env * 0.3
        
        # Open hi-hat on every offbeat (0.5, 1.5, 2.5, 3.5)
        hat_t = ((beat - 0.5) % 1.0) * beat_dur
        hat_env = math.exp(-35.0 * hat_t) if hat_t >= 0 else 0
        hat_val = (math.sin(t * 77777.7) * 0.5 + math.sin(t * 22222.2) * 0.5) * hat_env * 0.2
        
        drums = kick_val + snare_noise + snare_tone + hat_val
        
        # 2. FAST SAWTOOTH BASS (16th notes rolling techno bass)
        sixteenth = int(beat * 4)
        sixteenth_sub = (beat * 4) % 1.0
        bass_note = bass_roots[measure_idx]
        bf = freq_from_note(bass_note)
        bass_env = math.exp(-12.0 * (sixteenth_sub * (beat_dur / 4.0)))
        pb1 = (t * bf) % 1.0
        pb2 = (t * (bf * 1.005)) % 1.0
        bass_val = (synth_wave('saw', pb1) + synth_wave('saw', pb2)) * 0.22 * bass_env
        
        # 3. EUROBEAT BRASS STABS
        chord_val = 0.0
        # Brass stabs on 1.0, 1.75, 2.5, 3.25
        sub_16 = (beat * 4) % 16
        if sub_16 in [0, 3, 6, 10, 12]:
            st_t = (sixteenth_sub * (beat_dur / 4.0))
            st_env = math.exp(-8.0 * st_t)
            c_notes = chords_bars[measure_idx]
            for cn in c_notes:
                cf = freq_from_note(cn)
                p = (t * cf) % 1.0
                chord_val += synth_wave('saw', p) * 0.07 * st_env
                
        # 4. HIGH-SPEED EUROBEAT LEAD SYNTH (16th note arpeggios)
        arp_idx = sixteenth % len(arp_patterns)
        lead_note = arp_patterns[arp_idx]
        lf = freq_from_note(lead_note)
        lead_env = math.exp(-5.0 * (sixteenth_sub * (beat_dur / 4.0)))
        pl1 = (t * lf) % 1.0
        pl2 = (t * (lf * 1.002)) % 1.0
        pl3 = (t * (lf * 0.5)) % 1.0 # Sub octave accent
        lead_val = (synth_wave('saw', pl1) * 0.5 + synth_wave('square', pl2) * 0.3 + synth_wave('saw', pl3) * 0.2) * 0.22 * lead_env

        sample = drums + bass_val + chord_val + lead_val
        left[i] = clamp(sample * 0.85)
        right[i] = clamp(sample * 0.85)

    write_wav(filename_wav, left, right)

def write_wav(filename, left, right):
    with wave.open(filename, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for l, r in zip(left, right):
            il = int(l * 32767.0)
            ir = int(r * 32767.0)
            frames.extend(struct.pack('<hh', il, ir))
        wf.writeframes(frames)
    print(f"Wrote {filename}")

if __name__ == '__main__':
    os.makedirs('public/bgm', exist_ok=True)
    generate_pemula('public/bgm/bgm-pemula.wav')
    generate_ahli('public/bgm/bgm-ahli.wav')
    
    subprocess.run(['ffmpeg', '-y', '-i', 'public/bgm/bgm-pemula.wav', '-b:a', '192k', 'public/bgm/bgm-pemula.mp3'], check=True)
    subprocess.run(['ffmpeg', '-y', '-i', 'public/bgm/bgm-ahli.wav', '-b:a', '192k', 'public/bgm/bgm-ahli.mp3'], check=True)
    
    os.remove('public/bgm/bgm-pemula.wav')
    os.remove('public/bgm/bgm-ahli.wav')
    print("Successfully encoded bgm-pemula.mp3 and bgm-ahli.mp3!")
