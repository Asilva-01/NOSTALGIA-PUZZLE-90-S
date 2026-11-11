export type SfxKind = 'pickup' | 'snap' | 'join' | 'complete' | 'error' | 'help';
export type SfxTheme = 'nostalgia' | 'bible';

export type ToneVoice = {
  kind: 'tone';
  type: OscillatorType;
  frequency: number;
  start: number;
  duration: number;
  gain: number;
  endFreq?: number;
};

export type NoiseVoice = {
  kind: 'noise';
  start: number;
  duration: number;
  gain: number;
  freq: number;
  q?: number;
};

export type SfxVoice = ToneVoice | NoiseVoice;

let context: AudioContext | null = null;
let master: GainNode | null = null;
let currentTheme: SfxTheme = 'nostalgia';

const MASTER_GAIN = 0.9;

export function setSfxTheme(theme: SfxTheme): void {
  currentTheme = theme;
}

export function getSfxTheme(): SfxTheme {
  return currentTheme;
}

export function sfxVoices(theme: SfxTheme, kind: SfxKind): readonly SfxVoice[] {
  return THEMES[theme][kind];
}

const THEMES: Record<SfxTheme, Record<SfxKind, readonly SfxVoice[]>> = {
  nostalgia: {
    pickup: [
      { kind: 'noise', start: 0, duration: 0.04, gain: 0.07, freq: 1800, q: 1.1 },
      {
        kind: 'tone',
        type: 'square',
        frequency: 392,
        endFreq: 523,
        start: 0,
        duration: 0.08,
        gain: 0.12,
      },
    ],
    snap: [
      { kind: 'noise', start: 0, duration: 0.03, gain: 0.08, freq: 2400, q: 2.4 },
      {
        kind: 'tone',
        type: 'square',
        frequency: 784,
        start: 0,
        duration: 0.09,
        gain: 0.13,
      },
      {
        kind: 'tone',
        type: 'square',
        frequency: 1175,
        start: 0.05,
        duration: 0.11,
        gain: 0.1,
      },
    ],
    join: [
      {
        kind: 'tone',
        type: 'square',
        frequency: 523,
        start: 0,
        duration: 0.1,
        gain: 0.12,
      },
      {
        kind: 'tone',
        type: 'square',
        frequency: 784,
        start: 0.08,
        duration: 0.14,
        gain: 0.11,
      },
    ],
    complete: [
      {
        kind: 'tone',
        type: 'square',
        frequency: 523,
        start: 0,
        duration: 0.16,
        gain: 0.12,
      },
      {
        kind: 'tone',
        type: 'square',
        frequency: 659,
        start: 0.1,
        duration: 0.16,
        gain: 0.12,
      },
      {
        kind: 'tone',
        type: 'square',
        frequency: 784,
        start: 0.2,
        duration: 0.16,
        gain: 0.12,
      },
      {
        kind: 'tone',
        type: 'square',
        frequency: 1047,
        start: 0.3,
        duration: 0.28,
        gain: 0.13,
      },
    ],
    error: [
      {
        kind: 'tone',
        type: 'sawtooth',
        frequency: 196,
        endFreq: 98,
        start: 0,
        duration: 0.2,
        gain: 0.1,
      },
    ],
    help: [
      {
        kind: 'tone',
        type: 'square',
        frequency: 988,
        start: 0,
        duration: 0.09,
        gain: 0.11,
      },
      {
        kind: 'tone',
        type: 'square',
        frequency: 1319,
        start: 0.05,
        duration: 0.12,
        gain: 0.09,
      },
    ],
  },
  bible: {
    pickup: [
      { kind: 'noise', start: 0, duration: 0.06, gain: 0.1, freq: 220, q: 0.7 },
      {
        kind: 'tone',
        type: 'sine',
        frequency: 196,
        endFreq: 174,
        start: 0,
        duration: 0.12,
        gain: 0.16,
      },
    ],
    snap: [
      {
        kind: 'tone',
        type: 'sine',
        frequency: 523,
        start: 0,
        duration: 0.36,
        gain: 0.2,
      },
      {
        kind: 'tone',
        type: 'triangle',
        frequency: 784,
        start: 0.02,
        duration: 0.28,
        gain: 0.1,
      },
    ],
    join: [
      {
        kind: 'tone',
        type: 'sine',
        frequency: 349,
        start: 0,
        duration: 0.22,
        gain: 0.18,
      },
      {
        kind: 'tone',
        type: 'sine',
        frequency: 440,
        start: 0.1,
        duration: 0.26,
        gain: 0.16,
      },
    ],
    complete: [
      {
        kind: 'tone',
        type: 'sine',
        frequency: 392,
        start: 0,
        duration: 0.4,
        gain: 0.18,
      },
      {
        kind: 'tone',
        type: 'sine',
        frequency: 523,
        start: 0.14,
        duration: 0.42,
        gain: 0.18,
      },
      {
        kind: 'tone',
        type: 'triangle',
        frequency: 659,
        start: 0.28,
        duration: 0.46,
        gain: 0.14,
      },
      {
        kind: 'tone',
        type: 'sine',
        frequency: 784,
        start: 0.42,
        duration: 0.55,
        gain: 0.16,
      },
    ],
    error: [
      {
        kind: 'tone',
        type: 'triangle',
        frequency: 165,
        endFreq: 110,
        start: 0,
        duration: 0.28,
        gain: 0.14,
      },
    ],
    help: [
      {
        kind: 'tone',
        type: 'sine',
        frequency: 659,
        start: 0,
        duration: 0.22,
        gain: 0.16,
      },
      {
        kind: 'tone',
        type: 'sine',
        frequency: 880,
        start: 0.08,
        duration: 0.28,
        gain: 0.12,
      },
    ],
  },
};

