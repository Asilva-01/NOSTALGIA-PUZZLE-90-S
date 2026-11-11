export type SfxKind = 'pickup' | 'snap' | 'join' | 'complete' | 'error' | 'help';

let context: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof AudioContext === 'undefined') {
    return null;
  }
  if (!context) {
    context = new AudioContext();
  }
  return context;
}

export function unlockAudio(): void {
  const audio = ctx();
  if (!audio) return;
  if (audio.state === 'suspended') {
    void audio.resume();
  }
}

function tone(
  audio: AudioContext,
  options: {
    type: OscillatorType;
    frequency: number;
    start: number;
    duration: number;
    gain: number;
    endFreq?: number;
  },
): void {
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = options.type;
  osc.frequency.setValueAtTime(options.frequency, options.start);
  if (options.endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, options.endFreq),
      options.start + options.duration,
    );
  }
  amp.gain.setValueAtTime(0.0001, options.start);
  amp.gain.exponentialRampToValueAtTime(options.gain, options.start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, options.start + options.duration);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(options.start);
  osc.stop(options.start + options.duration + 0.02);
}

function noiseBurst(
  audio: AudioContext,
  options: {
    start: number;
    duration: number;
    gain: number;
    freq: number;
    q?: number;
  },
): void {
  const length = Math.max(1, Math.floor(audio.sampleRate * options.duration));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = options.freq;
  filter.Q.value = options.q ?? 1.4;
  const amp = audio.createGain();
  amp.gain.setValueAtTime(options.gain, options.start);
  amp.gain.exponentialRampToValueAtTime(0.0001, options.start + options.duration);
  src.connect(filter);
  filter.connect(amp);
  amp.connect(audio.destination);
  src.start(options.start);
  src.stop(options.start + options.duration + 0.01);
}

export function playSfx(kind: SfxKind, enabled = false): void {
  if (!enabled) return;
  const audio = ctx();
  if (!audio) return;
  void audio.resume();
  const now = audio.currentTime;

  if (kind === 'pickup') {
    noiseBurst(audio, { start: now, duration: 0.05, gain: 0.045, freq: 420, q: 0.8 });
    tone(audio, {
      type: 'triangle',
      frequency: 210,
      start: now,
      duration: 0.09,
      gain: 0.05,
      endFreq: 160,
    });
    return;
  }

  if (kind === 'snap') {
    noiseBurst(audio, { start: now, duration: 0.04, gain: 0.07, freq: 1800, q: 2.2 });
    tone(audio, {
      type: 'sine',
      frequency: 660,
      start: now,
      duration: 0.14,
      gain: 0.055,
    });
    tone(audio, {
      type: 'triangle',
      frequency: 990,
      start: now + 0.04,
      duration: 0.12,
      gain: 0.03,
    });
    return;
  }

  if (kind === 'join') {
    tone(audio, {
      type: 'sine',
      frequency: 392,
      start: now,
      duration: 0.12,
      gain: 0.05,
    });
    tone(audio, {
      type: 'sine',
      frequency: 523,
      start: now + 0.07,
      duration: 0.16,
      gain: 0.05,
    });
    return;
  }

  if (kind === 'complete') {
    const notes = [523, 659, 784, 1046];
    notes.forEach((frequency, index) => {
      tone(audio, {
        type: 'triangle',
        frequency,
        start: now + index * 0.11,
        duration: 0.28,
        gain: 0.05,
      });
    });
    return;
  }

  if (kind === 'error') {
    tone(audio, {
      type: 'square',
      frequency: 180,
      start: now,
      duration: 0.16,
      gain: 0.03,
      endFreq: 110,
    });
    return;
  }

  tone(audio, {
    type: 'sine',
    frequency: 880,
    start: now,
    duration: 0.16,
    gain: 0.035,
  });
  tone(audio, {
    type: 'sine',
    frequency: 1320,
    start: now + 0.05,
    duration: 0.18,
    gain: 0.025,
  });
}

/** @deprecated use playSfx */
export function beep(kind: 'snap' | 'complete' | 'ui', enabled = false): void {
  if (kind === 'ui') {
    playSfx('help', enabled);
    return;
  }
  playSfx(kind, enabled);
}
