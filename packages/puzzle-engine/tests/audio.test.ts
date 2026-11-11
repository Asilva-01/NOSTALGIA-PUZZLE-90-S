import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  playSfx,
  resetAudioForTests,
  setSfxTheme,
  sfxVoices,
  silenceAudio,
  type SfxKind,
  type SfxTheme,
} from '../src/audio.ts';

const KINDS: SfxKind[] = ['pickup', 'snap', 'join', 'complete', 'error', 'help'];
const THEMES: SfxTheme[] = ['nostalgia', 'bible'];

function identity(theme: SfxTheme, kind: SfxKind): string {
  return JSON.stringify(sfxVoices(theme, kind));
}

function fakeAudioContext() {
  const oscillator = {
    type: 'sine',
    frequency: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const gain = {
    gain: {
      value: 1,
      setValueAtTime: vi.fn(),
      cancelScheduledValues: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    context: null as unknown,
  };
  const filter = {
    type: 'bandpass',
    frequency: { value: 0 },
    Q: { value: 0 },
    connect: vi.fn(),
  };
  const bufferSource = {
    buffer: null as unknown,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const buffer = {
    getChannelData: () => new Float32Array(8),
  };
  const destination = {};
  class FakeAudioContext {
    state = 'running';
    currentTime = 1;
    sampleRate = 44100;
    destination = destination;
    resume = vi.fn(async () => undefined);
    createOscillator = vi.fn(() => oscillator);
    createGain = vi.fn(() => {
      gain.context = this;
      return gain;
    });
    createBiquadFilter = vi.fn(() => filter);
    createBuffer = vi.fn(() => buffer);
    createBufferSource = vi.fn(() => bufferSource);
  }
  return { FakeAudioContext, oscillator, gain, bufferSource };
}

describe('paletas de som', () => {
  afterEach(() => {
    resetAudioForTests();
    vi.unstubAllGlobals();
  });

  it('cobre os eventos existentes com bancos distintos por app', () => {
    for (const kind of KINDS) {
      expect(sfxVoices('nostalgia', kind).length).toBeGreaterThan(0);
      expect(sfxVoices('bible', kind).length).toBeGreaterThan(0);
      expect(identity('nostalgia', kind)).not.toBe(identity('bible', kind));
    }
    const nostalgiaTypes = new Set(
      sfxVoices('nostalgia', 'snap').flatMap((voice) => (voice.kind === 'tone' ? [voice.type] : [])),
    );
    const bibleTypes = new Set(
      sfxVoices('bible', 'snap').flatMap((voice) => (voice.kind === 'tone' ? [voice.type] : [])),
    );
    expect(nostalgiaTypes.has('square')).toBe(true);
    expect(bibleTypes.has('sine') || bibleTypes.has('triangle')).toBe(true);
  });

  it('não toca nada com o som desligado', () => {
    const { FakeAudioContext, oscillator, bufferSource } = fakeAudioContext();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    setSfxTheme('nostalgia');
    playSfx('snap', false, 'nostalgia');
    playSfx('help', false, 'bible');
    expect(oscillator.start).not.toHaveBeenCalled();
    expect(bufferSource.start).not.toHaveBeenCalled();
  });

  it('toca a paleta do tema ativo quando o som está ligado', () => {
    const { FakeAudioContext, oscillator } = fakeAudioContext();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    playSfx('join', true, 'nostalgia');
    expect(oscillator.start).toHaveBeenCalled();
    const nostalgiaFreq = oscillator.frequency.setValueAtTime.mock.calls.map((call) => call[0]);
    expect(nostalgiaFreq).toContain(523);
    resetAudioForTests();
    oscillator.frequency.setValueAtTime.mockClear();
    oscillator.start.mockClear();
    playSfx('join', true, 'bible');
    expect(oscillator.start).toHaveBeenCalled();
    const bibleFreq = oscillator.frequency.setValueAtTime.mock.calls.map((call) => call[0]);
    expect(bibleFreq).toContain(349);
    expect(bibleFreq).not.toEqual(nostalgiaFreq);
  });

  it('silencia na hora ao desligar', () => {
    const { FakeAudioContext, gain } = fakeAudioContext();
    vi.stubGlobal('AudioContext', FakeAudioContext);
    playSfx('help', true, 'nostalgia');
    silenceAudio();
    expect(gain.gain.setValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('expõe um banco por tema para cada evento', () => {
    for (const theme of THEMES) {
      const snapshot = KINDS.map((kind) => identity(theme, kind)).join('|');
      const other = theme === 'nostalgia' ? 'bible' : 'nostalgia';
      const otherSnapshot = KINDS.map((kind) => identity(other, kind)).join('|');
      expect(snapshot).not.toBe(otherSnapshot);
    }
  });
});
