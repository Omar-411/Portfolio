"use client";

import { useEffect, useRef } from "react";
import { randomGlyph } from "@/lib/glyphs";
import { cn } from "@/lib/utils";
import { decryptFrame, isDecrypted, planReveal } from "./decrypt";

const GLYPH_REFRESH_MS = 70;

interface DecryptTextProps {
  text: string;
  /** Applied to the real text and to every scrambled letter (the gradient clip cannot cross elements). */
  className?: string;
  delayMs?: number;
}

/** Per-character box widths of a text node, so the scrambled overlay lines up with the real text. */
function measureChars(node: Text): number[] {
  const range = document.createRange();
  return Array.from(node.data).map((_, index) => {
    range.setStart(node, index);
    range.setEnd(node, index + 1);
    return range.getBoundingClientRect().width;
  });
}

/**
 * Renders the real text, always. When it first scrolls into view, a scrambled copy is laid over it
 * and resolves letter by letter; then the overlay is removed. The overlay is hidden from assistive
 * technology, and with prefers-reduced-motion nothing happens.
 */
export default function DecryptText({ text, className, delayMs = 0 }: DecryptTextProps) {
  const root = useRef<HTMLSpanElement>(null);
  const real = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = root.current;
    const source = real.current;
    const node = source?.firstChild;
    if (!host || !source || !(node instanceof Text)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    let timer = 0;
    let overlay: HTMLSpanElement | null = null;

    const stop = () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      overlay?.remove();
      overlay = null;
      source.style.opacity = "";
    };

    const run = () => {
      const widths = measureChars(node);
      const chars = Array.from(text);
      const plan = planReveal(text, Math.random);

      overlay = document.createElement("span");
      overlay.setAttribute("aria-hidden", "true");
      overlay.className = "pointer-events-none absolute inset-0";

      // One nowrap box per word, so lines break exactly where the real text breaks.
      const letters: HTMLSpanElement[] = [];
      let word: HTMLSpanElement | null = null;
      chars.forEach((char, index) => {
        if (char === " ") {
          overlay!.append(" ");
          word = null;
          return;
        }
        if (!word) {
          word = document.createElement("span");
          word.className = "inline-block whitespace-nowrap";
          overlay!.append(word);
        }
        const letter = document.createElement("span");
        letter.className = cn("inline-block text-center", className);
        letter.style.width = `${widths[index]}px`;
        word.append(letter);
        letters.push(letter);
      });
      host.append(overlay);
      source.style.opacity = "0";

      const startedAt = performance.now();
      let lastRefresh = Number.NEGATIVE_INFINITY;
      let scramble: string[] = [];

      const tick = (now: number) => {
        const elapsed = now - startedAt;
        if (isDecrypted(plan, elapsed)) return stop();

        // New random glyphs a few times a second reads as decoding; every frame would just be noise.
        if (elapsed - lastRefresh >= GLYPH_REFRESH_MS) {
          lastRefresh = elapsed;
          scramble = chars.map(randomGlyph);
        }
        const shown = decryptFrame(text, plan, elapsed, scramble);
        let next = 0;
        shown.forEach((char) => {
          if (char === " ") return;
          letters[next++].textContent = char;
        });
        frame = requestAnimationFrame(tick);
      };
      tick(startedAt);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(run, delayMs);
      },
      { threshold: 0.6 }
    );
    observer.observe(host);

    return () => {
      observer.disconnect();
      stop();
    };
  }, [text, delayMs, className]);

  return (
    <span ref={root} className="relative inline-block">
      <span ref={real} className={className}>
        {text}
      </span>
    </span>
  );
}
