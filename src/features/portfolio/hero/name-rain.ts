export const GLYPH_SIZE = 16;
export const TRAIL_ROWS = 9;
const FALL_MS = 650;
const LETTER_STAGGER_MS = 105;
const WORD_STAGGER_MS = 160;

export interface Box {
  top: number;
  bottom: number;
}

export interface PlayContext {
  reducedMotion: boolean;
  alreadyPlayed: boolean;
  hash: string;
  box: Box;
  viewportHeight: number;
}

/** Only on the first visit of a session, at the top of the page, with the title actually on screen. */
export function shouldPlayNameRain({ reducedMotion, alreadyPlayed, hash, box, viewportHeight }: PlayContext): boolean {
  if (reducedMotion || alreadyPlayed) return false;
  if (hash !== "" && hash !== "#hero") return false;
  return box.top >= 0 && box.bottom <= viewportHeight;
}

export interface Stream {
  /** Horizontal offset from the left edge of the letter. */
  offsetX: number;
  delayMs: number;
  startY: number;
  /** px per second. */
  speed: number;
}

/**
 * One column of falling glyphs per GLYPH_SIZE of letter width. Letters of a word start left to right,
 * and each column gets a slightly different delay so the letter is painted rather than wiped.
 */
export function createStreams(
  letter: { width: number; bottom: number },
  letterIndex: number,
  wordIndex: number,
  random: () => number
): Stream[] {
  const startY = -TRAIL_ROWS * GLYPH_SIZE;
  const columns = Math.max(1, Math.ceil(letter.width / GLYPH_SIZE));

  return Array.from({ length: columns }, (_, column) => {
    const fallMs = FALL_MS * (0.85 + random() * 0.3);
    return {
      offsetX: column * GLYPH_SIZE + GLYPH_SIZE / 2,
      delayMs: wordIndex * WORD_STAGGER_MS + letterIndex * LETTER_STAGGER_MS + random() * 160,
      startY,
      speed: ((letter.bottom - startY) / fallMs) * 1000,
    };
  });
}

export function headY(stream: Stream, elapsedMs: number): number {
  return stream.startY + (stream.speed * Math.max(0, elapsedMs - stream.delayMs)) / 1000;
}

/** The stream is finished once its whole trail has passed below the letter. */
export function isStreamDone(stream: Stream, elapsedMs: number, letterBottom: number): boolean {
  return headY(stream, elapsedMs) - TRAIL_ROWS * GLYPH_SIZE > letterBottom;
}

/** 0 when the glyphs are above the letter, 1 once they have passed through it. */
export function revealProgress(heads: number[], box: Box): number {
  if (heads.length === 0) return 1;
  const mean = heads.reduce((sum, y) => sum + y, 0) / heads.length;
  return Math.min(1, Math.max(0, (mean - box.top) / (box.bottom - box.top)));
}
