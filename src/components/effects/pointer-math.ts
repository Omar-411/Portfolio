export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface Tilt {
  /** Degrees. */
  rx: number;
  ry: number;
  /** Pointer position inside the card, 0..100 (%), for the light reflection. */
  px: number;
  py: number;
}

/** The edge nearest the pointer dips away, so the card appears to lean toward it. */
export function tiltFor(rect: Rect, x: number, y: number, maxDeg: number): Tilt {
  const px = clamp((x - rect.left) / rect.width, 0, 1);
  const py = clamp((y - rect.top) / rect.height, 0, 1);
  return { rx: -(py - 0.5) * 2 * maxDeg, ry: (px - 0.5) * 2 * maxDeg, px: px * 100, py: py * 100 };
}

export interface Pull {
  x: number;
  y: number;
}

interface PullOptions {
  /** How far outside the element the pull begins, in px. */
  reach?: number;
  /** Share of the pointer's distance from the centre the element follows. */
  strength?: number;
  max?: number;
}

/** `rect` must be the element's resting box, without the offset this function produced last time. */
export function pullFor(rect: Rect, x: number, y: number, { reach = 48, strength = 0.28, max = 10 }: PullOptions = {}): Pull | null {
  const near =
    x >= rect.left - reach &&
    x <= rect.left + rect.width + reach &&
    y >= rect.top - reach &&
    y <= rect.top + rect.height + reach;
  if (!near) return null;

  const dx = x - (rect.left + rect.width / 2);
  const dy = y - (rect.top + rect.height / 2);
  return { x: clamp(dx * strength, -max, max), y: clamp(dy * strength, -max, max) };
}
