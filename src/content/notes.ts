export type NoteBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "code"; language: string; code: string };

export interface Note {
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  readingMinutes: number;
  blocks: NoteBlock[];
}

export const notes: Note[] = [
  {
    slug: "why-your-website-sound-is-silent",
    title: "Why your website's sound is silent (and the fix)",
    description:
      "Browsers refuse to play audio until the visitor interacts with the page. Here is what that means for an AudioContext and how to design around it.",
    date: "2026-10-21",
    readingMinutes: 3,
    blocks: [
      {
        type: "p",
        text: "I added keyboard sounds to a terminal-style intro and heard nothing. The code was fine. The browser was blocking it.",
      },
      { type: "h2", text: "The autoplay policy" },
      {
        type: "p",
        text: "Chrome, Safari and Firefox keep a new `AudioContext` in the `suspended` state until the user has clicked, tapped or pressed a key on the page. Timers, page loads and route changes don't count. Anything you schedule before that moment is silently dropped.",
      },
      { type: "h2", text: "The fix: unlock inside a gesture" },
      {
        type: "p",
        text: "Create one context lazily and call `resume()` from inside a real event handler. Everything after that plays normally.",
      },
      {
        type: "code",
        language: "ts",
        code: `let context: AudioContext | null = null;

export async function unlockAudio() {
  context ??= new AudioContext();
  if (context.state === "suspended") await context.resume();
}

// Must run inside the click / keydown handler:
button.addEventListener("click", () => void unlockAudio());`,
      },
      { type: "h2", text: "Design around it" },
      {
        type: "ul",
        items: [
          "Make the first interaction meaningful: a \"press ENTER to boot\" prompt unlocks audio and feels intentional.",
          "Keep a single AudioContext. Browsers cap how many can exist, and one per sound leaks.",
          "Skip sounds while the context isn't running instead of queueing them.",
          "Always offer a mute button and remember the choice.",
        ],
      },
      {
        type: "p",
        text: "On a direct visit to a deep page there is no prior gesture, so the very first click also has to unlock audio, then play its sound.",
      },
    ],
  },
  {
    slug: "a-typewriter-in-web-audio",
    title: "A typewriter in Web Audio, no samples",
    description:
      "A key strike, a low thump and a metal clack are enough to fake a typewriter. Here is the recipe, built from noise and oscillators.",
    date: "2026-10-21",
    readingMinutes: 3,
    blocks: [
      {
        type: "p",
        text: "Sample files add weight and licensing questions. A typewriter click is mostly filtered noise plus a short low thump, which Web Audio can generate in a few lines.",
      },
      { type: "h2", text: "Ingredients" },
      {
        type: "ul",
        items: [
          "**Strike:** a burst of white noise through a band-pass filter around 2 kHz, about 30 ms long.",
          "**Thump:** a sine sweeping from about 150 Hz down to 60 Hz in 50 ms.",
          "**Clack:** a second, tiny noise burst around 5 kHz a few milliseconds later.",
        ],
      },
      {
        type: "code",
        language: "ts",
        code: `function noise(ctx: AudioContext, freq: number, duration: number, volume: number) {
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx); // 1 second of Math.random() * 2 - 1

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(ctx.currentTime, Math.random() * 0.5);
  source.stop(ctx.currentTime + duration + 0.02);
}`,
      },
      { type: "h2", text: "Make it feel alive" },
      {
        type: "ul",
        items: [
          "Randomize pitch by about ±15% per key so it never sounds looped.",
          "Give Space a deeper, longer thump and Backspace a softer tap.",
          "For Enter, sweep noise downward for the carriage, add a heavy stop, then ring a high sine bell.",
          "Throttle to roughly one sound per 30 ms so fast typing stays clean.",
        ],
      },
      {
        type: "p",
        text: "Measure the peak level while you tune it. Mine stays between 12% and 38% of full scale, loud enough to notice and far from clipping.",
      },
    ],
  },
];

export const getNote = (slug: string) => notes.find((note) => note.slug === slug);
