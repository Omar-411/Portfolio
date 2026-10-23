"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  createStreams,
  GLYPH_SIZE,
  headY,
  isStreamDone,
  revealProgress,
  shouldPlayNameRain,
  TRAIL_ROWS,
  type Stream,
} from "./name-rain";

const PLAYED_KEY = "portfolio:name-rain";
const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモ0123456789@#$%&*<>/\\|[]{}";
const SAFETY_MS = 4000;

function alreadyPlayed(): boolean {
  try {
    return window.sessionStorage.getItem(PLAYED_KEY) === "1";
  } catch {
    return false;
  }
}

function markPlayed(): void {
  try {
    window.sessionStorage.setItem(PLAYED_KEY, "1");
  } catch {
    // Private mode: the rain simply plays again next visit.
  }
}

interface LetterRun {
  element: HTMLElement;
  streams: Stream[];
  width: number;
  bottom: number;
}

interface AnimatedNameProps {
  first: string;
  last: string;
}

/** The hero title. On a first visit its letters are painted by glyphs falling out of the matrix rain. The heading carries the full name as its label, so the per-letter spans stay out of the accessibility tree. */
export default function AnimatedName({ first, last }: AnimatedNameProps) {
  const root = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;
    const letters = Array.from(host.querySelectorAll<HTMLElement>("[data-letter]"));
    const title = host.getBoundingClientRect();

    const play = shouldPlayNameRain({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      alreadyPlayed: alreadyPlayed(),
      hash: window.location.hash,
      box: { top: title.top, bottom: title.bottom },
      viewportHeight: window.innerHeight,
    });
    if (!play) return;

    // Hidden before the first paint so the finished title never flashes ahead of the rain.
    for (const letter of letters) letter.style.clipPath = "inset(0 0 100% 0)";

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) {
      for (const letter of letters) letter.style.clipPath = "";
      return;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.setAttribute("aria-hidden", "true");
    canvas.className = "pointer-events-none fixed inset-0 z-[15] h-full w-full";
    document.body.appendChild(canvas);
    context.scale(dpr, dpr);
    context.font = `${GLYPH_SIZE}px monospace`;

    const runs: LetterRun[] = letters.map((element) => {
      const rect = element.getBoundingClientRect();
      const wordIndex = Number(element.dataset.word);
      const letterIndex = Number(element.dataset.letter);
      return {
        element,
        width: rect.width,
        bottom: rect.bottom,
        streams: createStreams(rect, letterIndex, wordIndex, Math.random),
      };
    });

    let frame = 0;
    let finished = false;
    const startedAt = performance.now();

    const finish = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      window.clearTimeout(safety);
      window.removeEventListener("resize", finish);
      canvas.remove();
      for (const { element } of runs) {
        element.style.clipPath = "";
        element.classList.add("name-settle");
      }
    };

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      let running = false;

      for (const run of runs) {
        const rect = run.element.getBoundingClientRect();
        const heads = run.streams.map((stream) => headY(stream, elapsed));
        const progress = revealProgress(heads, rect);
        run.element.style.clipPath = `inset(0 0 ${(1 - progress) * 100}% 0)`;

        run.streams.forEach((stream, index) => {
          if (isStreamDone(stream, elapsed, rect.bottom)) return;
          running = true;
          const x = rect.left + stream.offsetX;
          for (let row = 0; row < TRAIL_ROWS; row++) {
            const y = heads[index] - row * GLYPH_SIZE;
            if (y < 0 || y > rect.bottom) continue;
            context.globalAlpha = 1 - row / TRAIL_ROWS;
            context.fillStyle = row === 0 ? "#ffffff" : "#00ff6a";
            context.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x - GLYPH_SIZE / 2, y);
          }
        });
      }
      context.globalAlpha = 1;

      if (running) {
        frame = requestAnimationFrame(tick);
      } else {
        markPlayed();
        finish();
      }
    };

    const safety = window.setTimeout(finish, SAFETY_MS);
    window.addEventListener("resize", finish);
    frame = requestAnimationFrame(tick);

    return finish;
  }, []);

  const word = (text: string, wordIndex: number, className?: string) => (
    <span className="block">
      {Array.from(text).map((char, letterIndex) => (
        <span key={letterIndex} data-word={wordIndex} data-letter={letterIndex} className={cn("inline-block", className)}>
          {char}
        </span>
      ))}
    </span>
  );

  return (
    <span ref={root} className="block">
      {word(first, 0)}
      {word(last, 1, "text-aurora")}
    </span>
  );
}
