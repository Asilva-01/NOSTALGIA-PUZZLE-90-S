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

export function beep(kind: 'snap' | 'complete' | 'ui'): void {
  const audio = ctx();
  if (!audio) return;
  void audio.resume();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = kind === 'complete' ? 'triangle' : 'sine';
  osc.frequency.value = kind === 'snap' ? 540 : kind === 'complete' ? 330 : 420;
  gain.gain.value = 0.05;
  osc.connect(gain);
  gain.connect(audio.destination);
  const now = audio.currentTime;
  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + (kind === 'complete' ? 0.45 : 0.12));
  osc.start(now);
  osc.stop(now + (kind === 'complete' ? 0.5 : 0.14));
  if (kind === 'complete') {
    const osc2 = audio.createOscillator();
    const gain2 = audio.createGain();
    osc2.type = 'triangle';
    osc2.frequency.value = 494;
    gain2.gain.value = 0.04;
    osc2.connect(gain2);
    gain2.connect(audio.destination);
    osc2.start(now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.stop(now + 0.55);
  }
}