function ctx(): AudioContext | null {
  if (typeof AudioContext === 'undefined') {
    return null;
  }
  if (!context) {
    context = new AudioContext();
  }
  return context;
}

function masterNode(audio: AudioContext): GainNode {
  if (!master || master.context !== audio) {
    master = audio.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(audio.destination);
  }
  return master;
}

export function unlockAudio(): void {
  const audio = ctx();
  if (!audio) return;
  masterNode(audio).gain.setValueAtTime(MASTER_GAIN, audio.currentTime);
  if (audio.state === 'suspended') {
    void audio.resume();
  }
}

/** Corta o áudio na hora — usado ao desligar o som. */
export function silenceAudio(): void {
  if (!context || !master) return;
  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.setValueAtTime(0, context.currentTime);
}

function tone(audio: AudioContext, destination: AudioNode, voice: ToneVoice, now: number): void {
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  const start = now + voice.start;
  osc.type = voice.type;
  osc.frequency.setValueAtTime(voice.frequency, start);
  if (voice.endFreq !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, voice.endFreq), start + voice.duration);
  }
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(voice.gain, start + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + voice.duration);
  osc.connect(amp);
  amp.connect(destination);
  osc.start(start);
  osc.stop(start + voice.duration + 0.02);
}

function noiseBurst(
  audio: AudioContext,
  destination: AudioNode,
  voice: NoiseVoice,
  now: number,
): void {
  const length = Math.max(1, Math.floor(audio.sampleRate * voice.duration));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = voice.freq;
  filter.Q.value = voice.q ?? 1.4;
  const amp = audio.createGain();
  const start = now + voice.start;
  amp.gain.setValueAtTime(voice.gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + voice.duration);
  src.connect(filter);
  filter.connect(amp);
  amp.connect(destination);
  src.start(start);
  src.stop(start + voice.duration + 0.01);
}

export function playSfx(kind: SfxKind, enabled = true, theme: SfxTheme = currentTheme): void {
  if (!enabled) return;
  const audio = ctx();
  if (!audio) return;
  const destination = masterNode(audio);
  destination.gain.setValueAtTime(MASTER_GAIN, audio.currentTime);
  void audio.resume();
  const now = audio.currentTime;
  for (const voice of sfxVoices(theme, kind)) {
    if (voice.kind === 'tone') {
      tone(audio, destination, voice, now);
    } else {
      noiseBurst(audio, destination, voice, now);
    }
  }
}

/** @deprecated use playSfx */
export function beep(kind: 'snap' | 'complete' | 'ui', enabled = true, theme?: SfxTheme): void {
  if (kind === 'ui') {
    playSfx('help', enabled, theme);
    return;
  }
  playSfx(kind, enabled, theme);
}

export function resetAudioForTests(): void {
  context = null;
  master = null;
  currentTheme = 'nostalgia';
}
