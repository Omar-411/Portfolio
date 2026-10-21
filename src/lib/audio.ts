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

function blip({ from, to = from, duration, volume, type = "square", delay = 0 }: BlipOptions): void {
  if (!context || context.state !== "running" || isMuted()) return;

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

export function playKey(): void {
  blip({ from: 1500 + Math.random() * 500, to: 500, duration: 0.04, volume: 0.07 });
}

export function playBoot(): void {
  blip({ from: 110, to: 520, duration: 0.28, volume: 0.1, type: "sawtooth" });
}

export function playSuccess(): void {
  blip({ from: 660, duration: 0.14, volume: 0.12, type: "sine" });
  blip({ from: 990, duration: 0.22, volume: 0.12, type: "sine", delay: 0.12 });
}

export function playHover(): void {
  blip({ from: 880, to: 1320, duration: 0.05, volume: 0.035, type: "sine" });
}

export function playClick(): void {
  blip({ from: 620, to: 260, duration: 0.07, volume: 0.1, type: "triangle" });
}
