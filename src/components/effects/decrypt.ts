const FIRST_REVEAL_MS = 220;
const MAX_SPREAD_MS = 900;
const MAX_STEP_MS = 55;
const JITTER_MS = 110;

/** When each character settles. Spaces are never scrambled. Left to right, with a little jitter. */
export function planReveal(text: string, random: () => number): number[] {
  const letters = Array.from(text).filter((char) => char !== " ").length;
  const step = Math.min(MAX_STEP_MS, MAX_SPREAD_MS / Math.max(1, letters));
  let seen = 0;
  return Array.from(text).map((char) => {
    if (char === " ") return 0;
    return FIRST_REVEAL_MS + seen++ * step + random() * JITTER_MS;
  });
}

/** The text `elapsedMs` into the effect: settled characters are real, the rest come from `scramble`. */
export function decryptFrame(text: string, plan: number[], elapsedMs: number, scramble: string[]): string[] {
  return Array.from(text).map((char, index) => (char === " " || elapsedMs >= plan[index] ? char : scramble[index]));
}

export function isDecrypted(plan: number[], elapsedMs: number): boolean {
  return plan.every((at) => elapsedMs >= at);
}
