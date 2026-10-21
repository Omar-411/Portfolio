"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import SoundToggle from "@/components/sound-toggle";
import { getPreferredLocale } from "@/i18n/client";
import { playBoot, playKey, playSuccess, unlockAudio } from "@/lib/audio";

const SEEN_KEY = "portfolio:intro-seen";

const BOOT_LINES = [
  "> initializing portfolio...",
  "> loading projects...",
  "> fetching skills...",
  "> establishing secure connection...",
  "> access granted",
] as const;

const CHAR_MS = 9;
const LINE_GAP_MS = 110;
const HOLD_MS = 300;
const EXIT_MS = 350;
const KEY_SOUND_INTERVAL_MS = 35;

// Each line starts typing once the previous one is done (+ a small gap).
const LINE_STARTS: number[] = [];
let totalMs = 0;
for (const line of BOOT_LINES) {
  LINE_STARTS.push(totalMs);
  totalMs += line.length * CHAR_MS + LINE_GAP_MS;
}
const TYPING_TOTAL_MS = totalMs;

const portfolioPath = () => `/${getPreferredLocale()}/portfolio`;

type Phase = "checking" | "gate" | "booting" | "leaving";

const fullCounts = () => BOOT_LINES.map((line) => line.length);
const emptyCounts = () => BOOT_LINES.map(() => 0);

function countsAt(elapsedMs: number): number[] {
  return BOOT_LINES.map((line, i) =>
    Math.max(0, Math.min(line.length, Math.floor((elapsedMs - LINE_STARTS[i]) / CHAR_MS)))
  );
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export default function IntroTerminal() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("checking");
  const [counts, setCounts] = useState<number[]>(emptyCounts);
  const leavingRef = useRef(false);

  const leave = useCallback(
    (withSound: boolean) => {
      if (leavingRef.current) return;
      leavingRef.current = true;
      if (withSound) playSuccess();
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Not critical: the intro simply plays again on the next visit.
      }
      setPhase("leaving");
      window.setTimeout(() => router.push(portfolioPath()), reduceMotion ? 0 : EXIT_MS);
    },
    [router, reduceMotion]
  );

  const start = useCallback(() => {
    // Must run inside the user gesture so the browser allows audio.
    void unlockAudio().then(playBoot);
    setPhase("booting");
  }, []);

  // Returning visitors skip straight to the portfolio.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      seen = false;
    }
    if (seen) {
      router.replace(portfolioPath());
      return;
    }
    router.prefetch(portfolioPath());
    setPhase("gate");
  }, [router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        leave(false);
        return;
      }
      if (phase === "gate" && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        start();
      } else if (phase === "booting" && event.key === "Enter") {
        leave(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, start, leave]);

  useEffect(() => {
    if (phase !== "booting") return;

    if (reduceMotion) {
      setCounts(fullCounts());
      const timer = window.setTimeout(() => leave(true), 600);
      return () => window.clearTimeout(timer);
    }

    let frame = 0;
    let startedAt: number | null = null;
    let lastTotal = 0;
    let lastKeySound = 0;

    const tick = (now: number) => {
      startedAt ??= now;
      const elapsed = now - startedAt;
      const next = countsAt(elapsed);
      const total = sum(next);

      if (total !== lastTotal) {
        lastTotal = total;
        setCounts(next);
        if (now - lastKeySound > KEY_SOUND_INTERVAL_MS) {
          lastKeySound = now;
          playKey();
        }
      }

      if (elapsed >= TYPING_TOTAL_MS + HOLD_MS) {
        leave(true);
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, reduceMotion, leave]);

  if (phase === "checking") {
    return <div className="fixed inset-0 bg-[#020b06]" aria-hidden="true" />;
  }

  const activeLine = counts.findIndex((count, i) => count < BOOT_LINES[i].length);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-[#020b06] transition-opacity duration-300 ${
        phase === "leaving" ? "opacity-0" : "opacity-100"
      }`}
    >
      <SoundToggle className="absolute right-4 top-4 rounded-md border border-[#00ff6a]/30 p-2 text-[#00ff6a]/70 transition-colors hover:text-[#00ff6a]" />

      <div
        onClick={phase === "gate" ? start : undefined}
        className={`relative flex h-[520px] max-h-[85dvh] w-[800px] max-w-[92vw] flex-col overflow-hidden rounded-sm border-2 border-[#00ff6a] bg-[#020b06] font-mono text-sm leading-relaxed text-[#00ff6a] shadow-[0_0_40px_rgba(0,255,106,0.3),0_0_80px_rgba(0,255,106,0.1)] ${
          phase === "gate" ? "cursor-pointer" : ""
        }`}
        style={{ fontFamily: "var(--font-jetbrains), monospace" }}
      >
        <div
          className="relative z-10 flex select-none items-center justify-between border-b border-[#00ff6a]/25 px-3 py-2"
          style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)" }}
          aria-hidden="true"
        >
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded bg-red-500/70" />
            <span className="h-3 w-3 rounded bg-yellow-500/70" />
            <span className="h-3 w-3 rounded bg-green-500/70" />
          </div>
          <span className="text-xs font-bold tracking-wider text-white/60">
            {"C:/Users/Omar> terminal.bash"}
          </span>
          <span className="w-12" />
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-[5] opacity-40"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
          }}
          aria-hidden="true"
        />

        <div className="relative z-[1] flex-1 overflow-y-auto px-4 py-3" aria-live="polite">
          {phase === "gate" ? (
            <p className="text-[#00ff6a]">
              {"> press ENTER to boot"}
              <span className="animate-blink-cursor">█</span>
            </p>
          ) : (
            BOOT_LINES.map((line, i) =>
              counts[i] > 0 ? (
                <p key={line} className="whitespace-pre text-[#00ff6a]/90">
                  {line.slice(0, counts[i])}
                  {i === activeLine && <span className="animate-blink-cursor">█</span>}
                </p>
              ) : null
            )
          )}
        </div>
      </div>

      <p className="text-xs text-[#00ff6a]/40">
        {phase === "gate" ? "click or press ENTER · " : ""}
        <button type="button" onClick={() => leave(false)} className="underline-offset-2 hover:underline">
          skip intro [esc]
        </button>
      </p>
    </div>
  );
}
