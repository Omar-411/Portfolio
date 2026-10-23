/**
 * Tiny Web Audio helper. Browsers keep an AudioContext "suspended" until the
 * user interacts with the page, so `unlockAudio()` must be called from inside
 * a click / key handler. Sounds are silently skipped until then.
 */

const MUTE_KEY = "portfolio:muted";

type AudioContextCtor = typeof AudioContext;

interface BlipOptions {
  from: number;
  to?: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
  delay?: number;
}

let context: AudioContext | null = null;
let mutedFallback = false;

export function isMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return mutedFallback;
  }
}

export function setMuted(value: boolean): void {
  mutedFallback = value;
  try {
    window.localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // Storage can be unavailable (private mode); the in-memory flag still applies.
  }
}

export async function unlockAudio(): Promise<void> {
  if (typeof window === "undefined") return;

  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext;
  if (!Ctor) return;

  context ??= new Ctor();
  if (context.state === "suspended") await context.resume();
}

function ready(): boolean {
  return context !== null && context.state === "running" && !isMuted();
}

function blip({ from, to = from, duration, volume, type = "square", delay = 0 }: BlipOptions): void {
  if (!context || !ready()) return;

  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(from, start);
  if (to !== from) oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);

  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

interface NoiseOptions {
  freq: number;
  q: number;
  duration: number;
  volume: number;
  delay?: number;
  sweepTo?: number;
}

let noiseBuffer: AudioBuffer | null = null;

function getNoise(audio: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
}

/** A short burst of band-passed noise: the "clack" of metal and paper. */
function noise({ freq, q, duration, volume, delay = 0, sweepTo }: NoiseOptions): void {
  if (!context || !ready()) return;

  const start = context.currentTime + delay;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const gain = context.createGain();

  source.buffer = getNoise(context);
  filter.type = "bandpass";
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freq, start);
  if (sweepTo) filter.frequency.exponentialRampToValueAtTime(sweepTo, start + duration);

  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start(start, Math.random() * 0.5);
  source.stop(start + duration + 0.02);
}

export type TypewriterKey = "key" | "space" | "backspace" | "enter";

/** Typewriter: key strike + low thump + metal clack. Slightly randomised so it never sounds looped. */
export function playKey(kind: TypewriterKey = "key"): void {
  const jitter = 0.85 + Math.random() * 0.3;

  switch (kind) {
    case "space":
      noise({ freq: 900 * jitter, q: 0.8, duration: 0.06, volume: 0.35 });
      blip({ from: 110 * jitter, to: 45, duration: 0.09, volume: 0.25, type: "sine" });
      break;
    case "backspace":
      noise({ freq: 1500 * jitter, q: 1, duration: 0.035, volume: 0.25 });
      blip({ from: 200 * jitter, to: 90, duration: 0.05, volume: 0.1, type: "sine" });
      break;
    case "enter":
      // Carriage slides back, hits the stop, then the bell rings.
      noise({ freq: 1400, q: 0.7, duration: 0.22, volume: 0.18, sweepTo: 400 });
      noise({ freq: 1000, q: 0.8, duration: 0.07, volume: 0.4, delay: 0.22 });
      blip({ from: 120, to: 50, duration: 0.1, volume: 0.3, type: "sine", delay: 0.22 });
      blip({ from: 2400, duration: 0.7, volume: 0.07, type: "sine", delay: 0.25 });
      blip({ from: 4800, duration: 0.4, volume: 0.025, type: "sine", delay: 0.25 });
      break;
    default:
      noise({ freq: 2200 * jitter, q: 1.2, duration: 0.03, volume: 0.3 });
      blip({ from: 150 * jitter, to: 60, duration: 0.05, volume: 0.16, type: "sine" });
      noise({ freq: 5000, q: 3, duration: 0.02, volume: 0.1, delay: 0.012 });
  }
}

export function playBoot(): void {
  blip({ from: 110, to: 520, duration: 0.28, volume: 0.1, type: "sawtooth" });
}

export function playSuccess(): void {
  blip({ from: 660, duration: 0.14, volume: 0.12, type: "sine" });
  blip({ from: 990, duration: 0.22, volume: 0.12, type: "sine", delay: 0.12 });
}

/** A short rising sweep of filtered noise for the page-change wipe. */
export function playScan(): void {
  noise({ freq: 300, q: 1.5, duration: 0.32, volume: 0.22, sweepTo: 3200 });
  blip({ from: 180, to: 720, duration: 0.3, volume: 0.04, type: "sawtooth" });
}

export function playHover(): void {
  blip({ from: 880, to: 1320, duration: 0.05, volume: 0.035, type: "sine" });
}

export function playClick(): void {
  blip({ from: 620, to: 260, duration: 0.07, volume: 0.1, type: "triangle" });
}
